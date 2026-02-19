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
import * as AST from "./types";
/**
 * Builder for client class
 */
export declare class ClientClassBuilder {
    /**
     * Build the main SDK client class
     */
    static build(plan: any): AST.ASTClassDeclaration;
}
/**
 * Builder for error types
 */
export declare class ErrorTypeBuilder {
    /**
     * Build error class declarations
     */
    static buildErrors(_plan: any): AST.ASTStatement[];
}
/**
 * Builder for configuration types
 */
export declare class ConfigurationBuilder {
    /**
     * Build configuration interface and factory
     */
    static buildConfig(plan: any): AST.ASTStatement[];
}
/**
 * Builder for method implementations
 */
export declare class MethodBuilder {
    /**
     * Build a single method implementation
     */
    static buildMethod(methodPlan: any, _clientName: string): AST.ASTMethodDeclaration;
}
/**
 * Builder for type definitions
 */
export declare class TypeDefinitionBuilder {
    /**
     * Build interface from type definition
     */
    static buildType(typePlan: any): AST.ASTStatement;
}
//# sourceMappingURL=generators.d.ts.map