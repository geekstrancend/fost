/**
 * CLI Type Definitions
 * Provides type-safe interfaces for all CLI operations
 */

/**
 * CLI command options for all commands
 */
export interface CLIOptions {
  [key: string]: string | number | boolean | undefined;
}

/**
 * Init command specific options
 */
export interface InitOptions extends CLIOptions {
  type?: 'web2' | 'web3';
  name?: string;
  template?: string;
}

/**
 * Generate command specific options
 */
export interface GenerateOptions extends CLIOptions {
  config?: string;
  input?: string;
  output?: string;
  language?: string;
  strict?: boolean;
  watch?: boolean;
}

/**
 * Validate command specific options
 */
export interface ValidateOptions extends CLIOptions {
  input: string;
  type?: 'web2' | 'web3';
  strict?: boolean;
}

/**
 * Test command specific options
 */
export interface TestOptions extends CLIOptions {
  config?: string;
  pattern?: string;
  coverage?: boolean;
}

/**
 * Lint command specific options
 */
export interface LintOptions extends CLIOptions {
  config?: string;
  fix?: boolean;
  output?: string;
}

/**
 * Parsed command arguments
 */
export interface ParsedArgs {
  command: string;
  options: CLIOptions;
  positional: string[];
}

/**
 * Logger interface for consistent logging
 */
export interface Logger {
  debug(message: string): void;
  info(message: string): void;
  warn(message: string): void;
  error(message: string): void;
  success(message: string): void;
  configure(config: LoggerConfig): void;
}

/**
 * Logger configuration
 */
export interface LoggerConfig {
  level?: 'debug' | 'info' | 'warn' | 'error';
  format?: 'text' | 'json';
  noColor?: boolean;
}

/**
 * Progress reporter interface
 */
export interface ProgressReporter {
  start(): void;
  update(message: string, percentage: number): void;
  complete(message: string): void;
  error(message: string): void;
  stop(): void;
}

/**
 * SDK generation result
 */
export interface GenerationResult {
  success: boolean;
  sdkPath: string;
  generatedFiles: string[];
  duration: number;
  errors?: string[];
  warnings?: string[];
}

/**
 * Validation result
 */
export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

/**
 * Single validation error
 */
export interface ValidationError {
  code: string;
  message: string;
  location?: string;
  severity: 'error' | 'warning';
}

/**
 * Single validation warning
 */
export interface ValidationWarning {
  code: string;
  message: string;
  location?: string;
  suggestion?: string;
}

/**
 * Test execution result
 */
export interface TestResult {
  success: boolean;
  totalTests: number;
  passed: number;
  failed: number;
  skipped: number;
  duration: number;
  failures: TestFailure[];
  coverage?: CoverageStats;
}

/**
 * Individual test failure
 */
export interface TestFailure {
  name: string;
  error: string;
  stack?: string;
}

/**
 * Code coverage statistics
 */
export interface CoverageStats {
  lines: number;
  statements: number;
  functions: number;
  branches: number;
}

/**
 * Lint result
 */
export interface LintResult {
  success: boolean;
  totalIssues: number;
  errors: number;
  warnings: number;
  issues: LintIssue[];
}

/**
 * Individual lint issue
 */
export interface LintIssue {
  file: string;
  line: number;
  column: number;
  message: string;
  code: string;
  severity: 'error' | 'warning';
  fix?: string;
}

/**
 * Configuration with proper typing
 */
export interface TypedConfig {
  outputDir: string;
  target: 'web2' | 'web3';
  strict: boolean;
  language: string;
  includeTests: boolean;
  includeDocs: boolean;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  noColor: boolean;
  [key: string]: unknown;
}
