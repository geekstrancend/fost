/**
 * CODE GENERATION - Public API
 *
 * Exports the complete code generation system for SDK production.
 */
export type { SDKDesignPlan, SDKMethod, MethodParameter, SDKTypeDefinition, SDKErrorType, AuthScheme, ConfigurationSchema, FolderStructure, GenerationOptions, GeneratedCodeFile, GeneratedSDK, ASTNode, ASTProgram, ASTStatement, ASTExpression, ASTImportStatement, ASTClassDeclaration, ASTConstructor, ASTMethodDeclaration, ASTPropertyDeclaration, ASTParameter, ASTInterfaceDeclaration, ASTEnumDeclaration, ASTReturnStatement, ASTThrowStatement, ASTIfStatement, ASTForStatement, ASTTryCatchStatement, ASTCallExpression, ASTObjectExpression, ASTArrayExpression, ASTLiteral, ASTIdentifier, ASTMemberExpression, ASTBinaryExpression, ASTConditionalExpression, ASTVariableDeclaration, ASTFunctionDeclaration, } from "./types";
export { TypeScriptEmitter, CodeBuilder, EmitterOptions, DEFAULT_EMITTER_OPTIONS } from "./emitter";
export { ClientClassBuilder, ErrorTypeBuilder, ConfigurationBuilder, MethodBuilder, TypeDefinitionBuilder, } from "./generators";
export { SDKCodeGenerator, GenerationResult, GeneratedFile } from "./index";
//# sourceMappingURL=api.d.ts.map