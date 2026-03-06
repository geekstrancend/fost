/**
 * SPEC TO TEMPLATE CONVERSION
 *
 * Converts normalized specs from input analysis to template context for code generation.
 * Handles both OpenAPI (REST) and Contract ABI (Web3) specs.
 */

import { NormalizedSpec } from "../input-analysis/types";
import {
  TemplateContext,
  EndpointInfo,
  TypeInfo,
  PropertyInfo,
  ParameterInfo,
  ResponseInfo,
  TemplateSDKGenerator,
} from "./template-generator";

export class SpecToTemplateConverter {
  /**
   * Convert normalized spec to template context
   */
  static convertToTemplate(
    normalizedSpec: NormalizedSpec
  ): TemplateContext {
    const context: TemplateContext = {
      apiName: this.generateApiName(normalizedSpec.product.name),
      apiVersion: normalizedSpec.product.version || "1.0.0",
      basePath:
        normalizedSpec.networks?.[0]?.url ||
        "https://api.example.com",
      endpoints: this.extractEndpoints(normalizedSpec),
      types: this.extractTypes(normalizedSpec),
      description: normalizedSpec.product.description,
      auth: this.extractAuth(normalizedSpec),
    };

    return context;
  }

  /**
   * Generate API name from product name
   */
  private static generateApiName(productName: string): string {
    // Convert to PascalCase: "my-api" -> "MyApi"
    return productName
      .split(/[-_\s]/)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
      .join("");
  }

  /**
   * Extract endpoints from normalized spec
   */
  private static extractEndpoints(
    normalizedSpec: NormalizedSpec
  ): EndpointInfo[] {
    const endpoints: EndpointInfo[] = [];

    for (const operation of (normalizedSpec.operations || [])) {
      // Build path with parameters
      let path = operation.path || operation.functionName || "/";
      for (const param of operation.parameters || []) {
        if (param.location === "path") {
          path = path.replace(`{${param.name}}`, `:${param.name}`);
        }
      }

      // Extract query parameters
      const queryParams = (operation.parameters || [])
        .filter((p) => p.location === "query")
        .map((p) => ({
          name: p.name,
          in: "query" as const,
          type: p.type || "string",
          required: p.required || false,
          description: p.description,
        }));

      // Extract headers
      const headerParams = (operation.parameters || [])
        .filter((p) => p.location === "header")
        .map((p) => ({
          name: p.name,
          in: "header" as const,
          type: p.type || "string",
          required: p.required || false,
          description: p.description,
        }));

      const allParams: ParameterInfo[] = [...queryParams, ...headerParams];

      // Extract responses
      const responses: ResponseInfo[] = [
        {
          status: operation.response?.statusCode?.toString() || "200",
          type: operation.response?.type || "unknown",
          description: operation.response?.contentType,
        },
      ];

      endpoints.push({
        path,
        method: operation.method.toLowerCase(),
        operationId: operation.operationId || operation.name || "unknown",
        description: operation.description,
        parameters: allParams,
        responses,
      });
    }

    return endpoints;
  }

  /**
   * Extract types from normalized spec
   */
  private static extractTypes(normalizedSpec: NormalizedSpec): TypeInfo[] {
    const types: TypeInfo[] = [];

    const typeRecord = normalizedSpec.types;
    if (typeRecord && typeof typeRecord === "object") {
      for (const [_key, type] of Object.entries(typeRecord)) {
        if (!type) continue;

        const properties: PropertyInfo[] = (type.fields
          ? Object.values(type.fields)
          : []
        ).map((field: any) => ({
          name: field?.name || "unknown",
          type: field?.type || "any",
          required: field?.required || false,
          description: field?.description,
        }));

        types.push({
          name: type.name || "Unknown",
          properties,
          description: type.description,
        });
      }
    }

    return types;
  }

  /**
   * Extract authentication info from normalized spec
   */
  private static extractAuth(normalizedSpec: NormalizedSpec): undefined {
    // Simplified for now - Auth feature in v0.2.0
    if (!normalizedSpec.authentication || normalizedSpec.authentication.type === "none") {
      return undefined;
    }
    return undefined;
  }
}

/**
 * Main SDK generation orchestrator
 */
export class SDKGenerationOrchestrator {
  /**
   * Generate SDK files
   */
  static generateSDKFiles(
    normalizedSpec: NormalizedSpec,
    language: string = "typescript",
    _type: "web2" | "web3" = "web2"
  ): Map<string, string> {
    const templateContext = SpecToTemplateConverter.convertToTemplate(normalizedSpec);
    const files = TemplateSDKGenerator.generateSDK(
      templateContext,
      language
    );

    return files;
  }
}
