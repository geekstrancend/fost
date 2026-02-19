"use strict";
/**
 * Input Normalizer Registry & Pipeline
 *
 * Coordinates multiple parsers, handles validation, and produces canonical specs.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.InputNormalizer = void 0;
exports.getNormalizer = getNormalizer;
exports.normalizeInput = normalizeInput;
const openapi_1 = require("./parsers/openapi");
const contract_abi_1 = require("./parsers/contract-abi");
const chain_metadata_1 = require("./parsers/chain-metadata");
class InputNormalizer {
    constructor() {
        this.parsers = [];
        this.builtInTypes = new Set([
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
        ]);
        // Register all built-in parsers
        this.registerParser(new openapi_1.OpenAPIParser());
        this.registerParser(new contract_abi_1.ContractABIParser());
        this.registerParser(new chain_metadata_1.ChainMetadataParser());
    }
    /**
     * Register a custom parser
     */
    registerParser(parser) {
        this.parsers.push(parser);
    }
    /**
     * Normalize raw input to canonical intermediate representation
     * Main entry point for the input analysis layer
     */
    normalize(input) {
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
                        level: w.severity === "major" ? "error" : "warning",
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
                    level: w.severity === "major" ? "error" : "warning",
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
    validateNormalizedSpec(spec) {
        const errors = [];
        const warnings = [];
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
        const opIds = new Set();
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
        const typeNames = new Set();
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
    resolveType(typeName, definedTypes) {
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
exports.InputNormalizer = InputNormalizer;
// ============================================================================
// FACTORY FOR EASY USAGE
// ============================================================================
let globalNormalizer = null;
/**
 * Get or create the global normalizer instance
 */
function getNormalizer() {
    if (!globalNormalizer) {
        globalNormalizer = new InputNormalizer();
    }
    return globalNormalizer;
}
/**
 * Convenience function to normalize input
 */
function normalizeInput(input) {
    return getNormalizer().normalize(input);
}
//# sourceMappingURL=normalizer.js.map