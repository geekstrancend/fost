/**
 * FOST Generator API
 * Programmatic interface for SDK generation
 * Can be used in CLI, scripts, or integrated with other tools
 */
export interface GeneratorAPI {
    generate(config: GenerationConfig): Promise<GenerationResult>;
    validate(config: ValidationConfig): Promise<ValidationResult>;
    analyzeInput(config: AnalysisConfig): Promise<InputAnalysis>;
    generateTests(config: TestGenerationConfig): Promise<void>;
    generateDocumentation(config: DocumentationConfig): Promise<void>;
    validateGeneration(config: GenerationValidationConfig): Promise<GenerationValidationResult>;
    runTests(config: TestConfig): Promise<TestResult>;
    lintCode(config: LintConfig): Promise<LintResult>;
    getConfig(): Promise<any>;
    setConfig(key: string, value: any): Promise<void>;
    resetConfig(): Promise<void>;
    getCompletion(shell: string): Promise<string>;
}
export interface GenerationConfig {
    inputFile: string;
    language: string;
    type: "web2" | "web3" | "hybrid";
    outputPath: string;
    name?: string;
    version?: string;
    config?: {
        includeTests?: boolean;
        includeDocumentation?: boolean;
        customRules?: string[];
    };
}
export interface ValidationConfig {
    inputFile: string;
    type: "web2" | "web3";
    strict?: boolean;
    customRules?: string;
}
export interface AnalysisConfig {
    inputFile: string;
    type: "web2" | "web3";
}
export interface TestGenerationConfig {
    outputPath: string;
    language: string;
    type: "web2" | "web3" | "hybrid";
}
export interface DocumentationConfig {
    outputPath: string;
    analysis: InputAnalysis;
}
export interface GenerationValidationConfig {
    outputPath: string;
}
export interface TestConfig {
    sdkPath: string;
    testType?: "unit" | "integration" | "all";
    coverage?: boolean;
    watch?: boolean;
}
export interface LintConfig {
    sdkPath: string;
    fix?: boolean;
    strict?: boolean;
}
export interface GenerationResult {
    success: boolean;
    outputPath: string;
    filesGenerated: number;
    duration: string;
    warnings: string[];
}
export interface ValidationResult {
    valid: boolean;
    errors: ValidationError[];
    warnings: ValidationWarning[];
    metadata?: {
        inputFile: string;
        type: string;
        schemas: number;
        endpoints?: number;
    };
}
export interface ValidationError {
    code: string;
    message: string;
    location?: string;
    suggestion?: string;
}
export interface ValidationWarning {
    code: string;
    message: string;
    location?: string;
}
export interface InputAnalysis {
    methods: number;
    types: number;
    endpoints?: number;
    schemas?: number;
    errors?: number;
    parameters?: number;
    coverage?: number;
    complexity?: "low" | "medium" | "high";
}
export interface TestResult {
    allPassed: boolean;
    totalTests: number;
    passedTests: number;
    failedTests: number;
    skippedTests: number;
    duration: string;
    coverage: number;
    failures: TestFailure[];
}
export interface TestFailure {
    test: string;
    error: string;
    file: string;
    line: number;
}
export interface LintResult {
    issues: LintIssue[];
    fixedCount: number;
    totalIssues: number;
}
export interface LintIssue {
    file: string;
    line: number;
    column: number;
    message: string;
    rule: string;
    severity: "error" | "warning" | "info";
    fixable: boolean;
}
export interface GenerationValidationResult {
    valid: boolean;
    issues: string[];
    warnings: string[];
}
/**
 * Create Generator API instance
 */
export declare function createGeneratorAPI(): GeneratorAPI;
/**
 * Generator API Class for direct instantiation
 */
export declare class GeneratorService implements GeneratorAPI {
    private config;
    generate(config: GenerationConfig): Promise<GenerationResult>;
    validate(_config: ValidationConfig): Promise<ValidationResult>;
    analyzeInput(_config: AnalysisConfig): Promise<InputAnalysis>;
    generateTests(_config: TestGenerationConfig): Promise<void>;
    generateDocumentation(_config: DocumentationConfig): Promise<void>;
    validateGeneration(_config: GenerationValidationConfig): Promise<GenerationValidationResult>;
    runTests(_config: TestConfig): Promise<TestResult>;
    lintCode(_config: LintConfig): Promise<LintResult>;
    getConfig(): Promise<any>;
    setConfig(_key: string, _value: any): Promise<void>;
    resetConfig(): Promise<void>;
    getCompletion(_shell: string): Promise<string>;
}
//# sourceMappingURL=generator-api.d.ts.map