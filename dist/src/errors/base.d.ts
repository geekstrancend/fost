/**
 * Base Error Classes for FOST
 * Provides consistent error handling across the CLI
 */
/**
 * Exit codes for CLI errors
 */
export declare const EXIT_CODES: {
    readonly SUCCESS: 0;
    readonly RUNTIME_ERROR: 1;
    readonly CLI_USAGE_ERROR: 2;
    readonly VALIDATION_ERROR: 3;
    readonly GENERATION_ERROR: 4;
    readonly FILE_SYSTEM_ERROR: 5;
};
export type ExitCode = typeof EXIT_CODES[keyof typeof EXIT_CODES];
/**
 * Base FOST Error
 */
export declare abstract class FosztError extends Error {
    readonly message: string;
    readonly exitCode: ExitCode;
    readonly metadata?: Record<string, unknown> | undefined;
    abstract readonly code: string;
    constructor(message: string, exitCode?: ExitCode, metadata?: Record<string, unknown> | undefined);
    /**
     * User-facing error message (without stack trace)
     */
    getUserMessage(): string;
    /**
     * Debug message (includes stack trace and metadata)
     */
    getDebugMessage(): string;
}
/**
 * CLI Usage Error
 * Exit code: 2
 */
export declare class CLIUsageError extends FosztError {
    readonly code = "CLI_USAGE_ERROR";
    constructor(message: string, metadata?: Record<string, unknown>);
}
/**
 * Specification Validation Error
 * Exit code: 3
 */
export declare class SpecValidationError extends FosztError {
    readonly errors: Array<{
        code: string;
        message: string;
        path?: string;
        suggestion?: string;
    }>;
    readonly code = "SPEC_VALIDATION_ERROR";
    constructor(message: string, errors?: Array<{
        code: string;
        message: string;
        path?: string;
        suggestion?: string;
    }>, metadata?: Record<string, unknown>);
    getUserMessage(): string;
}
/**
 * SDK Generation Error
 * Exit code: 4
 */
export declare class GenerationError extends FosztError {
    readonly phase?: string | undefined;
    readonly code = "GENERATION_ERROR";
    constructor(message: string, phase?: string | undefined, metadata?: Record<string, unknown>);
    getUserMessage(): string;
}
/**
 * Configuration Error
 * Exit code: 1
 */
export declare class ConfigError extends FosztError {
    readonly code = "CONFIG_ERROR";
    constructor(message: string, metadata?: Record<string, unknown>);
}
/**
 * File System Error
 * Exit code: 5
 */
export declare class FileSystemError extends FosztError {
    readonly path?: string | undefined;
    readonly operation?: string | undefined;
    readonly code = "FILE_SYSTEM_ERROR";
    constructor(message: string, path?: string | undefined, operation?: string | undefined, metadata?: Record<string, unknown>);
    getUserMessage(): string;
}
/**
 * Type guard to check if an error is a FOST error
 */
export declare function isFosztError(error: unknown): error is FosztError;
/**
 * Get exit code from any error
 */
export declare function getExitCode(error: unknown): ExitCode;
//# sourceMappingURL=base.d.ts.map