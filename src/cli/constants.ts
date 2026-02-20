/**
 * CLI Constants and Messages
 * Centralized configuration and help text
 */

/**
 * Help messages for each command
 */
export const HELP_MESSAGES = {
  init: `
fost init [options]

Initialize a new Fost project with default configuration.

Options:
  --type <type>     Project type: 'web2' (default) or 'web3'
  --name <name>     Project/SDK name (default: 'my-sdk')
  --force            Overwrite existing files

Example:
  fost init --type web2 --name my-api-sdk
  fost init --type web3 --name contract-sdk
  `,

  generate: `
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
  `,

  main: `
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
  `,
} as const;

/**
 *  Default configuration directories
 */
export const DEFAULT_DIRECTORIES = [
  "specs",
  "src",
  "tests",
  ".fost-cache",
] as const;

/**
 * Default TypeScript compiler options
 */
export const DEFAULT_TSCONFIG = {
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
} as const;

/**
 * Default .gitignore entries
 */
export const DEFAULT_GITIGNORE = `node_modules/
.env
dist/
src/generated/
.fost-cache/
*.log
.DS_Store
`;

/**
 * Environment variable templates
 */
export const ENV_TEMPLATES = {
  web3: `RPC_ENDPOINT=https://eth-rpc.example.com
PRIVATE_KEY=your_private_key_here
`,
  web2: `API_KEY=your_api_key_here
API_BASE_URL=https://api.example.com
`,
} as const;

/**
 * Error messages with actionable suggestions
 */
export const ERROR_MESSAGES = {
  MISSING_INPUT: {
    message: "--input is required",
    suggestion: "Example: fost generate --input api.json --lang typescript --type web2",
  },
  MISSING_LANGUAGE: {
    message: "--language (or -l) is required",
    suggestion: "Example: fost generate --input api.json --lang typescript --type web2",
  },
  MISSING_TYPE: {
    message: "--type is required (web2 or web3)",
    suggestion: "Example: fost generate --input api.json --type web2",
  },
  MISSING_OUTPUT: {
    message: "--output is required for file operations",
    suggestion: "Example: fost generate --input api.json --output ./sdk",
  },
} as const;

/**
 * Success messages
 */
export const SUCCESS_MESSAGES = {
  INIT_COMPLETE: (projectType: string, projectName: string) => `
✨ Project initialized successfully!
  Project Type: ${projectType}
  Project Name: ${projectName}
  Output: src/
  Config: fost.config.json

Next steps:
  1. npm install
  2. cp .env.example .env
  3. Edit your API spec in specs/${projectName}.${projectType === "web3" ? "abi.json" : "openapi.json"}
  4. fost generate
`,

  GENERATE_COMPLETE: (output: string, filesCount: number, duration: string) => `
Successfully generated SDK in ${output}
  - ${filesCount} files created
  - Generated in ${duration}
`,

  VALIDATION_PASSED: (file: string, type: string) => `
Validation passed!
  - File: ${file}
  - Type: ${type}
`,

  TESTS_PASSED: (totalTests: number, passed: number, failed: number) => `
All tests passed!
  - Tests: ${totalTests}
  - Passed: ${passed}
  - Failed: ${failed}
`,

  NO_LINT_ISSUES: "No linting issues found!",

  CONFIG_UPDATED: (key: string, value: unknown) => `Set ${key} = ${value}`,

  CONFIG_RESET: "Configuration reset to defaults",
} as const;
