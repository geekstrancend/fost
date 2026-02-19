"use strict";
/**
 * GENERATOR BUILDERS - Constructs AST nodes for SDK components
 *
 * Each builder creates production-grade code for a specific SDK component:
 * - Client class
 * - Error types
 * - Configuration
 * - Type definitions
 * - Method wrappers
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.TypeDefinitionBuilder = exports.MethodBuilder = exports.ConfigurationBuilder = exports.ErrorTypeBuilder = exports.ClientClassBuilder = void 0;
/**
 * Builder for client class
 */
class ClientClassBuilder {
    /**
     * Build the main SDK client class
     */
    static build(plan) {
        const clientName = plan.client.className;
        const properties = [
            {
                type: "PropertyDeclaration",
                name: "private config",
                valueType: "ClientConfig",
                readonly: false,
                isPrivate: true,
            },
            {
                type: "PropertyDeclaration",
                name: "private httpClient",
                valueType: "any",
                readonly: false,
                isPrivate: true,
            },
            {
                type: "PropertyDeclaration",
                name: "private authHandler",
                valueType: "AuthHandler | null",
                readonly: false,
                isPrivate: true,
            },
        ];
        const constructor = {
            type: "Constructor",
            parameters: [
                {
                    type: "Parameter",
                    name: "config",
                    parameterType: "ClientConfig",
                    optional: false,
                },
            ],
            body: [
                {
                    type: "VariableDeclaration",
                    kind: "const",
                    name: "validated",
                    valueType: "ClientConfig",
                    initializer: {
                        type: "CallExpression",
                        callee: "this.validateConfig",
                        arguments: ["config"],
                    },
                },
                {
                    type: "VariableDeclaration",
                    kind: "this.config = validated",
                    name: "",
                    valueType: "",
                },
                {
                    type: "VariableDeclaration",
                    kind: "this.httpClient = createHttpClient",
                    name: "",
                    valueType: "",
                },
                {
                    type: "VariableDeclaration",
                    kind: "this.authHandler = this.initializeAuth",
                    name: "",
                    valueType: "",
                },
            ],
        };
        const methods = [
            {
                type: "MethodDeclaration",
                name: "private validateConfig",
                isAsync: false,
                isPrivate: true,
                parameters: [
                    {
                        type: "Parameter",
                        name: "config",
                        parameterType: "ClientConfig",
                        optional: false,
                    },
                ],
                returnType: "ClientConfig",
                body: [
                    {
                        type: "IfStatement",
                        condition: {
                            type: "UnaryExpression",
                            operator: "!",
                            argument: {
                                type: "MemberExpression",
                                object: "config",
                                property: "apiKey",
                                computed: false,
                            },
                        },
                        consequent: [
                            {
                                type: "ThrowStatement",
                                argument: {
                                    type: "CallExpression",
                                    callee: "new ConfigError",
                                    arguments: ['"Missing required apiKey configuration"'],
                                },
                            },
                        ],
                    },
                    {
                        type: "ReturnStatement",
                        argument: {
                            type: "Identifier",
                            name: "config",
                        },
                    },
                ],
            },
            {
                type: "MethodDeclaration",
                name: "private initializeAuth",
                isAsync: false,
                isPrivate: true,
                parameters: [],
                returnType: "AuthHandler | null",
                body: [
                    {
                        type: "IfStatement",
                        condition: {
                            type: "BinaryExpression",
                            left: {
                                type: "MemberExpression",
                                object: "this.config",
                                property: "authType",
                                computed: false,
                            },
                            operator: "===",
                            right: {
                                type: "Literal",
                                value: "bearer",
                                raw: '"bearer"',
                            },
                        },
                        consequent: [
                            {
                                type: "ReturnStatement",
                                argument: {
                                    type: "CallExpression",
                                    callee: "new BearerAuthHandler",
                                    arguments: ["this.config"],
                                },
                            },
                        ],
                    },
                    {
                        type: "ReturnStatement",
                        argument: {
                            type: "Literal",
                            value: null,
                            raw: "null",
                        },
                    },
                ],
            },
        ];
        return {
            type: "ClassDeclaration",
            name: clientName,
            isExported: true,
            documentation: `Main SDK client for ${plan.product.name}.\n\nInitialize with configuration and use methods to interact with the API.`,
            properties,
            constructor,
            methods,
        };
    }
}
exports.ClientClassBuilder = ClientClassBuilder;
/**
 * Builder for error types
 */
class ErrorTypeBuilder {
    /**
     * Build error class declarations
     */
    static buildErrors(_plan) {
        const errorStmts = [];
        // Base SDK Error
        const baseErrorClass = {
            type: "ClassDeclaration",
            name: "SDKError",
            extends: "Error",
            isExported: true,
            documentation: "Base error for all SDK errors",
            properties: [
                {
                    type: "PropertyDeclaration",
                    name: "code",
                    valueType: "string",
                    readonly: true,
                    isPrivate: false,
                },
                {
                    type: "PropertyDeclaration",
                    name: "statusCode",
                    valueType: "number | undefined",
                    readonly: true,
                    isPrivate: false,
                },
                {
                    type: "PropertyDeclaration",
                    name: "context",
                    valueType: "Record<string, any>",
                    readonly: true,
                    isPrivate: false,
                },
            ],
            constructor: {
                type: "Constructor",
                parameters: [
                    {
                        type: "Parameter",
                        name: "message",
                        parameterType: "string",
                        optional: false,
                    },
                    {
                        type: "Parameter",
                        name: "code",
                        parameterType: "string",
                        optional: false,
                    },
                    {
                        type: "Parameter",
                        name: "statusCode",
                        parameterType: "number | undefined",
                        optional: true,
                    },
                ],
                body: [
                    {
                        type: "VariableDeclaration",
                        kind: "super",
                        name: "message",
                        valueType: "",
                    },
                    {
                        type: "VariableDeclaration",
                        kind: "this.code = code",
                        name: "",
                        valueType: "",
                    },
                    {
                        type: "VariableDeclaration",
                        kind: "this.statusCode = statusCode",
                        name: "",
                        valueType: "",
                    },
                    {
                        type: "VariableDeclaration",
                        kind: "this.context = {}",
                        name: "",
                        valueType: "",
                    },
                ],
            },
            methods: [
                {
                    type: "MethodDeclaration",
                    name: "withContext",
                    isAsync: false,
                    isPrivate: false,
                    parameters: [
                        {
                            type: "Parameter",
                            name: "context",
                            parameterType: "Record<string, any>",
                            optional: false,
                        },
                    ],
                    returnType: "this",
                    body: [
                        {
                            type: "VariableDeclaration",
                            kind: "Object.assign",
                            name: "(this.context, context)",
                            valueType: "",
                        },
                        {
                            type: "ReturnStatement",
                            argument: {
                                type: "Identifier",
                                name: "this",
                            },
                        },
                    ],
                },
            ],
        };
        errorStmts.push(baseErrorClass);
        // Configuration Error
        const configErrorClass = {
            type: "ClassDeclaration",
            name: "ConfigError",
            extends: "SDKError",
            isExported: true,
            documentation: "Error thrown when configuration is invalid",
            constructor: {
                type: "Constructor",
                parameters: [
                    {
                        type: "Parameter",
                        name: "message",
                        parameterType: "string",
                        optional: false,
                    },
                ],
                body: [
                    {
                        type: "VariableDeclaration",
                        kind: "super",
                        name: '(message, "CONFIG_ERROR", 400)',
                        valueType: "",
                    },
                ],
            },
            properties: [],
            methods: [],
        };
        errorStmts.push(configErrorClass);
        // Network Error
        const networkErrorClass = {
            type: "ClassDeclaration",
            name: "NetworkError",
            extends: "SDKError",
            isExported: true,
            documentation: "Error thrown when network request fails",
            constructor: {
                type: "Constructor",
                parameters: [
                    {
                        type: "Parameter",
                        name: "message",
                        parameterType: "string",
                        optional: false,
                    },
                    {
                        type: "Parameter",
                        name: "statusCode",
                        parameterType: "number",
                        optional: true,
                    },
                ],
                body: [
                    {
                        type: "VariableDeclaration",
                        kind: "super",
                        name: '(message, "NETWORK_ERROR", statusCode)',
                        valueType: "",
                    },
                ],
            },
            properties: [],
            methods: [],
        };
        errorStmts.push(networkErrorClass);
        // API Error
        const apiErrorClass = {
            type: "ClassDeclaration",
            name: "APIError",
            extends: "SDKError",
            isExported: true,
            documentation: "Error returned by the API",
            properties: [
                {
                    type: "PropertyDeclaration",
                    name: "requestId",
                    valueType: "string | undefined",
                    readonly: true,
                    isPrivate: false,
                },
            ],
            constructor: {
                type: "Constructor",
                parameters: [
                    {
                        type: "Parameter",
                        name: "message",
                        parameterType: "string",
                        optional: false,
                    },
                    {
                        type: "Parameter",
                        name: "code",
                        parameterType: "string",
                        optional: false,
                    },
                    {
                        type: "Parameter",
                        name: "statusCode",
                        parameterType: "number",
                        optional: false,
                    },
                ],
                body: [
                    {
                        type: "VariableDeclaration",
                        kind: "super",
                        name: "(message, code, statusCode)",
                        valueType: "",
                    },
                    {
                        type: "VariableDeclaration",
                        kind: "this.requestId = undefined",
                        name: "",
                        valueType: "",
                    },
                ],
            },
            methods: [],
        };
        errorStmts.push(apiErrorClass);
        return errorStmts;
    }
}
exports.ErrorTypeBuilder = ErrorTypeBuilder;
/**
 * Builder for configuration types
 */
class ConfigurationBuilder {
    /**
     * Build configuration interface and factory
     */
    static buildConfig(plan) {
        const stmts = [];
        // Config Interface
        const configInterface = {
            type: "InterfaceDeclaration",
            name: "ClientConfig",
            isExported: true,
            documentation: "Configuration for SDK client",
            properties: [
                {
                    type: "PropertyDeclaration",
                    name: "apiKey",
                    valueType: "string",
                    readonly: false,
                    isPrivate: false,
                },
                {
                    type: "PropertyDeclaration",
                    name: "baseUrl",
                    valueType: "string",
                    readonly: false,
                    isPrivate: false,
                },
                {
                    type: "PropertyDeclaration",
                    name: "timeout",
                    valueType: "number",
                    readonly: false,
                    isPrivate: false,
                },
                {
                    type: "PropertyDeclaration",
                    name: "authType",
                    valueType: '"bearer" | "api-key" | "oauth2"',
                    readonly: false,
                    isPrivate: false,
                },
                {
                    type: "PropertyDeclaration",
                    name: "retryPolicy",
                    valueType: "RetryPolicy",
                    readonly: false,
                    isPrivate: false,
                },
                {
                    type: "PropertyDeclaration",
                    name: "logger",
                    valueType: "Logger | null",
                    readonly: false,
                    isPrivate: false,
                },
            ],
        };
        stmts.push(configInterface);
        // Retry Policy Interface
        const retryPolicyInterface = {
            type: "InterfaceDeclaration",
            name: "RetryPolicy",
            isExported: true,
            documentation: "Configuration for automatic retries",
            properties: [
                {
                    type: "PropertyDeclaration",
                    name: "maxRetries",
                    valueType: "number",
                    readonly: false,
                    isPrivate: false,
                },
                {
                    type: "PropertyDeclaration",
                    name: "backoffMultiplier",
                    valueType: "number",
                    readonly: false,
                    isPrivate: false,
                },
                {
                    type: "PropertyDeclaration",
                    name: "initialDelayMs",
                    valueType: "number",
                    readonly: false,
                    isPrivate: false,
                },
            ],
        };
        stmts.push(retryPolicyInterface);
        // Default Config Factory
        const defaultConfigFunc = {
            type: "FunctionDeclaration",
            name: "createDefaultConfig",
            isExported: true,
            isAsync: false,
            parameters: [
                {
                    type: "Parameter",
                    name: "apiKey",
                    parameterType: "string",
                    optional: false,
                },
            ],
            returnType: "ClientConfig",
            documentation: "Create a configuration object with sensible defaults",
            body: [
                {
                    type: "ReturnStatement",
                    argument: {
                        type: "ObjectExpression",
                        properties: [
                            { key: "apiKey", value: "apiKey" },
                            {
                                key: "baseUrl",
                                value: `"${plan.client.baseUrl || "https://api.example.com"}"`,
                            },
                            {
                                key: "timeout",
                                value: String(plan.client.timeout || 30000),
                            },
                            {
                                key: "authType",
                                value: '"bearer"',
                            },
                            {
                                key: "retryPolicy",
                                value: "{ maxRetries: 3, backoffMultiplier: 2, initialDelayMs: 100 }",
                            },
                            {
                                key: "logger",
                                value: "null",
                            },
                        ],
                    },
                },
            ],
        };
        stmts.push(defaultConfigFunc);
        return stmts;
    }
}
exports.ConfigurationBuilder = ConfigurationBuilder;
/**
 * Builder for method implementations
 */
class MethodBuilder {
    /**
     * Build a single method implementation
     */
    static buildMethod(methodPlan, _clientName) {
        const parameters = methodPlan.parameters.map((p) => ({
            type: "Parameter",
            name: p.name,
            parameterType: p.type,
            optional: !p.required,
        }));
        const docString = methodPlan.description || `Call ${methodPlan.name}`;
        const body = [
            {
                type: "VariableDeclaration",
                kind: "const",
                name: "url",
                valueType: "string",
                initializer: {
                    type: "BinaryExpression",
                    left: {
                        type: "MemberExpression",
                        object: "this.config",
                        property: "baseUrl",
                        computed: false,
                    },
                    operator: "+",
                    right: `"${methodPlan.endpoint || "/"}"`
                },
            },
        ];
        if (methodPlan.requiresAuth) {
            body.push({
                type: "IfStatement",
                condition: {
                    type: "BinaryExpression",
                    left: {
                        type: "Identifier",
                        name: "this.authHandler",
                    },
                    operator: "===",
                    right: {
                        type: "Literal",
                        value: null,
                        raw: "null",
                    },
                },
                consequent: [
                    {
                        type: "ThrowStatement",
                        argument: {
                            type: "CallExpression",
                            callee: "new Error",
                            arguments: ['"Authentication is required but not configured"'],
                        },
                    },
                ],
            });
        }
        body.push({
            type: "TryCatchStatement",
            tryBlock: [
                {
                    type: "VariableDeclaration",
                    kind: "const",
                    name: "response",
                    valueType: "any",
                    initializer: {
                        type: "CallExpression",
                        callee: `this.httpClient.${methodPlan.httpMethod?.toLowerCase() || "get"}`,
                        arguments: ["url"],
                    },
                },
                {
                    type: "ReturnStatement",
                    argument: {
                        type: "MemberExpression",
                        object: "response",
                        property: "data",
                        computed: false,
                    },
                },
            ],
            catchClause: {
                param: "error",
                body: [
                    {
                        type: "ThrowStatement",
                        argument: {
                            type: "CallExpression",
                            callee: "this.handleError",
                            arguments: ["error"],
                        },
                    },
                ],
            },
        });
        return {
            type: "MethodDeclaration",
            name: methodPlan.name,
            isAsync: methodPlan.returns.isAsync,
            isPrivate: false,
            parameters,
            returnType: methodPlan.returns.type,
            documentation: docString,
            body,
        };
    }
}
exports.MethodBuilder = MethodBuilder;
/**
 * Builder for type definitions
 */
class TypeDefinitionBuilder {
    /**
     * Build interface from type definition
     */
    static buildType(typePlan) {
        if (typePlan.kind === "interface") {
            return {
                type: "InterfaceDeclaration",
                name: typePlan.name,
                isExported: typePlan.isExported,
                documentation: typePlan.description,
                properties: typePlan.fields?.map((f) => ({
                    type: "PropertyDeclaration",
                    name: f.name,
                    valueType: f.type,
                    readonly: f.readonly || false,
                    isPrivate: false,
                })) || [],
            };
        }
        else if (typePlan.kind === "enum") {
            return {
                type: "EnumDeclaration",
                name: typePlan.name,
                isExported: typePlan.isExported,
                documentation: typePlan.description,
                members: typePlan.enumValues?.map((v) => ({
                    name: v.name,
                    value: v.value,
                })) || [],
            };
        }
        throw new Error(`Unsupported type kind: ${typePlan.kind}`);
    }
}
exports.TypeDefinitionBuilder = TypeDefinitionBuilder;
//# sourceMappingURL=generators.js.map