/**
 * Documentation and Examples Generator for SDKs
 * Generates production-ready documentation that exactly matches generated code
 * Supports Web2 (REST/GraphQL), Web3 (Blockchain), and other SDK types
 */
import { SDKDesignPlan, SDKMethod } from "./types";
/**
 * SDK Type definition
 */
export interface SDKType {
    name: string;
    description: string;
    properties?: Record<string, {
        type: string;
        description?: string;
    }>;
}
/**
 * Documentation configuration for SDK documentation generation
 */
export interface DocumentationConfig {
    sdkName: string;
    sdkVersion: string;
    description: string;
    audience: "beginner" | "intermediate" | "advanced";
    language: "typescript" | "python" | "go" | "javascript";
    includeTypeExamples: boolean;
    includeErrorExamples: boolean;
    includeAdvancedPatterns: boolean;
    codeLanguage: string;
    targetEnvironment: "node" | "browser" | "both";
    sections: DocumentationSection[];
    customSections?: CustomDocumentationSection[];
    baseURL?: string;
    repositoryURL?: string;
    documentationBaseURL?: string;
    issueTrackerURL?: string;
    authMethod?: "none" | "api-key" | "oauth" | "wallet" | "custom";
    authRequired: boolean;
}
/**
 * Predefined documentation sections
 */
export type DocumentationSection = "overview" | "installation" | "authentication" | "quickstart" | "api-reference" | "examples" | "error-handling" | "advanced" | "testing" | "faq" | "troubleshooting";
/**
 * Custom documentation section
 */
interface CustomDocumentationSection {
    name: string;
    title: string;
    content: string;
    order: number;
}
/**
 * Generated documentation output
 */
export interface GeneratedDocumentation {
    readme: string;
    quickstart: string;
    authentication: string;
    examples: string;
    errorHandling: string;
    apiReference: string;
    advancedPatterns?: string;
    troubleshooting?: string;
    faq?: string;
}
/**
 * Documentation context built from SDK design
 */
export interface DocumentationContext {
    config: DocumentationConfig;
    designPlan: SDKDesignPlan;
    methods: Map<string, SDKMethod>;
    types: Map<string, SDKType>;
    errorTypes: Map<string, ErrorDocumentation>;
    exampleCode: Map<string, string>;
    prerequisites: string[];
    setupSteps: string[];
}
/**
 * Error documentation
 */
export interface ErrorDocumentation {
    errorCode: string;
    errorType: string;
    description: string;
    cause: string;
    solution: string;
    example: string;
    recoverable: boolean;
}
/**
 * Documentation template
 */
export interface DocumentationTemplate {
    section: DocumentationSection;
    template: (context: DocumentationContext) => string;
    requiredFields: string[];
}
/**
 * Code example for documentation
 */
export interface CodeExample {
    title: string;
    description: string;
    language: string;
    code: string;
    tags: string[];
    difficulty: "beginner" | "intermediate" | "advanced";
    output?: string;
    explanation?: string;
}
export declare class ReadmeBuilder {
    private config;
    private context;
    constructor(config: DocumentationConfig);
    withContext(context: DocumentationContext): ReadmeBuilder;
    build(): string;
    private buildHeader;
    private buildQuickLinks;
    private buildFeatures;
    private buildInstallation;
    private buildQuickStart;
    private buildDocumentationLinks;
    private buildSupport;
    private buildFooter;
    private extractFeatures;
    private getImportExample;
    private getClientCreationExample;
    private getFirstCallExample;
    private getLanguageInstallCommand;
}
export declare class QuickstartBuilder {
    private config;
    private context;
    constructor(config: DocumentationConfig);
    withContext(context: DocumentationContext): QuickstartBuilder;
    build(): string;
    private buildTitle;
    private buildPrerequisites;
    private buildSetup;
    private buildFirstRequest;
    private buildCommonTasks;
    private buildNextSteps;
    private getInstallCommand;
    private buildMethodExample;
}
export declare class AuthenticationBuilder {
    private config;
    constructor(config: DocumentationConfig);
    withContext(_context: DocumentationContext): AuthenticationBuilder;
    build(): string;
    private buildTitle;
    private buildAuthMethod;
    private buildApiKeyAuth;
    private buildOAuthAuth;
    private buildWalletAuth;
    private buildSetupGuide;
    private buildBestPractices;
    private buildTroubleshooting;
    private buildNoAuthRequired;
}
export declare class ExamplesBuilder {
    private examples;
    withContext(_context: DocumentationContext): ExamplesBuilder;
    addExample(example: CodeExample): ExamplesBuilder;
    build(): string;
    private buildTitle;
    private buildBeginnerExamples;
    private buildIntermediateExamples;
    private buildAdvancedExamples;
    private buildExampleSection;
}
export declare class ErrorHandlingBuilder {
    private _context;
    withContext(_context: DocumentationContext): ErrorHandlingBuilder;
    build(): string;
    private buildTitle;
    private buildErrorTypes;
    private buildGenericErrors;
    private buildRecoveryStrategies;
    private buildErrorHandlingPatterns;
    private categorizeError;
}
export declare class DocumentationGenerator {
    private config;
    private context;
    constructor(config: DocumentationConfig);
    withDesignPlan(designPlan: SDKDesignPlan): DocumentationGenerator;
    withMethods(methods: SDKMethod[]): DocumentationGenerator;
    withErrors(errors: ErrorDocumentation[]): DocumentationGenerator;
    generateReadme(): string;
    generateQuickstart(): string;
    generateAuthentication(): string;
    generateExamples(examples: CodeExample[]): string;
    generateErrorHandling(): string;
    generateAll(examples: CodeExample[]): GeneratedDocumentation;
    private generateApiReference;
}
export {};
//# sourceMappingURL=doc-generator.d.ts.map