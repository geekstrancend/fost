"use strict";
/**
 * FOST CLI - Command Line Interface for SDK Generation
 * Handles command parsing, execution, and output formatting
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CLIApplication = void 0;
const generator_api_1 = require("../api/generator-api");
const progress_reporter_1 = require("./progress-reporter");
const logger_1 = require("./logger");
const argument_parser_1 = require("./argument-parser");
class CLIApplication {
    constructor(argv) {
        this.args = argv || process.argv.slice(2);
        this.logger = (0, logger_1.createLogger)();
        this.progress = (0, progress_reporter_1.createProgressReporter)();
        this.api = (0, generator_api_1.createGeneratorAPI)();
    }
    /**
     * Handle init command - Initialize a new Fost project
     */
    async handleInit(options) {
        const projectType = options.type || "web2"; // web2 or web3
        const projectName = options.name || "my-sdk";
        try {
            this.progress.start();
            this.progress.update("Initializing project structure...", 20);
            // Import file system operations
            const fs = await import("fs/promises");
            // Create directories
            const directories = [
                "specs",
                "src",
                "tests",
                ".fost-cache",
            ];
            for (const dir of directories) {
                try {
                    await fs.mkdir(dir, { recursive: true });
                }
                catch (e) {
                    // Directory might already exist, that's fine
                }
            }
            this.progress.update("Creating configuration file...", 40);
            // Create fost.config.json
            const config = {
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
                config.fost.web3 = {
                    network: "ethereum",
                    rpc: "${RPC_ENDPOINT}",
                    chainId: 1,
                };
            }
            else {
                config.fost.api = {
                    baseURL: "${API_BASE_URL}",
                    timeout: 30000,
                };
                config.fost.auth = {
                    type: "apikey",
                    envVar: "API_KEY",
                };
            }
            await fs.writeFile("fost.config.json", JSON.stringify(config, null, 2));
            this.progress.update("Creating sample specification...", 60);
            // Create sample spec files
            if (projectType === "web3") {
                const sampleABI = [
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
                await fs.writeFile(`specs/${projectName}.abi.json`, JSON.stringify(sampleABI, null, 2));
            }
            else {
                const sampleOpenAPI = {
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
                await fs.writeFile(`specs/${projectName}.openapi.json`, JSON.stringify(sampleOpenAPI, null, 2));
            }
            this.progress.update("Creating environment file...", 75);
            // Create .env.example
            if (projectType === "web3") {
                await fs.writeFile(".env.example", "RPC_ENDPOINT=https://eth-rpc.example.com\n" +
                    "PRIVATE_KEY=your_private_key_here\n");
            }
            else {
                await fs.writeFile(".env.example", "API_KEY=your_api_key_here\n" +
                    "API_BASE_URL=https://api.example.com\n");
            }
            this.progress.update("Creating documentation...", 85);
            // Create README
            const readme = `# ${projectName}

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
import { ${projectName.charAt(0).toUpperCase() + projectName.slice(1)}Client } from './src';

const client = new ${projectName.charAt(0).toUpperCase() + projectName.slice(1)}Client({
  ${projectType === "web3" ? "rpc: process.env.RPC_ENDPOINT" : "apiKey: process.env.API_KEY"},
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
            await fs.writeFile("README.md", readme);
            this.progress.update("Creating .gitignore...", 90);
            // Create .gitignore
            await fs.writeFile(".gitignore", "node_modules/\n" +
                ".env\n" +
                "dist/\n" +
                "src/generated/\n" +
                ".fost-cache/\n" +
                "*.log\n" +
                ".DS_Store\n");
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
            await fs.writeFile("tsconfig.json", JSON.stringify(tsconfig, null, 2));
            this.progress.succeed(`✨ Project initialized successfully!\n` +
                `  Project Type: ${projectType}\n` +
                `  Project Name: ${projectName}\n` +
                `  Output: src/\n` +
                `  Config: fost.config.json\n\n` +
                `Next steps:\n` +
                `  1. npm install\n` +
                `  2. cp .env.example .env\n` +
                `  3. Edit your API spec in specs/${projectName}.${projectType === "web3" ? "abi.json" : "openapi.json"}\n` +
                `  4. fost generate\n`);
            if (options.json) {
                console.log(JSON.stringify({
                    success: true,
                    projectType,
                    projectName,
                    files: ["fost.config.json", ".env.example", "README.md", ".gitignore", "tsconfig.json"],
                    directories: directories,
                }, null, 2));
            }
        }
        catch (error) {
            this.progress.fail();
            this.logger.error(`Initialization failed: ${error.message}`);
            if (options.verbose) {
                this.logger.error(error.stack);
            }
            process.exit(1);
        }
    }
    /**
     * Main CLI entry point
     * Does not include try-catch; errors are handled globally by bootstrap
     */
    async run() {
        const { command, options } = (0, argument_parser_1.parseArguments)(this.args);
        // Configure logging based on options
        this.logger.configure({
            level: options.verbose ? "debug" : options.quiet ? "error" : "info",
            colorize: options.color !== false,
            format: options.json ? "json" : "text",
        });
        // Route to appropriate command handler
        switch (command) {
            case "init":
                await this.handleInit(options);
                break;
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
    async handleGenerate(options) {
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
                validation.errors.forEach((err) => {
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
            const config = options.config ? (0, argument_parser_1.parseConfig)(options.config) : {};
            this.progress.update("Validating input...", 10);
            const validation = await this.api.validate({
                inputFile: options.input,
                type: options.type,
                strict: options.strict,
            });
            if (!validation.valid) {
                this.progress.fail();
                this.logger.error("Input validation failed:");
                validation.errors.forEach((err) => {
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
            this.progress.succeed(`Successfully generated SDK in ${output}\n` +
                `  - ${generation.filesGenerated} files created\n` +
                `  - ${analysis.methods} methods\n` +
                `  - ${analysis.types} types\n` +
                `  - Generated in ${generation.duration}`);
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
        }
        catch (error) {
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
    async handleValidate(options) {
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
            }
            else {
                this.progress.fail();
                this.logger.error("Validation failed:");
                result.errors.forEach((err) => {
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
        }
        catch (error) {
            this.progress.fail();
            this.logger.error(`Validation error: ${error.message}`);
            process.exit(1);
        }
    }
    /**
     * Handle test command
     */
    async handleTest(options) {
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
                this.progress.succeed(`All tests passed!\n` +
                    `  - Tests: ${result.totalTests}\n` +
                    `  - Passed: ${result.passedTests}\n` +
                    `  - Coverage: ${result.coverage}%`);
            }
            else {
                this.progress.fail();
                this.logger.error(`${result.failedTests} test(s) failed:`);
                result.failures.forEach((failure) => {
                    this.logger.error(`  - ${failure.test}: ${failure.error}`);
                });
                process.exit(1);
            }
            if (options.json) {
                console.log(JSON.stringify(result, null, 2));
            }
        }
        catch (error) {
            this.progress.fail();
            this.logger.error(`Test execution failed: ${error.message}`);
            process.exit(1);
        }
    }
    /**
     * Handle lint command
     */
    async handleLint(options) {
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
            }
            else {
                if (options.fix) {
                    this.progress.succeed(`Fixed ${result.fixedCount} issue(s), ${result.issues.length} remaining`);
                }
                else {
                    this.progress.warn(`Found ${result.issues.length} linting issue(s):\n` +
                        result.issues.slice(0, 5).map((issue) => `  - ${issue.file}: ${issue.message}`).join("\n"));
                }
            }
            if (options.json) {
                console.log(JSON.stringify(result, null, 2));
            }
        }
        catch (error) {
            this.progress.fail();
            this.logger.error(`Linting failed: ${error.message}`);
            process.exit(1);
        }
    }
    /**
     * Handle config command
     */
    async handleConfig(options) {
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
        }
        catch (error) {
            this.logger.error(`Config error: ${error.message}`);
            process.exit(1);
        }
    }
    /**
     * Handle completion command
     */
    async handleCompletion(options) {
        const shell = options.shell || "bash";
        const completion = await this.api.getCompletion(shell);
        console.log(completion);
    }
    /**
     * Handle version command
     */
    handleVersion() {
        const version = require("../../package.json").version;
        console.log(`fost ${version}`);
    }
    /**
     * Handle help command
     */
    handleHelp(command) {
        if (command) {
            switch (command) {
                case "init":
                    console.log(`
fost init [options]

Initialize a new Fost project with default configuration.

Options:
  --type <type>     Project type: 'web2' (default) or 'web3'
  --name <name>     Project/SDK name (default: 'my-sdk')
  --force            Overwrite existing files

Example:
  fost init --type web2 --name my-api-sdk
  fost init --type web3 --name contract-sdk
          `);
                    break;
                case "generate":
                    console.log(`
fost generate [options]

Generate SDK from specification.

Options:
  --input <file>      Input specification file (required)
  --lang <language>   Target language: 'typescript', 'javascript', 'python'
  --type <type>       Type: 'web2' (REST API) or 'web3' (smart contract)
  --output <dir>      Output directory (default: ./sdk)
  --name <name>       SDK name
  --version <ver>     SDK version
  --strict            Enable strict validation
  --skip-tests        Skip test generation
  --skip-docs         Skip documentation generation

Example:
  fost generate --input api.json --lang typescript --type web2
          `);
                    break;
                default:
                    console.log(`Help for command: ${command} (not found)`);
            }
        }
        else {
            console.log(`
FOST SDK Generator CLI

Usage: fost <command> [options]

Commands:
  init        Initialize a new Fost project
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
  fost init --type web2 --name my-sdk
  fost generate --input api.json --lang typescript --type web2
  fost validate --input openapi.yaml
  fost test --path ./generated-sdk --coverage
  fost lint --path ./generated-sdk --fix

Documentation: https://docs.fost.dev/cli
      `);
        }
    }
}
exports.CLIApplication = CLIApplication;
//# sourceMappingURL=index.js.map