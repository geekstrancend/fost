/**
 * Base Parser Class and Common Utilities
 *
 * All format-specific parsers extend BaseParser.
 * Deterministic parsing logic lives here.
 */

import {
  NormalizedSpec,
  NormalizedType,
  ParsingError,
  SpecParser,
  NormalizationNote,
} from "./types";

export abstract class BaseParser extends SpecParser {
  protected errors: ParsingError[] = [];
  protected warnings: NormalizationNote[] = [];

  protected addError(code: string, message: string, location?: string, context?: any): void {
    this.errors.push({ code, message, location, context });
  }

  protected addWarning(
    level: "info" | "warning" | "error",
    code: string,
    message: string,
    location?: string
  ): void {
    this.warnings.push({ level, code, message, location });
  }

  protected resetState(): void {
    this.errors = [];
    this.warnings = [];
  }

  /**
   * Resolve a type reference to ensure it exists
   * Returns the actual type name, or null if unresolvable
   */
  protected resolveTypeReference(
    typeRef: string,
    builtInTypes: Set<string>,
    definedTypes: Map<string, NormalizedType>
  ): string | null {
    // Check built-in types
    if (builtInTypes.has(typeRef)) {
      return typeRef;
    }

    // Check defined types
    if (definedTypes.has(typeRef)) {
      return typeRef;
    }

    // Array notation: "string[]" -> "array of string"
    if (typeRef.endsWith("[]")) {
      const elementType = typeRef.slice(0, -2);
      if (builtInTypes.has(elementType) || definedTypes.has(elementType)) {
        return typeRef;
      }
    }

    return null;
  }

  /**
   * Extract primitive type from various formats
   * "string", "String", "String!", etc. -> "string"
   */
  protected normalizePrimitiveType(type: string): string {
    // Remove GraphQL/JSON Schema modifiers
    const cleaned = type.replace(/[![\]]]/g, "").toLowerCase();

    // Normalize common variations
    const typeMap: Record<string, string> = {
      str: "string",
      int: "integer",
      num: "number",
      bool: "boolean",
      datetime: "timestamp",
      date: "timestamp",
      uuid: "string",
      object: "object",
      array: "array",
      null: "null",
      any: "any",
      bigint: "bigint",
      uint: "number",
      uint256: "bigint",
      bytes: "bytes",
      bytes32: "bytes",
    };

    return typeMap[cleaned] || cleaned;
  }

  /**
   * Check if a type looks like a reference to another type
   */
  protected isTypeReference(type: string): boolean {
    // Starts with uppercase = object type
    if (type.length > 0 && type[0] === type[0].toUpperCase()) {
      return true;
    }

    // Special markers
    if (type.includes("#/")) {
      return true;
    }

    return false;
  }

  /**
   * Validate that all type references are resolvable
   * Returns list of unresolvable references
   */
  protected validateTypeReferences(
    spec: NormalizedSpec
  ): { unresolvable: string[]; circular: string[] } {
    const builtInTypes = new Set([
      "string",
      "number",
      "boolean",
      "bytes",
      "bigint",
      "timestamp",
      "null",
      "any",
      "integer",
    ]);

    const definedTypes = new Map(Object.entries(spec.types));
    const unresolvable: string[] = [];
    const visited = new Set<string>();
    const recursionStack = new Set<string>();
    const circular: string[] = [];

    const checkType = (typeName: string, path: string[] = []): void => {
      if (visited.has(typeName)) {
        return;
      }

      if (recursionStack.has(typeName)) {
        circular.push(typeName);
        return;
      }

      recursionStack.add(typeName);

      const type = definedTypes.get(typeName);
      if (!type) {
        return; // Will be caught later
      }

      // Check fields
      if (type.fields) {
        Object.values(type.fields).forEach((field) => {
          if (this.isTypeReference(field.type) && !builtInTypes.has(field.type)) {
            if (!definedTypes.has(field.type)) {
              unresolvable.push(field.type);
            } else {
              checkType(field.type, [...path, typeName]);
            }
          }
        });
      }

      // Check array items
      if (type.items && this.isTypeReference(type.items.type)) {
        if (!builtInTypes.has(type.items.type) && !definedTypes.has(type.items.type)) {
          unresolvable.push(type.items.type);
        } else if (definedTypes.has(type.items.type)) {
          checkType(type.items.type, [...path, typeName]);
        }
      }

      recursionStack.delete(typeName);
      visited.add(typeName);
    };

    // Check all types
    definedTypes.forEach((_type, typeName) => {
      checkType(typeName);
    });

    return { unresolvable: [...new Set(unresolvable)], circular };
  }
}

// ============================================================================
// COMMON UTILITIES
// ============================================================================

/**
 * Extract required fields from a schema
 */
export function extractRequiredFields(schema: any): string[] {
  if (Array.isArray(schema.required)) {
    return schema.required;
  }
  return [];
}

/**
 * Determine if a field is required based on schema and parent's required list
 */
export function isFieldRequired(fieldName: string, requiredList: string[], schema: any): boolean {
  // Explicit required list takes precedence
  if (requiredList.includes(fieldName)) {
    return true;
  }

  // Check schema-level required field
  if (schema?.required === true) {
    return true;
  }

  return false;
}

/**
 * Extract type from various schema formats
 */
export function extractType(schema: any): string {
  if (!schema) {
    return "any";
  }

  // Direct type
  if (schema.type) {
    // Handle array types
    if (schema.type === "array" && schema.items) {
      const itemType = extractType(schema.items);
      return `${itemType}[]`;
    }
    return schema.type;
  }

  // $ref pointer
  if (schema.$ref) {
    const parts = schema.$ref.split("/");
    return parts[parts.length - 1];
  }

  // allOf, oneOf, anyOf
  if (schema.allOf || schema.oneOf || schema.anyOf) {
    return "union";
  }

  // items indicates array
  if (schema.items) {
    const itemType = extractType(schema.items);
    return `${itemType}[]`;
  }

  // enum indicates enum
  if (schema.enum) {
    return "enum";
  }

  return "object";
}

/**
 * Extract example value from schema, with fallback
 */
export function extractExample(schema: any, type: string): any {
  if (schema?.example !== undefined) {
    return schema.example;
  }

  if (schema?.default !== undefined) {
    return schema.default;
  }

  // Provide reasonable defaults by type
  const typeDefaults: Record<string, any> = {
    string: "example",
    number: 42,
    integer: 1,
    boolean: true,
    array: [],
    object: {},
  };

  return typeDefaults[type] || null;
}

/**
 * Build a path string for error reporting
 */
export function buildPath(parts: (string | number)[]): string {
  return parts.map((p) => (typeof p === "number" ? `[${p}]` : `.${p}`)).join("");
}

/**
 * Check if a status code indicates an error
 */
export function isErrorStatusCode(code: number | string): boolean {
  const codeNum = typeof code === "string" ? parseInt(code) : code;
  return codeNum >= 400;
}

/**
 * Normalize HTTP method to uppercase
 */
export function normalizeHttpMethod(
  method: string
): "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "function" | "event" | null {
  const normalized = method.toUpperCase();
  const valid = ["GET", "POST", "PUT", "PATCH", "DELETE", "FUNCTION", "EVENT"];
  return (valid.includes(normalized) ? normalized : null) as any;
}

/**
 * Extract content type from Content-Type header or schema
 */
export function extractContentType(contentTypeHeader?: string, schema?: any): string {
  if (contentTypeHeader) {
    return contentTypeHeader.split(";")[0].trim();
  }

  if (schema?.["content-type"]) {
    return schema["content-type"];
  }

  return "application/json";
}

/**
 * Safe JSON parse with error reporting
 */
export function safeJsonParse(
  content: string,
  location: string
): { success: boolean; data?: any; error?: string } {
  try {
    return { success: true, data: JSON.parse(content) };
  } catch (e) {
    return {
      success: false,
      error: `Failed to parse JSON at ${location}: ${(e as Error).message}`,
    };
  }
}

/**
 * Flatten OpenAPI $ref paths
 * "#/components/schemas/User" -> "User"
 */
export function flattenRefPath(ref: string): string {
  const parts = ref.split("/");
  return parts[parts.length - 1];
}

/**
 * Check if parameter is located in request body
 */
export function isBodyParameter(param: any): boolean {
  return param.in === "body" || param.location === "body" || !param.in;
}

/**
 * Classify HTTP parameter location
 */
export function classifyParameterLocation(param: any): "path" | "query" | "header" | "body" {
  const location = param.in || param.location;
  if (location === "path") return "path";
  if (location === "query") return "query";
  if (location === "header") return "header";
  if (location === "body") return "body";

  // Default to body if ambiguous
  return "body";
}
