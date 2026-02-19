/**
 * FOST CLI - Command Line Interface for SDK Generation
 * Handles command parsing, execution, and output formatting
 */

import { createGeneratorAPI } from "../api/generator-api";
import { createProgressReporter } from "./progress-reporter";
import { createLogger } from "./logger";
import { parseArguments, parseConfig } from "./argument-parser";

export class CLIApplication {
  private readonly args: string[];
  private readonly logger: any;
  private readonly progress: any;
  private readonly api: any;

  constructor(argv?: string[]) {
    this.args = argv || process.argv.slice(2);
    this.logger = createLogger();
    this.progress = createProgressReporter();
    this.api = createGeneratorAPI();
  }

  /**
   * Main CLI entry point
   * Does not include try-catch; errors are handled globally by bootstrap
   */
  async run(): Promise<void> {
    const { command, options } = parseArguments(this.args);

    // Configure logging based on options
    this.logger.configure({
      level: options.verbose ? "debug" : options.quiet ? "error" : "info",
      colorize: options.color !== false,
      format: options.json ? "json" : "text",
    });

    // Route to appropriate command handler
    switch (command) {
      case "generate":
        await this.handleGenerate(options);
        break;
      case "validate":
        await this.handleValidate(options);
        break;
      case "test":
        await this.handleTest(options);
        break;
      case "lint":
        await this.handleLint(options);
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
        this.handleHelp(options.command);
        break;
      default:
        this.logger.error(`Unknown command: ${command}`);
        process.exit(2);
    }
  }

  /**
   * Handle generate command
   */
  private async handleGenerate(options: any): Promise<void> {
    // Validate required options
    if (!options.input) {
      this.logger.error("--input is required");
      this.logger.info("Example: fost generate --input api.json --lang typescript --type web2");
      process.exit(2);
    }

    if (!options.language && !options.lang) {
      this.logger.error("--language (or -l) is required");
      process.exit(2);
    }

    if (!options.type) {
      this.logger.error("--type is required (web2 or web3)");
      process.exit(2);
    }

    const language = options.language || options.lang;
    const output = options.output || options.o || "./sdk";

    // Validation only mode
    if (options.validateOnly) {
      this.logger.info("Validating input specification...");
      const validation = await this.api.validate({
        inputFile: options.input,
        type: options.type,
        strict: options.strict,
      });

      if (!validation.valid) {
        this.logger.error("Validation failed:");
        validation.errors.forEach((err: any) => {
          this.logger.error(`  - ${err.message}`);
        });
        process.exit(3);
      }

      this.logger.success("Validation passed!");
      return;
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
      });

      if (!validation.valid) {
        this.progress.fail();
        this.logger.error("Input validation failed:");
        validation.errors.forEach((err: any) => {
          this.logger.error(`  ${err.code}: ${err.message}`);
          if (err.suggestion) {
            this.logger.info(`  Suggestion: ${err.suggestion}`);
          }
        });
        process.exit(3);
      }

      this.progress.update("Analyzing schema...", 25);
      const analysis = await this.api.analyzeInput({
        inputFile: options.input,
        type: options.type,
      });

      this.progress.update("Generating code...", 45);
      const generation = await this.api.generate({
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
      });

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

      this.progress.succeed(
        `Successfully generated SDK in ${output}\n` +
        `  - ${generation.filesGenerated} files created\n` +
        `  - ${analysis.methods} methods\n` +
        `  - ${analysis.types} types\n` +
        `  - Generated in ${generation.duration}`
      );

      if (options.verbose) {
        this.logger.info("\nGeneration details:");
        this.logger.info(`  Output: ${output}`);
        this.logger.info(`  Language: ${language}`);
        this.logger.info(`  Type: ${options.type}`);
        this.logger.info(`  Methods: ${analysis.methods}`);
        this.logger.info(`  Types: ${analysis.types}`);
      }

      if (options.json) {
        console.log(JSON.stringify({
          success: true,
          outputPath: output,
          filesGenerated: generation.filesGenerated,
          duration: generation.duration,
          metadata: {
            language,
            type: options.type,
            methods: analysis.methods,
            types: analysis.types,
          },
        }, null, 2));
      }
    } catch (error: any) {
      this.progress.fail();
      this.logger.error(`Generation failed: ${error.message}`);
      if (options.verbose || options.debug) {
        this.logger.error(error.stack);
      }
      process.exit(4);
    }
  }

  /**
   * Handle validate command
   */
  private async handleValidate(options: any): Promise<void> {
    if (!options.input) {
      this.logger.error("--input is required");
      process.exit(2);
    }

    const type = options.type || "web2";

    try {
      this.progress.start();
      this.progress.update("Validating specification...", 50);

      const result = await this.api.validate({
        inputFile: options.input,
        type,
        strict: options.strict,
        customRules: options.rules,
      });

      if (result.valid) {
        this.progress.succeed(`Validation passed!\n  - File: ${options.input}\n  - Type: ${type}`);
      } else {
        this.progress.fail();
        this.logger.error("Validation failed:");
        result.errors.forEach((err: any) => {
          this.logger.error(`  [${err.code}] ${err.message}`);
          if (err.location) {
            this.logger.error(`    Location: ${err.location}`);
          }
          if (err.suggestion) {
            this.logger.error(`    Suggestion: ${err.suggestion}`);
          }
        });
        process.exit(3);
      }

      if (options.json) {
        console.log(JSON.stringify(result, null, 2));
      }
    } catch (error: any) {
      this.progress.fail();
      this.logger.error(`Validation error: ${error.message}`);
      process.exit(1);
    }
  }

  /**
   * Handle test command
   */
  private async handleTest(options: any): Promise<void> {
    const path = options.path || "./sdk";
    const testType = options.type || "all";

    try {
      this.progress.start();
      this.progress.update("Running tests...", 30);

      const result = await this.api.runTests({
        sdkPath: path,
        testType,
        coverage: options.coverage,
        watch: options.watch,
      });

      if (result.allPassed) {
        this.progress.succeed(
          `All tests passed!\n` +
          `  - Tests: ${result.totalTests}\n` +
          `  - Passed: ${result.passedTests}\n` +
          `  - Coverage: ${result.coverage}%`
        );
      } else {
        this.progress.fail();
        this.logger.error(`${result.failedTests} test(s) failed:`);
        result.failures.forEach((failure: any) => {
          this.logger.error(`  - ${failure.test}: ${failure.error}`);
        });
        process.exit(1);
      }

      if (options.json) {
        console.log(JSON.stringify(result, null, 2));
      }
    } catch (error: any) {
      this.progress.fail();
      this.logger.error(`Test execution failed: ${error.message}`);
      process.exit(1);
    }
  }

  /**
   * Handle lint command
   */
  private async handleLint(options: any): Promise<void> {
    const path = options.path || "./sdk";

    try {
      this.progress.start();
      this.progress.update("Linting code...", 50);

      const result = await this.api.lintCode({
        sdkPath: path,
        fix: options.fix,
        strict: options.strict,
      });

      if (result.issues.length === 0) {
        this.progress.succeed("No linting issues found!");
      } else {
        if (options.fix) {
          this.progress.succeed(
            `Fixed ${result.fixedCount} issue(s), ${result.issues.length} remaining`
          );
        } else {
          this.progress.warn(
            `Found ${result.issues.length} linting issue(s):\n` +
            result.issues.slice(0, 5).map((issue: any) =>
              `  - ${issue.file}: ${issue.message}`
            ).join("\n")
          );
        }
      }

      if (options.json) {
        console.log(JSON.stringify(result, null, 2));
      }
    } catch (error: any) {
      this.progress.fail();
      this.logger.error(`Linting failed: ${error.message}`);
      process.exit(1);
    }
  }

  /**
   * Handle config command
   */
  private async handleConfig(options: any): Promise<void> {
    const subcommand = options.subcommand || "show";

    try {
      switch (subcommand) {
        case "show":
          const current = await this.api.getConfig();
          this.logger.info("Current configuration:");
          console.log(JSON.stringify(current, null, 2));
          break;

        case "set":
          if (!options.key || !options.value) {
            this.logger.error("Usage: fost config set <key> <value>");
            process.exit(2);
          }
          await this.api.setConfig(options.key, options.value);
          this.logger.success(`Set ${options.key} = ${options.value}`);
          break;

        case "list":
          const allConfigs = await this.api.getConfig();
          this.logger.info("Available configurations:");
          Object.entries(allConfigs).forEach(([key, value]) => {
            this.logger.info(`  ${key}: ${JSON.stringify(value)}`);
          });
          break;

        case "reset":
          await this.api.resetConfig();
          this.logger.success("Configuration reset to defaults");
          break;

        default:
          this.logger.error(`Unknown config subcommand: ${subcommand}`);
          process.exit(2);
      }
    } catch (error: any) {
      this.logger.error(`Config error: ${error.message}`);
      process.exit(1);
    }
  }

  /**
   * Handle completion command
   */
  private async handleCompletion(options: any): Promise<void> {
    const shell = options.shell || "bash";
    const completion = await this.api.getCompletion(shell);
    console.log(completion);
  }

  /**
   * Handle version command
   */
  private handleVersion(): void {
    const version = require("../../package.json").version;
    console.log(`fost ${version}`);
  }

  /**
   * Handle help command
   */
  private handleHelp(command?: string): void {
    if (command) {
      this.logger.info(`Help for command: ${command}`);
      // Show specific command help
    } else {
      console.log(`
FOST SDK Generator CLI

Usage: fost <command> [options]

Commands:
  generate    Generate SDK from specification
  validate    Validate input specification
  test        Run generated SDK tests
  lint        Lint generated code
  config      Manage configuration
  version     Show version
  help        Show this help

Options:
  -h, --help      Show help
  -v, --version   Show version
  --verbose       Verbose output
  -q, --quiet     Quiet output
  --color         Enable colored output (default: true)
  --json          Output as JSON

Examples:
  fost generate --input api.json --lang typescript --type web2
  fost validate --input openapi.yaml
  fost test --path ./generated-sdk --coverage
  fost lint --path ./generated-sdk --fix

Documentation: https://docs.fost.dev/cli
      `);
    }
  }
}
