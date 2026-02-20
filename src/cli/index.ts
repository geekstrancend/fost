/**
 * FOST CLI - Command Line Interface for SDK Generation
 * Handles command parsing, execution, and output formatting
 *
 * Features:
 * - Command routing and execution
 * - Progress tracking with status updates
 * - Structured error reporting
 * - Multiple output formats (text, JSON)
 * - Configuration management
 */

import { createGeneratorAPI } from "../api/generator-api";
import { createProgressReporter } from "./progress-reporter";
import { createLogger } from "./logger";
import { parseArguments, parseConfig } from "./argument-parser";
import { HELP_MESSAGES, ERROR_MESSAGES, SUCCESS_MESSAGES } from "./constants";
import type {
  Logger,
  ProgressReporter,
  InitOptions,
  GenerateOptions,
  ValidateOptions,
  TestOptions,
  LintOptions,
  CLIOptions,
  GenerationResult,
  ValidationResult,
  TestResult,
  LintResult,
} from "./types";
import { CLIUsageError, GenerationError, ConfigError, FileSystemError } from "../errors/base";

/**
 * Main CLI Application
 * Orchestrates command execution and output
 */
export class CLIApplication {
  private readonly args: string[];
  private readonly logger: Logger;
  private readonly progress: ProgressReporter;
  private readonly api: ReturnType<typeof createGeneratorAPI>;

  constructor(argv?: string[]) {
    this.args = argv || process.argv.slice(2);
    this.logger = createLogger();
    this.progress = createProgressReporter();
    this.api = createGeneratorAPI();
  }

  /**
   * Initialize a new Fost project with starter files
   * Creates configuration, sample specs, environment files, and documentation
   *
   * @param options - Init command options
   * @throws {FileSystemError} If file operations fail
   * @throws {ConfigError} If configuration generation fails
   */
  /**
   * Initialize a new Fost project with starter files
   * Creates configuration, sample specs, environment files, and documentation
   *
   * @param options - Init command options
   * @throws {FileSystemError} If file operations fail
   * @throws {ConfigError} If configuration generation fails
   */
  private async handleInit(options: InitOptions): Promise<void> {
    const projectType = options.type || "web2"; // web2 or web3
    const projectName = options.name || "my-sdk";

    try {
      this.progress.start();
      this.progress.update("Initializing project structure...", 20);

      // Import file system operations
      const fs = await import("fs/promises");

      // Create directories
      const DIRECTORIES = [
        "specs",
        "src",
        "tests",
        ".fost-cache",
      ] as const;

      for (const dir of DIRECTORIES) {
        try {
          await fs.mkdir(dir, { recursive: true });
        } catch (error) {
          // Log but continue if directory exists
          if ((error as NodeJS.ErrnoException).code !== "EEXIST") {
            throw new FileSystemError(
              `Failed to create directory: ${dir}`,
              dir,
              "mkdir"
            );
          }
        }
      }

      this.progress.update("Creating configuration file...", 40);

      // Create fost.config.json with proper structure
      const config = this.generateInitialConfig(projectType, projectName);

      await fs.writeFile(
        "fost.config.json",
        JSON.stringify(config, null, 2)
      );

      this.progress.update("Creating sample specification...", 60);

      // Create sample spec files
      if (projectType === "web3") {
        const sampleABI = this.generateSampleABI();
        await fs.writeFile(
          `specs/${projectName}.abi.json`,
          JSON.stringify(sampleABI, null, 2)
        );
      } else {
        const sampleOpenAPI = this.generateSampleOpenAPI(projectName);
        await fs.writeFile(
          `specs/${projectName}.openapi.json`,
          JSON.stringify(sampleOpenAPI, null, 2)
        );
      }

      this.progress.update("Creating environment file...", 75);

      // Create .env.example
      const envContent = projectType === "web3"
        ? "RPC_ENDPOINT=https://eth-rpc.example.com\nPRIVATE_KEY=your_private_key_here\n"
        : "API_KEY=your_api_key_here\nAPI_BASE_URL=https://api.example.com\n";

      await fs.writeFile(".env.example", envContent);

      this.progress.update("Creating documentation...", 85);

      // Create README
      const readme = this.generateReadme(projectType, projectName);
      await fs.writeFile("README.md", readme);

      // Create .gitignore
      const gitignore = "node_modules/\n.env\ndist/\nsrc/generated/\n.fost-cache/\n*.log\n.DS_Store\n";
      await fs.writeFile(".gitignore", gitignore);

      this.progress.update("Creating TypeScript configuration...", 95);

      // Create tsconfig.json
      const tsconfig = {
        compilerOptions: {
          target: "ES2020",
          module: "ESNext",
          lib: ["ES2020"],
          declaration: true,
          outDir: "./dist",
          rootDir: "./src",
          strict: true,
          esModuleInterop: true,
          skipLibCheck: true,
          forceConsistentCasingInFileNames: true,
          resolveJsonModule: true,
          moduleResolution: "node",
        },
        include: ["src/**/*"],
        exclude: ["node_modules", "dist"],
      };

      await fs.writeFile(
        "tsconfig.json",
        JSON.stringify(tsconfig, null, 2)
      );

      this.progress.complete(
        `✨ Project initialized successfully!\n` +
        `  Project Type: ${projectType}\n` +
        `  Project Name: ${projectName}\n` +
        `  Output: src/\n` +
        `  Config: fost.config.json\n\n` +
        `Next steps:\n` +
        `  1. npm install\n` +
        `  2. cp .env.example .env\n` +
        `  3. Edit your API spec in specs/${projectName}.${projectType === "web3" ? "abi.json" : "openapi.json"}\n` +
        `  4. fost generate\n`
      );

      if (options.json) {
        console.log(JSON.stringify({
          success: true,
          projectType,
          projectName,
          files: ["fost.config.json", ".env.example", "README.md", ".gitignore", "tsconfig.json"],
          directories: Array.from(DIRECTORIES),
        }, null, 2));
      }
    } catch (error) {
      this.progress.error("");
      if (error instanceof FileSystemError || error instanceof ConfigError) {
        this.logger.error(error.getUserMessage());
        if (options.verbose) {
          this.logger.error(error.getDebugMessage());
        }
      } else if (error instanceof Error) {
        this.logger.error(`Initialization failed: ${error.message}`);
        if (options.verbose) {
          this.logger.error(error.stack || "");
        }
      } else {
        this.logger.error(`Initialization failed: Unknown error`);
      }
      throw error;
    }
  }

  /**
   * Generate initial configuration for new projects
   */
  private generateInitialConfig(
    projectType: "web2" | "web3",
    projectName: string
  ): Record<string, unknown> {
    const baseConfig = {
      fost: {
        version: "1.0",
        inputDir: "./specs",
        outputDir: "./src",
        cacheDir: ".fost-cache",
        language: "typescript",
        strict: true,
        includeTests: true,
        includeDocs: true,
        inputs: [
          {
            type: projectType,
            path: `./specs/${projectName}.${projectType === "web3" ? "abi.json" : "openapi.json"}`,
            name: projectName,
          },
        ],
      },
    };

    if (projectType === "web3") {
      (baseConfig.fost as Record<string, unknown>).web3 = {
        network: "ethereum",
        rpc: "${RPC_ENDPOINT}",
        chainId: 1,
      };
    } else {
      (baseConfig.fost as Record<string, unknown>).api = {
        baseURL: "${API_BASE_URL}",
        timeout: 30000,
      };
      (baseConfig.fost as Record<string, unknown>).auth = {
        type: "apikey",
        envVar: "API_KEY",
      };
    }

    return baseConfig;
  }

  /**
   * Generate sample smart contract ABI
   */
  private generateSampleABI(): unknown[] {
    return [
      {
        type: "function",
        name: "balanceOf",
        inputs: [{ name: "account", type: "address" }],
        outputs: [{ name: "", type: "uint256" }],
        stateMutability: "view",
      },
      {
        type: "function",
        name: "transfer",
        inputs: [
          { name: "to", type: "address" },
          { name: "amount", type: "uint256" },
        ],
        outputs: [{ name: "", type: "bool" }],
        stateMutability: "nonpayable",
      },
    ];
  }

  /**
   * Generate sample OpenAPI specification
   */
  private generateSampleOpenAPI(projectName: string): Record<string, unknown> {
    return {
      openapi: "3.0.0",
      info: {
        title: projectName,
        version: "1.0.0",
        description: `Generated SDK for ${projectName}`,
      },
      servers: [{ url: "${API_BASE_URL}" }],
      paths: {
        "/": {
          get: {
            summary: "Get root",
            responses: {
              "200": { description: "Success" },
            },
          },
        },
      },
    };
  }

  /**
   * Generate README content for new projects
   */
  private generateReadme(projectType: "web2" | "web3", projectName: string): string {
    const envVarName = projectType === "web3" ? "RPC_ENDPOINT" : "API_KEY";
    const clientConfig = projectType === "web3"
      ? "rpc: process.env.RPC_ENDPOINT"
      : "apiKey: process.env.API_KEY";

    return `# ${projectName}

Generated SDK using Fost.

## Getting Started

### 1. Install dependencies
\`\`\`bash
npm install
\`\`\`

### 2. Configure
Copy \`.env.example\` to \`.env\` and update with your values:
\`\`\`bash
cp .env.example .env
\`\`\`

### 3. Generate SDK
\`\`\`bash
fost generate
\`\`\`

### 4. Use the SDK
\`\`\`typescript
import { ${this.capitalize(projectName)}Client } from './src';

const client = new ${this.capitalize(projectName)}Client({
  ${clientConfig},
});

// Use the client
\`\`\`

## Development

- \`npm run generate\` - Generate SDK
- \`npm test\` - Run tests
- \`npm run lint\` - Lint code

## Documentation
See [fost documentation](https://docs.fost.dev) for more information.
`;
  }

  /**
   * Capitalize first letter of string
   */
  private capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  /**
   * Main CLI entry point
   * Parses arguments and routes to appropriate command handler
   * No try-catch here; errors should be handled in command methods
   *
   * @throws {CLIUsageError} If command is unknown or required options are missing
   */
  async run(): Promise<void> {
    const { command, options } = parseArguments(this.args);

    // Configure logging based on options
    this.logger.configure({
      level: (options.verbose ? "debug" : options.quiet ? "error" : "info") as "debug" | "info" | "warn" | "error",
      format: (options.json ? "json" : "text") as "json" | "text",
      noColor: options.noColor === true,
    });

    // Route to appropriate command handler
    switch (command) {
      case "init":
        await this.handleInit(options as InitOptions);
        break;
      case "generate":
        await this.handleGenerate(options as GenerateOptions);
        break;
      case "validate":
        await this.handleValidate(options as ValidateOptions);
        break;
      case "test":
        await this.handleTest(options as TestOptions);
        break;
      case "lint":
        await this.handleLint(options as LintOptions);
        break;
      case "config":
        await this.handleConfig(options);
        break;
      case "completion":
        await this.handleCompletion(options);
        break;
      case "version":
      case "-v":
      case "--version":
        this.handleVersion();
        break;
      case "help":
      case "-h":
      case "--help":
      case undefined:
        this.handleHelp(options.command as string | undefined);
        break;
      default:
        throw new CLIUsageError(`Unknown command: ${command}`);
    }
  }

  /**
   * Generate SDK from a specification file
   *
   * @param options - Generation options
   * @throws {CLIUsageError} If required options are missing
   * @throws {GenerationError} If generation fails
   */
  private async handleGenerate(options: GenerateOptions): Promise<void> {
    // Validate required options
    if (!options.input) {
      throw new CLIUsageError(
        "--input is required",
        { suggestion: "Example: fost generate --input api.json --lang typescript --type web2" }
      );
    }

    const language = options.language || (options.lang as string);
    if (!language) {
      throw new CLIUsageError("--language (or -l) is required");
    }

    if (!options.type) {
      throw new CLIUsageError("--type is required (web2 or web3)");
    }

    const output = (options.output || options.o || "./sdk") as string;

    // Validation only mode
    if (options.validateOnly) {
      this.logger.info("Validating input specification...");

      try {
        const validation = await this.api.validate({
          inputFile: options.input,
          type: options.type,
          strict: options.strict,
        }) as ValidationResult;

        if (!validation.valid) {
          this.logger.error("Validation failed:");
          validation.errors.forEach((err) => {
            this.logger.error(`  - ${err.message}`);
          });
          throw new GenerationError("Validation failed");
        }

        this.logger.success("Validation passed!");
        return;
      } catch (error) {
        if (error instanceof GenerationError) throw error;
        throw new GenerationError(`Validation failed: ${error instanceof Error ? error.message : String(error)}`);
      }
    }

    // Standard generation
    this.progress.start();

    try {
      const config = options.config ? parseConfig(options.config) : {};

      this.progress.update("Validating input...", 10);
      const validation = await this.api.validate({
        inputFile: options.input,
        type: options.type,
        strict: options.strict,
      }) as ValidationResult;

      if (!validation.valid) {
        this.progress.error("");
        this.logger.error("Input validation failed:");
        validation.errors.forEach((err) => {
          this.logger.error(`  ${err.code}: ${err.message}`);
          if (err.suggestion) {
            this.logger.info(`  Suggestion: ${err.suggestion}`);
          }
        });
        throw new GenerationError("Input validation failed");
      }

      this.progress.update("Analyzing schema...", 25);
      const analysis = await this.api.analyzeInput({
        inputFile: options.input,
        type: options.type,
      });

      this.progress.update("Generating code...", 45);
      const generation = (await this.api.generate({
        inputFile: options.input,
        language,
        type: options.type,
        outputPath: output,
        name: options.name,
        version: options.version,
        config: {
          ...config,
          includeTests: !options.skipTests,
          includeDocumentation: !options.skipDocs,
        },
      })) as GenerationResult;

      if (!options.skipTests) {
        this.progress.update("Generating tests...", 70);
        await this.api.generateTests({
          outputPath: output,
          language,
          type: options.type,
        });
      }

      if (!options.skipDocs) {
        this.progress.update("Generating documentation...", 85);
        await this.api.generateDocumentation({
          outputPath: output,
          analysis,
        });
      }

      this.progress.update("Finalizing...", 95);
      await this.api.validateGeneration({
        outputPath: output,
      });

      this.progress.complete(
        `Successfully generated SDK in ${output}\n` +
        `  - ${generation.generatedFiles.length} files created\n` +
        `  - Generation completed in ${generation.duration}`
      );

      if (options.verbose) {
        this.logger.info("\nGeneration details:");
        this.logger.info(`  Output: ${output}`);
        this.logger.info(`  Language: ${language}`);
        this.logger.info(`  Type: ${options.type}`);
      }

      if (options.json) {
        const result = {
          success: true,
          outputPath: output,
          filesGenerated: generation.generatedFiles.length,
          duration: generation.duration,
          metadata: {
            language,
            type: options.type,
          },
        };
        console.log(JSON.stringify(result, null, 2));
      }
    } catch (error) {
      this.progress.error("");
      if (error instanceof GenerationError) {
        this.logger.error(error.getUserMessage());
        if (options.verbose) {
          this.logger.error(error.getDebugMessage());
        }
      } else if (error instanceof Error) {
        this.logger.error(`Generation failed: ${error.message}`);
        if (options.verbose) {
          this.logger.error(error.stack || "");
        }
      }
      throw error;
    }
  }

  /**
   * Validate input specification
   *
   * @param options - Validation options
   * @throws {CLIUsageError} If input file is not specified
   */
  private async handleValidate(options: ValidateOptions): Promise<void> {
    if (!options.input) {
      throw new CLIUsageError("--input is required");
    }

    const type = (options.type || "web2") as "web2" | "web3";

    try {
      this.progress.start();
      this.progress.update("Validating specification...", 50);

      const result = (await this.api.validate({
        inputFile: options.input,
        type,
        strict: options.strict,
        customRules: options.rules,
      })) as ValidationResult;

      if (result.valid) {
        this.progress.complete(`Validation passed!\n  - File: ${options.input}\n  - Type: ${type}`);
      } else {
        this.progress.error("");
        this.logger.error("Validation failed:");
        result.errors.forEach((err) => {
          this.logger.error(`  [${err.code}] ${err.message}`);
          if (err.code) {
            this.logger.error(`    Location: ${err.code}`);
          }
          if (err.suggestion) {
            this.logger.error(`    Suggestion: ${err.suggestion}`);
          }
        });
        throw new GenerationError("Validation failed");
      }

      if (options.json) {
        console.log(JSON.stringify(result, null, 2));
      }
    } catch (error) {
      if (error instanceof GenerationError) throw error;
      if (error instanceof Error) {
        this.logger.error(`Validation error: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Run tests for generated SDK
   *
   * @param options - Test options
   */
  private async handleTest(options: TestOptions): Promise<void> {
    const path = (options.path || "./sdk") as string;
    const testType = (options.type || "all") as string;

    try {
      this.progress.start();
      this.progress.update("Running tests...", 30);

      const result = (await this.api.runTests({
        sdkPath: path,
        testType,
        coverage: options.coverage,
        watch: options.watch,
      })) as TestResult;

      if (result.success) {
        this.progress.complete(
          `All tests passed!\n` +
          `  - Tests: ${result.totalTests}\n` +
          `  - Passed: ${result.passed}\n` +
          `  - Failed: ${result.failed}`
        );
      } else {
        this.progress.error("");
        this.logger.error(`${result.failed} test(s) failed:`);
        result.failures.forEach((failure) => {
          this.logger.error(`  - ${failure.name}: ${failure.error}`);
        });
        throw new GenerationError("Tests failed");
      }

      if (options.json) {
        console.log(JSON.stringify(result, null, 2));
      }
    } catch (error) {
      if (error instanceof GenerationError) throw error;
      if (error instanceof Error) {
        this.logger.error(`Test execution failed: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Lint generated code
   *
   * @param options - Lint options
   */
  private async handleLint(options: LintOptions): Promise<void> {
    const path = (options.path || "./sdk") as string;

    try {
      this.progress.start();
      this.progress.update("Linting code...", 50);

      const result = (await this.api.lintCode({
        sdkPath: path,
        fix: options.fix,
        strict: options.strict,
      })) as LintResult;

      if (result.totalIssues === 0) {
        this.progress.complete("No linting issues found!");
      } else {
        const message = options.fix
          ? `Fixed ${result.warnings} issue(s), ${result.errors} remaining`
          : `Found ${result.totalIssues} linting issue(s)`;

        this.progress.complete(message);

        if (!options.fix) {
          const issueSummary = result.issues
            .slice(0, 5)
            .map((issue) => `  - ${issue.file}: ${issue.message}`)
            .join("\n");
          this.logger.warn(`\n${issueSummary}`);
        }
      }

      if (options.json) {
        console.log(JSON.stringify(result, null, 2));
      }
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(`Linting failed: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Manage configuration
   *
   * @param options - Config command options
   */
  private async handleConfig(options: CLIOptions): Promise<void> {
    const subcommand = (options.subcommand || "show") as string;

    try {
      switch (subcommand) {
        case "show": {
          const current = await this.api.getConfig();
          this.logger.info("Current configuration:");
          console.log(JSON.stringify(current, null, 2));
          break;
        }

        case "set": {
          if (!options.key || !options.value) {
            throw new CLIUsageError("Usage: fost config set <key> <value>");
          }
          await this.api.setConfig(options.key, options.value);
          this.logger.success(`Set ${options.key} = ${options.value}`);
          break;
        }

        case "list": {
          const allConfigs = await this.api.getConfig();
          this.logger.info("Available configurations:");
          Object.entries(allConfigs).forEach(([key, value]) => {
            this.logger.info(`  ${key}: ${JSON.stringify(value)}`);
          });
          break;
        }

        case "reset": {
          await this.api.resetConfig();
          this.logger.success("Configuration reset to defaults");
          break;
        }

        default:
          throw new CLIUsageError(`Unknown config subcommand: ${subcommand}`);
      }
    } catch (error) {
      if (error instanceof CLIUsageError) throw error;
      if (error instanceof Error) {
        this.logger.error(`Config error: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Handle completion command
   *
   * @param options - Completion options
   */
  private async handleCompletion(options: CLIOptions): Promise<void> {
    const shell = (options.shell || "bash") as string;
    const completion = await this.api.getCompletion(shell);
    console.log(completion);
  }

  /**
   * Print version information
   */
  private handleVersion(): void {
    // Use dynamic require for version
    const version = require("../../package.json").version as string;
    console.log(`fost ${version}`);
  }

  /**
   * Print help information
   *
   * @param command - Specific command to get help for
   */
  private handleHelp(command?: string): void {
    if (command) {
      const help = HELP_MESSAGES[command as keyof typeof HELP_MESSAGES];
      if (help) {
        console.log(help);
      } else {
        console.log(`Help for command: ${command} (not found)`);
      }
    } else {
      console.log(HELP_MESSAGES.main);
    }
  }
}
