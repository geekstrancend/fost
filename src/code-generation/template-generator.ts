/**
 * TEMPLATE-BASED SDK GENERATION
 *
 * Generates production-ready SDKs from normalized specs using deterministic templates.
 * No AI - pure template-driven code generation with deterministic output.
 */

import * as fs from "fs";
import * as path from "path";

export interface TemplateContext {
  apiName: string;
  apiVersion: string;
  basePath: string;
  endpoints: EndpointInfo[];
  types: TypeInfo[];
  auth?: AuthInfo;
  description?: string;
}

export interface EndpointInfo {
  path: string;
  method: string;
  operationId: string;
  description?: string;
  parameters: ParameterInfo[];
  requestBody?: RequestBodyInfo;
  responses: ResponseInfo[];
}

export interface ParameterInfo {
  name: string;
  in: "path" | "query" | "header";
  type: string;
  required: boolean;
  description?: string;
}

export interface RequestBodyInfo {
  type: string;
  required: boolean;
  description?: string;
}

export interface ResponseInfo {
  status: string;
  type: string;
  description?: string;
}

export interface TypeInfo {
  name: string;
  properties: PropertyInfo[];
  description?: string;
}

export interface PropertyInfo {
  name: string;
  type: string;
  required: boolean;
  description?: string;
}

export interface AuthInfo {
  type: "apiKey" | "bearer" | "oauth2";
  header?: string;
  paramName?: string;
}

/**
 * Template-based SDK code generator
 */
export class TemplateSDKGenerator {
  /**
   * Generate complete SDK from normalized spec
   */
  static generateSDK(
    context: TemplateContext,
    language: string = "typescript"
  ): Map<string, string> {
    const files = new Map<string, string>();

    if (language === "typescript") {
      files.set("types.ts", this.generateTypes(context));
      files.set("client.ts", this.generateClient(context));
      files.set("errors.ts", this.generateErrors(context));
      files.set("auth.ts", this.generateAuth(context));
      files.set("index.ts", this.generateIndex(context));
      files.set("README.md", this.generateReadme(context));
      files.set("package.json", this.generatePackageJson(context));
    }

    return files;
  }

  /**
   * Generate TypeScript type definitions
   */
  private static generateTypes(context: TemplateContext): string {
    const lines: string[] = [
      `/**`,
      ` * ${context.apiName} - Type Definitions`,
      ` * Auto-generated from API specification`,
      ` * @version ${context.apiVersion}`,
      ` */`,
      ``,
      `// ============================================================================`,
      `// REQUEST/RESPONSE TYPES`,
      `// ============================================================================`,
      ``,
    ];

    // Generate type definitions for each type in spec
    if (context.types && context.types.length > 0) {
      for (const type of context.types) {
        lines.push(`/**`);
        lines.push(` * ${type.description || type.name}`);
        lines.push(` */`);
        lines.push(`export interface ${type.name} {`);

        if (type.properties && type.properties.length > 0) {
          for (const prop of type.properties) {
            const optional = !prop.required ? "?" : "";
            lines.push(`  /** ${prop.description || ""} */`);
            lines.push(`  ${prop.name}${optional}: ${this.mapType(prop.type)};`);
          }
        }

        lines.push(`}`);
        lines.push(``);
      }
    }

    // Generate request/response types for each endpoint
    lines.push(`// ============================================================================`);
    lines.push(`// ENDPOINT-SPECIFIC TYPES`);
    lines.push(`// ============================================================================`);
    lines.push(``);

    for (const endpoint of context.endpoints) {
      const operationId = this.toCamelCase(endpoint.operationId);

      // Request type
      lines.push(`export interface ${this.toTitleCase(operationId)}Request {`);
      for (const param of (endpoint.parameters || [])) {
        const optional = !param.required ? "?" : "";
        lines.push(`  ${param.name}${optional}: ${this.mapType(param.type)};`);
      }
      if (endpoint.requestBody) {
        lines.push(`  body?: ${endpoint.requestBody.type};`);
      }
      lines.push(`}`);
      lines.push(``);

      // Response type
      const responses = (endpoint.responses || []).filter((r) => r.status === "200")[0];
      if (responses) {
        lines.push(`export interface ${this.toTitleCase(operationId)}Response {`);
        lines.push(`  data: ${responses.type};`);
        lines.push(`}`);
        lines.push(``);
      }
    }

    lines.push(`// ============================================================================`);
    lines.push(`// CLIENT CONFIGURATION`);
    lines.push(`// ============================================================================`);
    lines.push(``);
    lines.push(`export interface ClientConfig {`);
    lines.push(`  baseURL: string;`);
    lines.push(`  timeout?: number;`);
    lines.push(`  headers?: Record<string, string>;`);
    if (context.auth) {
      lines.push(`  auth?: AuthConfig;`);
    }
    lines.push(`}`);
    lines.push(``);

    if (context.auth) {
      lines.push(`export interface AuthConfig {`);
      lines.push(`  type: '${context.auth.type}';`);
      if (context.auth.type === "apiKey") {
        lines.push(`  apiKey: string;`);
      } else if (context.auth.type === "bearer") {
        lines.push(`  token: string;`);
      } else if (context.auth.type === "oauth2") {
        lines.push(`  clientId: string;`);
        lines.push(`  clientSecret: string;`);
      }
      lines.push(`}`);
    }

    return lines.join("\n") + "\n";
  }

  /**
   * Generate main client class
   */
  private static generateClient(context: TemplateContext): string {
    const lines: string[] = [
      `/**`,
      ` * ${context.apiName} Client`,
      ` * ${context.description || "Auto-generated SDK client"}`,
      ` * @version ${context.apiVersion}`,
      ` */`,
      ``,
      `import * as Types from './types';`,
      `import { SDKError, NetworkError, ValidationError } from './errors';`,
      `import { AuthHandler } from './auth';`,
      ``,
      `export class ${context.apiName}Client {`,
      `  private baseURL: string;`,
      `  private timeout: number;`,
      `  private headers: Record<string, string>;`,
      `  private authHandler?: AuthHandler;`,
      ``,
      `  constructor(config: Types.ClientConfig) {`,
      `    this.baseURL = config.baseURL;`,
      `    this.timeout = config.timeout || 30000;`,
      `    this.headers = config.headers || {};`,
      ``,
      `    if (config.auth) {`,
      `      this.authHandler = new AuthHandler(config.auth);`,
      `    }`,
      `  }`,
      ``,
      `  /**`,
      `   * Make an HTTP request`,
      `   */`,
      `  private async request<T = any>(`,
      `    method: string,`,
      `    path: string,`,
      `    options?: { query?: Record<string, any>; body?: any; headers?: Record<string, string> }`,
      `  ): Promise<T> {`,
      `    try {`,
      `      const url = new URL(path, this.baseURL);`,
      ``,
      `      // Add query parameters`,
      `      if (options?.query) {`,
      `        Object.entries(options.query).forEach(([key, value]) => {`,
      `          if (value !== undefined && value !== null) {`,
      `            url.searchParams.append(key, String(value));`,
      `          }`,
      `        });`,
      `      }`,
      ``,
      `      // Prepare headers`,
      `      const headers: Record<string, string> = { ...this.headers };`,
      `      if (options?.headers) {`,
      `        Object.assign(headers, options.headers);`,
      `      }`,
      ``,
      `      // Add auth headers`,
      `      if (this.authHandler) {`,
      `        Object.assign(headers, await this.authHandler.getHeaders());`,
      `      }`,
      ``,
      `      // Make request`,
      `      const response = await fetch(url.toString(), {`,
      `        method,`,
      `        headers,`,
      `        body: options?.body ? JSON.stringify(options.body) : undefined,`,
      `      });`,
      ``,
      `      if (!response.ok) {`,
      `        const error = await response.json().catch(() => ({}));`,
      `        throw new NetworkError(`,
      `          \`HTTP \${response.status}: \${error.message || response.statusText}\`,`,
      `          response.status,`,
      `          error`,
      `        );`,
      `      }`,
      ``,
      `      return (await response.json()) as T;`,
      `    } catch (error) {`,
      `      if (error instanceof SDKError) throw error;`,
      `      throw new SDKError(\`Request failed: \${(error as Error).message}\`, error);`,
      `    }`,
      `  }`,
      ``,
    ];

    // Generate method for each endpoint
    for (const endpoint of context.endpoints) {
      const operationId = this.toCamelCase(endpoint.operationId);
      const requestType = `Types.${this.toTitleCase(operationId)}Request`;
      const responseType = `Types.${this.toTitleCase(operationId)}Response`;

      lines.push(`  /**`);
      lines.push(`   * ${endpoint.description || endpoint.operationId}`);
      lines.push(`   * @method ${endpoint.method}`);
      lines.push(`   * @path ${endpoint.path}`);
      lines.push(`   */`);
      lines.push(`  async ${operationId}(request: ${requestType}): Promise<${responseType}> {`);
      lines.push(`    const response = await this.request<${responseType}>(`);
      lines.push(`      '${endpoint.method.toUpperCase()}',`);
      lines.push(`      '${endpoint.path}',`);
      lines.push(`      { query: request, body: request.body }`,
      `    );`);
      lines.push(`    return response;`);
      lines.push(`  }`);
      lines.push(``);
    }

    lines.push(`}`);

    return lines.join("\n") + "\n";
  }

  /**
   * Generate error classes
   */
  private static generateErrors(_context: TemplateContext): string {
    return `/**
 * Error Classes
 * Custom error types for SDK
 */

export class SDKError extends Error {
  constructor(
    message: string,
    public originalError?: any
  ) {
    super(message);
    this.name = 'SDKError';
    Object.setPrototypeOf(this, SDKError.prototype);
  }
}

export class NetworkError extends SDKError {
  constructor(
    message: string,
    public statusCode: number,
    public response?: any
  ) {
    super(message);
    this.name = 'NetworkError';
    Object.setPrototypeOf(this, NetworkError.prototype);
  }
}

export class ValidationError extends SDKError {
  constructor(
    message: string,
    public errors: Record<string, string[]> = {}
  ) {
    super(message);
    this.name = 'ValidationError';
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

export class AuthenticationError extends SDKError {
  constructor(message: string) {
    super(message);
    this.name = 'AuthenticationError';
    Object.setPrototypeOf(this, AuthenticationError.prototype);
  }
}

export class AuthorizationError extends SDKError {
  constructor(message: string) {
    super(message);
    this.name = 'AuthorizationError';
    Object.setPrototypeOf(this, AuthorizationError.prototype);
  }
}
`;
  }

  /**
   * Generate auth handler
   */
  private static generateAuth(context: TemplateContext): string {
    if (!context.auth) {
      return `/**
 * Auth Handler (No Authentication)
 */

export class AuthHandler {
  async getHeaders(): Promise<Record<string, string>> {
    return {};
  }
}
`;
    }

    const authType = context.auth.type;

    if (authType === "apiKey") {
      return `/**
 * API Key Authentication Handler
 */

import * as Types from './types';

export class AuthHandler {
  private config: Types.AuthConfig;

  constructor(config: Types.AuthConfig) {
    this.config = config;
  }

  async getHeaders(): Promise<Record<string, string>> {
    if (this.config.type !== 'apiKey') {
      throw new Error('Invalid auth type');
    }
    return {
      '${context.auth.header || "X-API-Key"}': this.config.apiKey || '',
    };
  }
}
`;
    }

    if (authType === "bearer") {
      return `/**
 * Bearer Token Authentication Handler
 */

import * as Types from './types';

export class AuthHandler {
  private config: Types.AuthConfig;

  constructor(config: Types.AuthConfig) {
    this.config = config;
  }

  async getHeaders(): Promise<Record<string, string>> {
    if (this.config.type !== 'bearer') {
      throw new Error('Invalid auth type');
    }
    return {
      'Authorization': \`Bearer \${this.config.token || ''}\`,
    };
  }
}
`;
    }

    return `/**
 * OAuth2 Authentication Handler
 */

import * as Types from './types';

export class AuthHandler {
  private config: Types.AuthConfig;

  constructor(config: Types.AuthConfig) {
    this.config = config;
  }

  async getHeaders(): Promise<Record<string, string>> {
    if (this.config.type !== 'oauth2') {
      throw new Error('Invalid auth type');
    }
    // OAuth2 implementation would go here
    return {};
  }
}
`;
  }

  /**
   * Generate index/export file
   */
  private static generateIndex(context: TemplateContext): string {
    return `/**
 * ${context.apiName} SDK
 * ${context.description || "Auto-generated SDK"}
 * @version ${context.apiVersion}
 */

export * from './types';
export * from './errors';
export * from './auth';
export { ${context.apiName}Client } from './client';

// Re-exports for convenience
import { ${context.apiName}Client } from './client';
import * as Types from './types';

export default ${context.apiName}Client;
export { Types };
`;
  }

  /**
   * Generate README
   */
  private static generateReadme(context: TemplateContext): string {
    return `# ${context.apiName} SDK

${context.description || "Auto-generated SDK for " + context.apiName}

**Version:** ${context.apiVersion}

## Installation

\`\`\`bash
npm install ${context.apiName.toLowerCase()}-sdk
\`\`\`

## Usage

\`\`\`typescript
import { ${context.apiName}Client } from '${context.apiName.toLowerCase()}-sdk';

const client = new ${context.apiName}Client({
  baseURL: '${context.basePath}',
  timeout: 30000,
});
\`\`\`

## API Methods

${context.endpoints
  .map((ep) => {
    const operationId = this.toCamelCase(ep.operationId);
    return `### \`${operationId}()\`

\`\`\`typescript
await client.${operationId}({
  // parameters
});
\`\`\`

${ep.description || ""}
`;
  })
  .join("\n")}

## Error Handling

\`\`\`typescript
import { SDKError, NetworkError, ValidationError } from '${context.apiName.toLowerCase()}-sdk';

try {
  await client.someMethod({});
} catch (error) {
  if (error instanceof NetworkError) {
    console.error('Network error:', error.statusCode);
  } else if (error instanceof ValidationError) {
    console.error('Validation error:', error.errors);
  } else if (error instanceof SDKError) {
    console.error('SDK error:', error.message);
  }
}
\`\`\`

## License

MIT
`;
  }

  /**
   * Generate package.json
   */
  private static generatePackageJson(context: TemplateContext): string {
    return JSON.stringify(
      {
        name: `@${context.apiName.toLowerCase()}/sdk`,
        version: context.apiVersion,
        description: context.description || `SDK for ${context.apiName}`,
        main: "dist/index.js",
        types: "dist/index.d.ts",
        files: ["dist"],
        scripts: {
          build: "tsc",
          test: "vitest",
          lint: "eslint src",
        },
        dependencies: {},
        devDependencies: {
          typescript: "^5.0.0",
        },
        keywords: ["sdk", "api", context.apiName.toLowerCase()],
        license: "MIT",
      },
      null,
      2
    );
  }

  // HELPER METHODS

  private static mapType(
    type: string
  ): string {
    const typeMap: Record<string, string> = {
      string: "string",
      integer: "number",
      number: "number",
      boolean: "boolean",
      object: "Record<string, any>",
      array: "any[]",
      date: "Date",
      datetime: "Date",
      uuid: "string",
      email: "string",
    };
    return typeMap[type.toLowerCase()] || "any";
  }

  private static toCamelCase(str: string): string {
    return str
      .replace(/[^a-zA-Z0-9]+(.)/g, (_, char) => char.toUpperCase())
      .replace(/^([A-Z])/, (_, char) => char.toLowerCase());
  }

  private static toTitleCase(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}
