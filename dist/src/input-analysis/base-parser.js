"use strict";
/**
 * Base Parser Class and Common Utilities
 *
 * All format-specific parsers extend BaseParser.
 * Deterministic parsing logic lives here.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseParser = void 0;
exports.extractRequiredFields = extractRequiredFields;
exports.isFieldRequired = isFieldRequired;
exports.extractType = extractType;
exports.extractExample = extractExample;
exports.buildPath = buildPath;
exports.isErrorStatusCode = isErrorStatusCode;
exports.normalizeHttpMethod = normalizeHttpMethod;
exports.extractContentType = extractContentType;
exports.safeJsonParse = safeJsonParse;
exports.flattenRefPath = flattenRefPath;
exports.isBodyParameter = isBodyParameter;
exports.classifyParameterLocation = classifyParameterLocation;
const types_1 = require("./types");
class BaseParser extends types_1.SpecParser {
    constructor() {
        super(...arguments);
        this.errors = [];
        this.warnings = [];
    }
    addError(code, message, location, context) {
        this.errors.push({ code, message, location, context });
    }
    addWarning(level, code, message, location) {
        this.warnings.push({ level, code, message, location });
    }
    resetState() {
        this.errors = [];
        this.warnings = [];
    }
    /**
     * Resolve a type reference to ensure it exists
     * Returns the actual type name, or null if unresolvable
     */
    resolveTypeReference(typeRef, builtInTypes, definedTypes) {
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
    normalizePrimitiveType(type) {
        // Remove GraphQL/JSON Schema modifiers
        let cleaned = type.replace(/[![\]]/g, "").toLowerCase();
        // Normalize common variations
        const typeMap = {
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
    isTypeReference(type) {
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
    validateTypeReferences(spec) {
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
        const unresolvable = [];
        const visited = new Set();
        const recursionStack = new Set();
        const circular = [];
        const checkType = (typeName, path = []) => {
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
                        }
                        else {
                            checkType(field.type, [...path, typeName]);
                        }
                    }
                });
            }
            // Check array items
            if (type.items && this.isTypeReference(type.items.type)) {
                if (!builtInTypes.has(type.items.type) && !definedTypes.has(type.items.type)) {
                    unresolvable.push(type.items.type);
                }
                else if (definedTypes.has(type.items.type)) {
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
exports.BaseParser = BaseParser;
// ============================================================================
// COMMON UTILITIES
// ============================================================================
/**
 * Extract required fields from a schema
 */
function extractRequiredFields(schema) {
    if (Array.isArray(schema.required)) {
        return schema.required;
    }
    return [];
}
/**
 * Determine if a field is required based on schema and parent's required list
 */
function isFieldRequired(fieldName, requiredList, schema) {
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
function extractType(schema) {
    if (!schema) {
        return "any";
    }
    // Direct type
    if (schema.type) {
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
        return "array";
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
function extractExample(schema, type) {
    if (schema?.example !== undefined) {
        return schema.example;
    }
    if (schema?.default !== undefined) {
        return schema.default;
    }
    // Provide reasonable defaults by type
    const typeDefaults = {
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
function buildPath(parts) {
    return parts.map((p) => (typeof p === "number" ? `[${p}]` : `.${p}`)).join("");
}
/**
 * Check if a status code indicates an error
 */
function isErrorStatusCode(code) {
    const codeNum = typeof code === "string" ? parseInt(code) : code;
    return codeNum >= 400;
}
/**
 * Normalize HTTP method to uppercase
 */
function normalizeHttpMethod(method) {
    const normalized = method.toUpperCase();
    const valid = ["GET", "POST", "PUT", "PATCH", "DELETE", "FUNCTION", "EVENT"];
    return (valid.includes(normalized) ? normalized : null);
}
/**
 * Extract content type from Content-Type header or schema
 */
function extractContentType(contentTypeHeader, schema) {
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
function safeJsonParse(content, location) {
    try {
        return { success: true, data: JSON.parse(content) };
    }
    catch (e) {
        return {
            success: false,
            error: `Failed to parse JSON at ${location}: ${e.message}`,
        };
    }
}
/**
 * Flatten OpenAPI $ref paths
 * "#/components/schemas/User" -> "User"
 */
function flattenRefPath(ref) {
    const parts = ref.split("/");
    return parts[parts.length - 1];
}
/**
 * Check if parameter is located in request body
 */
function isBodyParameter(param) {
    return param.in === "body" || param.location === "body" || !param.in;
}
/**
 * Classify HTTP parameter location
 */
function classifyParameterLocation(param) {
    const location = param.in || param.location;
    if (location === "path")
        return "path";
    if (location === "query")
        return "query";
    if (location === "header")
        return "header";
    if (location === "body")
        return "body";
    // Default to body if ambiguous
    return "body";
}
//# sourceMappingURL=base-parser.js.map