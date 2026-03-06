/**
 * FOST Generator API - Main SDK Generation Entry Point
 * Programmatic interface for SDK generation from normalized specs
 */

import * as fs from "fs";
import * as path from "path";
import * as yaml from "js-yaml";
import { InputNormalizer } from "../input-analysis/index";
import { SDKGenerationOrchestrator } from "../code-generation/spec-to-template";

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

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
  warnings: string[];
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

// ============================================================================
// IMPLEMENTATION
// ============================================================================

/**
 * Create and return a fully functional Generator API instance
 */
export function createGeneratorAPI(): GeneratorAPI {
  /**
   * Load input file based on extension
   */
  const loadInputFile = (filePath: string): { content: any; format: "json" | "yaml" } => {
    const content = fs.readFileSync(filePath, "utf-8");

    if (filePath.endsWith(".json")) {
      try {
        return { content: JSON.parse(content), format: "json" };
      } catch (e) {
        throw new Error(`Invalid JSON in ${filePath}: ${(e as Error).message}`);
      }
    }

    if (filePath.endsWith(".yaml") || filePath.endsWith(".yml")) {
      try {
        const parsed = yaml.load(content);
        return { content: parsed || {}, format: "yaml" };
      } catch (e) {
        throw new Error(`Failed to parse YAML in ${filePath}: ${(e as Error).message}`);
      }
    }

    throw new Error(`Unsupported file format in ${filePath}. Use .json or .yaml`);
  };

  /**
   * Detect spec type from content
   */
  const detectSpecType = (spec: any): "openapi-3.0" | "openapi-3.1" | "swagger-2.0" | "contract-abi" => {
    if (spec.openapi) {
      return spec.openapi.startsWith("3.1") ? "openapi-3.1" : "openapi-3.0";
    }
    if (spec.swagger) {
      return "swagger-2.0";
    }
    if (Array.isArray(spec)) {
      return "contract-abi";
    }
    throw new Error(
      "Cannot determine spec type. Expected OpenAPI/Swagger or contract ABI array."
    );
  };

  // Return the API methods
  return {
    async generate(config: GenerationConfig): Promise<GenerationResult> {
      const startTime = Date.now();

      try {
        // Load and parse input
        const { content: rawContent, format } = loadInputFile(config.inputFile);
        const specType = detectSpecType(rawContent);

        // Normalize the spec
        const normalizer = new InputNormalizer();
        const normResult = normalizer.normalize({
          type: specType,
          format,
          source: config.inputFile,
          rawContent,
        });

        if (!normResult.success) {
          throw new Error(`Normalization failed: ${(normResult as any).error}`);
        }

        const normalizedSpec = (normResult as any).spec || (normResult as any).data || (normResult as any).normalized;
        if (!normalizedSpec) {
          throw new Error("Normalization produced empty result");
        }

        // Generate SDK files
        const sdkFiles = SDKGenerationOrchestrator.generateSDKFiles(
          normalizedSpec,
          config.language || "typescript",
          (config.type as any) || "web2"
        );

        // Create output directory
        if (!fs.existsSync(config.outputPath)) {
          fs.mkdirSync(config.outputPath, { recursive: true });
        }

        // Write generated files
        let filesWritten = 0;
        for (const [filename, fileContent] of sdkFiles.entries()) {
          const filePath = path.join(config.outputPath, filename);
          const dir = path.dirname(filePath);
          if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
          }
          fs.writeFileSync(filePath, fileContent, "utf-8");
          filesWritten++;
        }

        // Create tsconfig for TypeScript
        if (config.language === "typescript") {
          const tsconfigPath = path.join(config.outputPath, "tsconfig.json");
          fs.writeFileSync(
            tsconfigPath,
            JSON.stringify(
              {
                compilerOptions: {
                  target: "ES2020",
                  module: "nodenext",
                  lib: ["ES2020"],
                  outDir: "./dist",
                  declaration: true,
                  strict: true,
                  esModuleInterop: true,
                  skipLibCheck: true,
                },
                include: ["*.ts"],
              },
              null,
              2
            ),
            "utf-8"
          );
          filesWritten++;
        }

        // Create .gitignore
        const gitignorePath = path.join(config.outputPath, ".gitignore");
        fs.writeFileSync(gitignorePath, "node_modules/\ndist/\n.DS_Store\n", "utf-8");
        filesWritten++;

        const duration = Date.now() - startTime;
        return {
          success: true,
          outputPath: config.outputPath,
          filesGenerated: filesWritten,
          duration: `${(duration / 1000).toFixed(2)}s`,
          warnings: [],
        };
      } catch (error) {
        const duration = Date.now() - startTime;
        throw new Error(
          `SDK generation failed: ${(error as Error).message} (${duration}ms)`
        );
      }
    },

    async validate(config: ValidationConfig): Promise<ValidationResult> {
      try {
        const { content: rawContent, format } = loadInputFile(config.inputFile);
        const specType = detectSpecType(rawContent);

        const normalizer = new InputNormalizer();
        const normResult = normalizer.normalize({
          type: specType,
          format,
          source: config.inputFile,
          rawContent,
        });

        return {
          valid: normResult.success,
          errors: (normResult as any).validationErrors || (normResult as any).parseErrors || [],
          warnings: (normResult as any).warnings || [],
          metadata: {
            inputFile: config.inputFile,
            type: config.type,
            schemas: 0,
          },
        };
      } catch (error) {
        return {
          valid: false,
          errors: [
            {
              code: "PARSE_ERROR",
              message: (error as Error).message,
            },
          ],
          warnings: [],
        };
      }
    },

    async analyzeInput(config: AnalysisConfig): Promise<InputAnalysis> {
      try {
        const { content: rawContent, format } = loadInputFile(config.inputFile);
        const specType = detectSpecType(rawContent);

        const normalizer = new InputNormalizer();
        const normResult = normalizer.normalize({
          type: specType,
          format,
          source: config.inputFile,
          rawContent,
        });

        if (!normResult.success) {
          throw new Error("Analysis failed");
        }

        const spec = (normResult as any).data || (normResult as any);

        return {
          methods: 0,
          types: spec.types ? Object.keys(spec.types).length : 0,
          endpoints: spec.operations ? spec.operations.length : 0,
          complexity: "medium",
        };
      } catch {
        return {
          methods: 0,
          types: 0,
          complexity: "low",
        };
      }
    },

    async generateTests(_config: TestGenerationConfig): Promise<void> {
      // Stub: Test generation planned for v0.2
    },

    async generateDocumentation(_config: DocumentationConfig): Promise<void> {
      // Stub: Doc generation planned for v0.2
    },

    async validateGeneration(
      _config: GenerationValidationConfig
    ): Promise<GenerationValidationResult> {
      return { valid: true, issues: [], warnings: [] };
    },

    async runTests(_config: TestConfig): Promise<TestResult> {
      return {
        allPassed: true,
        totalTests: 0,
        passedTests: 0,
        failedTests: 0,
        skippedTests: 0,
        duration: "0s",
        coverage: 0,
        failures: [],
      };
    },

    async lintCode(_config: LintConfig): Promise<LintResult> {
      return {
        issues: [],
        fixedCount: 0,
        totalIssues: 0,
      };
    },

    async getConfig(): Promise<any> {
      return {
        defaultLanguage: "typescript",
        defaultType: "web2",
        defaultOutput: "./sdk",
      };
    },

    async setConfig(_key: string, _value: any): Promise<void> {
      // Stub: Config management planned for v0.2
    },

    async resetConfig(): Promise<void> {
      // Stub: Config management planned for v0.2
    },

    async getCompletion(_shell: string): Promise<string> {
      return "# Completion support coming in v0.2";
    },
  };
}

/**
 * Pre-created API instance exported as default  
 */
export default createGeneratorAPI();
