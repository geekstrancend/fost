/**
 * Base Error Classes for FOST
 * Provides consistent error handling across the CLI
 */

/**
 * Exit codes for CLI errors
 */
export const EXIT_CODES = {
  SUCCESS: 0,
  RUNTIME_ERROR: 1,
  CLI_USAGE_ERROR: 2,
  VALIDATION_ERROR: 3,
  GENERATION_ERROR: 4,
  FILE_SYSTEM_ERROR: 5,
} as const;

export type ExitCode = typeof EXIT_CODES[keyof typeof EXIT_CODES];

/**
 * Base FOST Error
 */
export abstract class FosztError extends Error {
  abstract readonly code: string;

  constructor(
    public readonly message: string,
    public readonly exitCode: ExitCode = EXIT_CODES.RUNTIME_ERROR,
    public readonly metadata?: Record<string, unknown>
  ) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
  }

  /**
   * User-facing error message (without stack trace)
   */
  getUserMessage(): string {
    return this.message;
  }

  /**
   * Debug message (includes stack trace and metadata)
   */
  getDebugMessage(): string {
    const parts = [this.message, this.stack];

    if (this.metadata) {
      parts.push(`Metadata: ${JSON.stringify(this.metadata, null, 2)}`);
    }

    return parts.filter(Boolean).join('\n');
  }
}

/**
 * CLI Usage Error
 * Exit code: 2
 */
export class CLIUsageError extends FosztError {
  readonly code = 'CLI_USAGE_ERROR';

  constructor(
    message: string,
    metadata?: Record<string, unknown>
  ) {
    super(message, EXIT_CODES.CLI_USAGE_ERROR, metadata);
  }
}

/**
 * Specification Validation Error
 * Exit code: 3
 */
export class SpecValidationError extends FosztError {
  readonly code = 'SPEC_VALIDATION_ERROR';

  constructor(
    message: string,
    public readonly errors: Array<{
      code: string;
      message: string;
      path?: string;
      suggestion?: string;
    }> = [],
    metadata?: Record<string, unknown>
  ) {
    super(message, EXIT_CODES.VALIDATION_ERROR, metadata);
  }

  getUserMessage(): string {
    const baseMessage = this.message;
    const errorDetails = this.errors
      .map(e => `  [${e.code}] ${e.message}${e.suggestion ? `\n    Suggestion: ${e.suggestion}` : ''}`)
      .join('\n');

    return `${baseMessage}\n${errorDetails}`;
  }
}

/**
 * SDK Generation Error
 * Exit code: 4
 */
export class GenerationError extends FosztError {
  readonly code = 'GENERATION_ERROR';

  constructor(
    message: string,
    public readonly phase?: string,
    metadata?: Record<string, unknown>
  ) {
    super(message, EXIT_CODES.GENERATION_ERROR, metadata);
  }

  getUserMessage(): string {
    if (this.phase) {
      return `Generation failed during ${this.phase}: ${this.message}`;
    }
    return this.message;
  }
}

/**
 * Configuration Error
 * Exit code: 1
 */
export class ConfigError extends FosztError {
  readonly code = 'CONFIG_ERROR';

  constructor(
    message: string,
    metadata?: Record<string, unknown>
  ) {
    super(message, EXIT_CODES.RUNTIME_ERROR, metadata);
  }
}

/**
 * File System Error
 * Exit code: 5
 */
export class FileSystemError extends FosztError {
  readonly code = 'FILE_SYSTEM_ERROR';

  constructor(
    message: string,
    public readonly path?: string,
    public readonly operation?: string,
    metadata?: Record<string, unknown>
  ) {
    super(message, EXIT_CODES.FILE_SYSTEM_ERROR, metadata);
  }

  getUserMessage(): string {
    const parts = [this.message];

    if (this.path) {
      parts.push(`File: ${this.path}`);
    }

    if (this.operation) {
      parts.push(`Operation: ${this.operation}`);
    }

    return parts.join('\n');
  }
}

/**
 * Type guard to check if an error is a FOST error
 */
export function isFosztError(error: unknown): error is FosztError {
  return error instanceof FosztError;
}

/**
 * Get exit code from any error
 */
export function getExitCode(error: unknown): ExitCode {
  if (isFosztError(error)) {
    return error.exitCode;
  }

  if (error instanceof Error) {
    const code = (error as any).code;

    // Map system error codes to FOST exit codes
    if (code === 'ENOENT' || code === 'EACCES' || code === 'EISDIR') {
      return EXIT_CODES.FILE_SYSTEM_ERROR;
    }

    if (code === 'ERR_INVALID_ARG_VALUE' || code === 'ERR_INVALID_ARG_TYPE') {
      return EXIT_CODES.CLI_USAGE_ERROR;
    }
  }

  return EXIT_CODES.RUNTIME_ERROR;
}
