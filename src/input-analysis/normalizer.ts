/**
 * Input Normalizer Registry & Pipeline
 *
 * Coordinates multiple parsers, handles validation, and produces canonical specs.
 */

import {
  InputSpec,
  NormalizedSpec,
  ValidationResult,
  ValidationError,
  ValidationWarning,
} from "./types";
import { OpenAPIParser } from "./parsers/openapi";
import { ContractABIParser } from "./parsers/contract-abi";
import { ChainMetadataParser } from "./parsers/chain-metadata";
import { BaseParser } from "./base-parser";

export class InputNormalizer {
  private parsers: BaseParser[] = [];
  private readonly builtInTypes = new Set([
    "string",
    "number",
    "boolean",
    "bytes",
    "bigint",
    "timestamp",
    "null",
    "any",
    "integer",
    "Address",
    "BigInt",
    "Bytes32",
    "object",
    "array",
    "void",
    "unknown",
  ]);

  constructor() {
    // Register all built-in parsers
    this.registerParser(new OpenAPIParser());
    this.registerParser(new ContractABIParser());
    this.registerParser(new ChainMetadataParser());
  }

  /**
   * Register a custom parser
   */
  registerParser(parser: BaseParser): void {
    this.parsers.push(parser);
  }

  /**
   * Normalize raw input to canonical intermediate representation
   * Main entry point for the input analysis layer
   */
  normalize(input: InputSpec): NormalizationResult {
    // Find appropriate parser
    const parser = this.parsers.find((p) => p.canParse(input));

    if (!parser) {
      return {
        success: false,
        error: `No parser found for input type: ${input.type}`,
        warnings: [],
      };
    }

    // Parse the input
    const parseResult = parser.parse(input);

    if (!parseResult.success) {
      return {
        success: false,
        error: parseResult.errors[0]?.message || "Parsing failed",
        parseErrors: parseResult.errors,
        warnings: parseResult.warnings,
      };
    }

    if (!parseResult.normalized) {
      return {
        success: false,
        error: "Parser returned no normalized spec",
        warnings: parseResult.warnings,
      };
    }

    // Validate the normalized spec
    const validationResult = this.validateNormalizedSpec(parseResult.normalized);

    if (!validationResult.valid && validationResult.errors.length > 0) {
      return {
        success: false,
        error: `Validation failed: ${validationResult.errors[0].message}`,
        validationErrors: validationResult.errors,
        warnings: [...parseResult.warnings, ...validationResult.warnings.map((w) => ({
          level: w.severity === "major" ? ("error" as const) : ("warning" as const),
          code: w.code,
          message: w.message,
          location: w.path,
        }))],
      };
    }

    // Success
    return {
      success: true,
      spec: parseResult.normalized,
      warnings: [...parseResult.warnings, ...validationResult.warnings.map((w) => ({
        level: w.severity === "major" ? ("error" as const) : ("warning" as const),
        code: w.code,
        message: w.message,
        location: w.path,
      }))],
    };
  }

  /**
   * Validate that a NormalizedSpec is internally consistent
   * Does NOT validate against Canonical Schema - that happens in canonicalization layer
   */
  private validateNormalizedSpec(spec: NormalizedSpec): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Validate product info
    if (!spec.product.name) {
      errors.push({
        code: "MISSING_PRODUCT_NAME",
        message: "Product name is required",
        path: "product.name",
        suggestion: "Provide a product name in the input specification",
      });
    }

    // Validate types
    const definedTypes = new Set(Object.keys(spec.types));

    // Check all type references are resolvable
    spec.operations.forEach((op, opIdx) => {
      // Check response type
      const responseType = this.resolveType(op.response.type, definedTypes);
      if (!responseType) {
        errors.push({
          code: "UNRESOLVABLE_RESPONSE_TYPE",
          message: `Operation '${op.id}' has unresolvable response type: ${op.response.type}`,
          path: `operations[${opIdx}].response.type`,
          suggestion: "Define the type in the types section or use a built-in type",
        });
      }

      // Check parameter types
      op.parameters.forEach((param, paramIdx) => {
        const paramType = this.resolveType(param.type, definedTypes);
        if (!paramType) {
          errors.push({
            code: "UNRESOLVABLE_PARAMETER_TYPE",
            message: `Operation '${op.id}', parameter '${param.name}' has unresolvable type: ${param.type}`,
            path: `operations[${opIdx}].parameters[${paramIdx}].type`,
            suggestion: "Define the type or use a built-in type",
          });
        }
      });

      // Check error codes are defined
      op.errors.forEach((errorCode) => {
        const errorDefined = spec.errors.some((e) => e.code === errorCode);
        if (!errorDefined) {
          warnings.push({
            code: "UNDEFINED_ERROR_CODE",
            message: `Operation '${op.id}' references undefined error code: ${errorCode}`,
            path: `operations[${opIdx}].errors`,
            severity: "major",
          });
        }
      });
    });

    // Validate types reference valid types
    Object.entries(spec.types).forEach(([typeName, type]) => {
      if (type.fields) {
        Object.entries(type.fields).forEach(([fieldName, field]) => {
          const fieldType = this.resolveType(field.type, definedTypes);
          if (!fieldType) {
            errors.push({
              code: "UNRESOLVABLE_FIELD_TYPE",
              message: `Type '${typeName}', field '${fieldName}' has unresolvable type: ${field.type}`,
              path: `types.${typeName}.fields.${fieldName}.type`,
              suggestion: "Define the type or use a built-in type",
            });
          }
        });
      }

      if (type.items) {
        const itemType = this.resolveType(type.items.type, definedTypes);
        if (!itemType) {
          errors.push({
            code: "UNRESOLVABLE_ITEM_TYPE",
            message: `Type '${typeName}' has unresolvable item type: ${type.items.type}`,
            path: `types.${typeName}.items.type`,
          });
        }
      }
    });

    // Validate no duplicate operation IDs
    const opIds = new Set<string>();
    spec.operations.forEach((op, idx) => {
      if (opIds.has(op.id)) {
        errors.push({
          code: "DUPLICATE_OPERATION_ID",
          message: `Duplicate operation ID: ${op.id}`,
          path: `operations[${idx}].id`,
          suggestion: "Make operation IDs unique",
        });
      }
      opIds.add(op.id);
    });

    // Validate no duplicate type names
    const typeNames = new Set<string>();
    Object.keys(spec.types).forEach((name) => {
      if (typeNames.has(name)) {
        errors.push({
          code: "DUPLICATE_TYPE_NAME",
          message: `Duplicate type name: ${name}`,
          path: `types.${name}`,
        });
      }
      typeNames.add(name);
    });

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Resolve a type name, handling arrays and references
   */
  private resolveType(typeName: string, definedTypes: Set<string>): boolean {
    // Check built-in types
    if (this.builtInTypes.has(typeName)) {
      return true;
    }

    // Check defined types
    if (definedTypes.has(typeName)) {
      return true;
    }

    // Array notation: "Type[]"
    if (typeName.endsWith("[]")) {
      const elementType = typeName.slice(0, -2);
      return this.resolveType(elementType, definedTypes);
    }

    // Fixed array notation: "Type[10]"
    const fixedArrayMatch = typeName.match(/^(.+)\[\d+\]$/);
    if (fixedArrayMatch) {
      return this.resolveType(fixedArrayMatch[1], definedTypes);
    }

    return false;
  }
}

// ============================================================================
// RESULT TYPES
// ============================================================================

export interface NormalizationResult {
  success: boolean;
  spec?: NormalizedSpec;
  error?: string;
  parseErrors?: Array<{ code: string; message: string; location?: string }>;
  validationErrors?: ValidationError[];
  warnings: Array<{ level: "info" | "warning" | "error"; code: string; message: string; location?: string }>;
}

// ============================================================================
// FACTORY FOR EASY USAGE
// ============================================================================

let globalNormalizer: InputNormalizer | null = null;

/**
 * Get or create the global normalizer instance
 */
export function getNormalizer(): InputNormalizer {
  if (!globalNormalizer) {
    globalNormalizer = new InputNormalizer();
  }
  return globalNormalizer;
}

/**
 * Convenience function to normalize input
 */
export function normalizeInput(input: InputSpec): NormalizationResult {
  return getNormalizer().normalize(input);
}
