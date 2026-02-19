/**
 * OpenAPI 3.x Parser
 *
 * Deterministically converts OpenAPI/Swagger specs to NormalizedSpec.
 * No hallucination: explicit handling of missing/ambiguous data.
 */

import {
  InputSpec,
  NormalizedSpec,
  NormalizedProductInfo,
  NormalizedType,
  NormalizedOperation,
  NormalizedParameter,
  NormalizedError,
  NormalizedAuth,
  NormalizedNetwork,
  ParserResult,
  InputSourceInfo,
} from "../types";
import {
  BaseParser,
  extractRequiredFields,
  extractType,
  extractExample,
  normalizeHttpMethod,
  classifyParameterLocation,
  flattenRefPath,
  isFieldRequired,
} from "../base-parser";

export class OpenAPIParser extends BaseParser {
  canParse(input: InputSpec): boolean {
    return (
      input.type === "openapi-3.0" ||
      input.type === "openapi-3.1" ||
      input.type === "swagger-2.0"
    );
  }

  parse(input: InputSpec): ParserResult {
    this.resetState();

    try {
      const openapi = input.rawContent;

      // Validate top-level structure
      if (!openapi.openapi && !openapi.swagger) {
        this.addError("MISSING_VERSION", "OpenAPI spec missing 'openapi' or 'swagger' field");
        return { success: false, errors: this.errors, warnings: this.warnings };
      }

      // Extract product info
      const product = this.extractProductInfo(openapi);

      // Extract types from schemas/definitions
      const types = this.extractTypes(openapi);

      // Extract operations from paths
      const operations = this.extractOperations(openapi, types);

      // Extract error definitions
      const errors = this.extractErrors(openapi, operations);

      // Extract authentication
      const authentication = this.extractAuthentication(openapi);

      // Extract networks
      const networks = this.extractNetworks(openapi);

      // Validate references
      const refValidation = this.validateTypeReferences({
        product,
        types,
        operations,
        errors,
        authentication,
        networks,
        source: {
          inputType: input.type,
          sourcePath: input.source,
          parsedAt: new Date().toISOString(),
          parser: "OpenAPIParser",
        },
        normalizationNotes: this.warnings,
      });

      if (refValidation.unresolvable.length > 0) {
        this.addWarning(
          "warning",
          "UNRESOLVABLE_TYPE_REFS",
          `Found unresolvable type references: ${refValidation.unresolvable.join(", ")}`
        );
      }

      if (refValidation.circular.length > 0) {
        this.addWarning(
          "warning",
          "CIRCULAR_TYPES",
          `Found potentially circular type references: ${refValidation.circular.join(", ")}`
        );
      }

      const normalized: NormalizedSpec = {
        product,
        types,
        operations,
        errors,
        authentication,
        networks,
        source: {
          inputType: input.type,
          sourcePath: input.source,
          parsedAt: new Date().toISOString(),
          parser: "OpenAPIParser",
        },
        normalizationNotes: this.warnings,
      };

      return {
        success: this.errors.length === 0,
        normalized,
        errors: this.errors,
        warnings: this.warnings,
      };
    } catch (e) {
      this.addError("PARSE_EXCEPTION", `Unexpected error: ${(e as Error).message}`);
      return { success: false, errors: this.errors, warnings: this.warnings };
    }
  }

  private extractProductInfo(openapi: any): NormalizedProductInfo {
    const info = openapi.info || {};

    return {
      name: (info.title || "api").toLowerCase().replace(/\s+/g, "-"),
      version: info.version || "1.0.0",
      apiVersion: openapi.openapi || openapi.swagger,
      description: info.description || `API: ${info.title || "Unknown"}`,
      title: info.title,
      contact: info.contact
        ? {
            name: info.contact.name,
            email: info.contact.email,
            url: info.contact.url,
          }
        : undefined,
      license: info.license
        ? {
            name: info.license.name,
            url: info.license.url,
          }
        : undefined,
      termsOfService: info.termsOfService,
    };
  }

  private extractTypes(openapi: any): Record<string, NormalizedType> {
    const types: Record<string, NormalizedType> = {};

    // OpenAPI 3.0: #/components/schemas
    const schemas = openapi.components?.schemas || openapi.definitions || {};

    Object.entries(schemas).forEach(([typeName, schema]: [string, any]) => {
      const normalized = this.normalizeType(typeName, schema);
      if (normalized) {
        types[typeName] = normalized;
      }
    });

    return types;
  }

  private normalizeType(name: string, schema: any): NormalizedType | null {
    if (!schema) {
      return null;
    }

    const type = extractType(schema);
    const requiredFields = extractRequiredFields(schema);

    // Determine specific type category
    let category: "object" | "array" | "enum" | "primitive" | "union" | "map" = "object";
    if (type === "array" && schema.items) {
      category = "array";
    } else if (type === "enum" || schema.enum) {
      category = "enum";
    } else if (schema.type === "string" || schema.type === "number" || schema.type === "boolean") {
      category = "primitive";
    } else if (type === "union") {
      category = "union";
    }

    const normalized: NormalizedType = {
      name,
      description: schema.description || `Type: ${name}`,
      type: category,
      nullable: schema.nullable === true,
      example: extractExample(schema, type),
      required: requiredFields,
      additionalProperties: schema.additionalProperties !== false,
    };

    // Extract fields for objects
    if (category === "object" && schema.properties) {
      normalized.fields = {};
      Object.entries(schema.properties).forEach(([fieldName, fieldSchema]: [string, any]) => {
        normalized.fields![fieldName] = {
          name: fieldName,
          type: extractType(fieldSchema),
          description: fieldSchema.description || "",
          required: isFieldRequired(fieldName, requiredFields, fieldSchema),
          nullable: fieldSchema.nullable === true,
          example: extractExample(fieldSchema, extractType(fieldSchema)),
          default: fieldSchema.default,
          enum: fieldSchema.enum,
          validation: {
            pattern: fieldSchema.pattern,
            minLength: fieldSchema.minLength,
            maxLength: fieldSchema.maxLength,
            minimum: fieldSchema.minimum,
            maximum: fieldSchema.maximum,
          },
        };
      });
    }

    // Extract enum values
    if (category === "enum" && schema.enum) {
      normalized.enumValues = schema.enum.map((v: any) => String(v));
    }

    // Extract array item type
    if (category === "array" && schema.items) {
      normalized.items = {
        type: extractType(schema.items),
        nullable: schema.items.nullable === true,
      };
    }

    // Map value type
    if (schema.additionalProperties && typeof schema.additionalProperties === "object") {
      normalized.mapValueType = extractType(schema.additionalProperties);
    }

    return normalized;
  }

  private extractOperations(openapi: any, _types: Record<string, NormalizedType>): NormalizedOperation[] {
    const operations: NormalizedOperation[] = [];
    const paths = openapi.paths || {};

    Object.entries(paths).forEach(([path, pathItem]: [string, any]) => {
      const methods = ["get", "post", "put", "patch", "delete", "head", "options"];

      methods.forEach((method) => {
        const operation = (pathItem as any)[method];
        if (!operation) return;

        const operationId =
          operation.operationId ||
          `${method}${path.replace(/[^a-zA-Z0-9]/g, "").charAt(0).toUpperCase()}${path
            .replace(/[^a-zA-Z0-9]/g, "")
            .slice(1)}`;

        const normalized: NormalizedOperation = {
          id: operationId,
          name: operation.summary || operation.operationId || `${method.toUpperCase()} ${path}`,
          description: operation.description || "",
          method: normalizeHttpMethod(method) || "GET",
          path: path,
          parameters: this.extractParameters(operation, path),
          response: this.extractResponse(operation),
          errors: this.extractErrorCodes(operation),
          authentication: this.extractOperationAuth(operation),
          deprecated: operation.deprecated || false,
          example: this.extractOperationExample(operation),
          tags: operation.tags || [],
          operationId: operation.operationId,
        };

        // Extract request body if present
        if (operation.requestBody) {
          const content = operation.requestBody.content || {};
          const contentType = Object.keys(content)[0] || "application/json";
          const schema = content[contentType]?.schema;

          normalized.requestBody = {
            type: schema ? extractType(schema) : "object",
            required: operation.requestBody.required !== false,
            contentType,
          };
        }

        operations.push(normalized);
      });
    });

    return operations;
  }

  private extractParameters(operation: any, path: string): NormalizedParameter[] {
    const params: NormalizedParameter[] = [];
    const parameters = operation.parameters || [];

    parameters.forEach((param: any, idx: number) => {
      const normalized: NormalizedParameter = {
        name: param.name || `param${idx}`,
        type: param.schema ? extractType(param.schema) : extractType(param),
        description: param.description || "",
        required: param.required === true,
        nullable: param.schema?.nullable === true || param.nullable === true,
        location: classifyParameterLocation(param),
        default: param.schema?.default || param.default,
        enum: param.schema?.enum || param.enum,
        example: extractExample(param.schema || param, extractType(param.schema || param)),
        validation: {
          pattern: param.schema?.pattern || param.pattern,
          minLength: param.schema?.minLength || param.minLength,
          maxLength: param.schema?.maxLength || param.maxLength,
          minimum: param.schema?.minimum || param.minimum,
          maximum: param.schema?.maximum || param.maximum,
        },
      };

      params.push(normalized);
    });

    // Extract path parameters from path string
    const pathParamRegex = /{([^}]+)}/g;
    let match;
    while ((match = pathParamRegex.exec(path)) !== null) {
      const paramName = match[1];
      // Check if not already defined
      if (!params.some((p) => p.name === paramName)) {
        params.push({
          name: paramName,
          type: "string",
          description: `Path parameter: ${paramName}`,
          required: true,
          nullable: false,
          location: "path",
        });
      }
    }

    return params;
  }

  private extractResponse(operation: any): { type: string; statusCode?: number; contentType?: string } {
    const responses = operation.responses || {};

    // Prefer 200, then first 2xx, then any response
    const status = Object.keys(responses).find((s) => s === "200") ||
      Object.keys(responses).find((s) => s.startsWith("2")) ||
      Object.keys(responses)[0] ||
      "200";

    const response = responses[status];
    if (!response) {
      return { type: "object", statusCode: parseInt(status) };
    }

    const content = response.content || {};
    const contentType = Object.keys(content)[0] || "application/json";
    const schema = content[contentType]?.schema;

    return {
      type: schema ? extractType(schema) : "object",
      statusCode: parseInt(status),
      contentType,
    };
  }

  private extractErrorCodes(operation: any): string[] {
    const errors: string[] = [];
    const responses = operation.responses || {};

    Object.entries(responses).forEach(([status, response]: [string, any]) => {
      const statusCode = parseInt(status);
      if (statusCode >= 400) {
        // Map common error status codes
        const errorMap: Record<number, string> = {
          400: "BAD_REQUEST",
          401: "UNAUTHORIZED",
          403: "FORBIDDEN",
          404: "NOT_FOUND",
          409: "CONFLICT",
          429: "RATE_LIMITED",
          500: "INTERNAL_SERVER_ERROR",
          502: "BAD_GATEWAY",
          503: "SERVICE_UNAVAILABLE",
        };

        const errorCode = errorMap[statusCode] || `HTTP_${statusCode}`;
        if (!errors.includes(errorCode)) {
          errors.push(errorCode);
        }
      }
    });

    return errors;
  }

  private extractOperationAuth(operation: any): { required: boolean; type: string } | undefined {
    const security = operation.security;
    if (security === undefined) {
      return undefined;
    }

    // If security is empty array, auth is not required
    if (Array.isArray(security) && security.length === 0) {
      return { required: false, type: "none" };
    }

    return { required: true, type: "custom" };
  }

  private extractOperationExample(operation: any): { request?: any; response?: any } | undefined {
    const example: any = {};

    // Try to extract from responses
    const responses = operation.responses || {};
    const successResponse = responses["200"] || Object.values(responses)[0];

    if (successResponse?.example) {
      example.response = successResponse.example;
    }

    return Object.keys(example).length > 0 ? example : undefined;
  }

  private extractErrors(openapi: any, operations: NormalizedOperation[]): NormalizedError[] {
    const errors: NormalizedError[] = [];
    const errorCodes = new Set<string>();

    // Collect all error codes from operations
    operations.forEach((op) => {
      op.errors.forEach((code: string) => errorCodes.add(code));
    });

    // Create error definitions
    const errorDescriptions: Record<string, string> = {
      BAD_REQUEST: "Invalid request parameters",
      UNAUTHORIZED: "Authentication required or failed",
      FORBIDDEN: "Access denied",
      NOT_FOUND: "Resource not found",
      CONFLICT: "Resource conflict",
      RATE_LIMITED: "Rate limit exceeded",
      INTERNAL_SERVER_ERROR: "Internal server error",
      BAD_GATEWAY: "Bad gateway",
      SERVICE_UNAVAILABLE: "Service unavailable",
    };

    errorCodes.forEach((code) => {
      errors.push({
        code,
        message: code.replace(/_/g, " "),
        description: errorDescriptions[code] || `Error: ${code}`,
        httpStatus: this.statusFromErrorCode(code),
      });
    });

    return errors;
  }

  private statusFromErrorCode(code: string): number | undefined {
    const statusMap: Record<string, number> = {
      BAD_REQUEST: 400,
      UNAUTHORIZED: 401,
      FORBIDDEN: 403,
      NOT_FOUND: 404,
      CONFLICT: 409,
      RATE_LIMITED: 429,
      INTERNAL_SERVER_ERROR: 500,
      BAD_GATEWAY: 502,
      SERVICE_UNAVAILABLE: 503,
    };

    return statusMap[code];
  }

  private extractAuthentication(openapi: any): NormalizedAuth {
    const security = openapi.security || [];
    const securitySchemes = openapi.components?.securitySchemes || openapi.securityDefinitions || {};

    if (Object.keys(securitySchemes).length === 0) {
      return { type: "none", required: false };
    }

    // Get first security scheme
    const [, scheme] = Object.entries(securitySchemes)[0] as [string, any];

    if (!scheme) {
      return { type: "none", required: false };
    }

    const required = security.length > 0;

    return {
      type: scheme.type === "http" ? "bearer" : scheme.type,
      required,
      description: scheme.description,
      details: {
        scheme: scheme.scheme,
        bearerFormat: scheme.bearerFormat,
      },
    };
  }

  private extractNetworks(openapi: any): NormalizedNetwork[] {
    const networks: NormalizedNetwork[] = [];

    // Try to extract servers
    const servers = openapi.servers || [];
    if (servers.length > 0) {
      servers.forEach((server: any, idx: number) => {
        networks.push({
          id: `server-${idx}`,
          name: server.description || `Server ${idx}`,
          type: "rest",
          url: server.url,
        });
      });
    } else {
      // No servers defined - add generic production endpoint
      networks.push({
        id: "production",
        name: "Production",
        type: "rest",
        url: "{baseUrl}", // Placeholder
        environment: "production",
      });
    }

    return networks;
  }
}
