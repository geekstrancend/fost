/**
 * FOST - AI-Powered SDK Generator
 * Main entry point - exports all public APIs
 */

// Export all error classes
export {
  FosztError,
  CLIUsageError,
  SpecValidationError,
  GenerationError,
  ConfigError,
  FileSystemError,
  isFosztError,
  getExitCode,
  EXIT_CODES,
  type ExitCode,
  handleError,
  catchError,
} from './errors';

// Export CLI functionality
export { bootstrap } from './cli/bootstrap';

// Re-export key generators
export { SDKGenerationOrchestrator } from './code-generation/spec-to-template';

// Export input analyzer
export { InputNormalizer } from './input-analysis';

// Export API interfaces
export type { GeneratorAPI, GenerationResult, ValidationResult } from './api/generator-api';
export { createGeneratorAPI } from './api/generator-api';
