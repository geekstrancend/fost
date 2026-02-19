"use strict";
/**
 * Base Error Classes for FOST
 * Provides consistent error handling across the CLI
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileSystemError = exports.ConfigError = exports.GenerationError = exports.SpecValidationError = exports.CLIUsageError = exports.FosztError = exports.EXIT_CODES = void 0;
exports.isFosztError = isFosztError;
exports.getExitCode = getExitCode;
/**
 * Exit codes for CLI errors
 */
exports.EXIT_CODES = {
    SUCCESS: 0,
    RUNTIME_ERROR: 1,
    CLI_USAGE_ERROR: 2,
    VALIDATION_ERROR: 3,
    GENERATION_ERROR: 4,
    FILE_SYSTEM_ERROR: 5,
};
/**
 * Base FOST Error
 */
class FosztError extends Error {
    constructor(message, exitCode = exports.EXIT_CODES.RUNTIME_ERROR, metadata) {
        super(message);
        this.message = message;
        this.exitCode = exitCode;
        this.metadata = metadata;
        Object.setPrototypeOf(this, new.target.prototype);
    }
    /**
     * User-facing error message (without stack trace)
     */
    getUserMessage() {
        return this.message;
    }
    /**
     * Debug message (includes stack trace and metadata)
     */
    getDebugMessage() {
        const parts = [this.message, this.stack];
        if (this.metadata) {
            parts.push(`Metadata: ${JSON.stringify(this.metadata, null, 2)}`);
        }
        return parts.filter(Boolean).join('\n');
    }
}
exports.FosztError = FosztError;
/**
 * CLI Usage Error
 * Exit code: 2
 */
class CLIUsageError extends FosztError {
    constructor(message, metadata) {
        super(message, exports.EXIT_CODES.CLI_USAGE_ERROR, metadata);
        this.code = 'CLI_USAGE_ERROR';
    }
}
exports.CLIUsageError = CLIUsageError;
/**
 * Specification Validation Error
 * Exit code: 3
 */
class SpecValidationError extends FosztError {
    constructor(message, errors = [], metadata) {
        super(message, exports.EXIT_CODES.VALIDATION_ERROR, metadata);
        this.errors = errors;
        this.code = 'SPEC_VALIDATION_ERROR';
    }
    getUserMessage() {
        const baseMessage = this.message;
        const errorDetails = this.errors
            .map(e => `  [${e.code}] ${e.message}${e.suggestion ? `\n    Suggestion: ${e.suggestion}` : ''}`)
            .join('\n');
        return `${baseMessage}\n${errorDetails}`;
    }
}
exports.SpecValidationError = SpecValidationError;
/**
 * SDK Generation Error
 * Exit code: 4
 */
class GenerationError extends FosztError {
    constructor(message, phase, metadata) {
        super(message, exports.EXIT_CODES.GENERATION_ERROR, metadata);
        this.phase = phase;
        this.code = 'GENERATION_ERROR';
    }
    getUserMessage() {
        if (this.phase) {
            return `Generation failed during ${this.phase}: ${this.message}`;
        }
        return this.message;
    }
}
exports.GenerationError = GenerationError;
/**
 * Configuration Error
 * Exit code: 1
 */
class ConfigError extends FosztError {
    constructor(message, metadata) {
        super(message, exports.EXIT_CODES.RUNTIME_ERROR, metadata);
        this.code = 'CONFIG_ERROR';
    }
}
exports.ConfigError = ConfigError;
/**
 * File System Error
 * Exit code: 5
 */
class FileSystemError extends FosztError {
    constructor(message, path, operation, metadata) {
        super(message, exports.EXIT_CODES.FILE_SYSTEM_ERROR, metadata);
        this.path = path;
        this.operation = operation;
        this.code = 'FILE_SYSTEM_ERROR';
    }
    getUserMessage() {
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
exports.FileSystemError = FileSystemError;
/**
 * Type guard to check if an error is a FOST error
 */
function isFosztError(error) {
    return error instanceof FosztError;
}
/**
 * Get exit code from any error
 */
function getExitCode(error) {
    if (isFosztError(error)) {
        return error.exitCode;
    }
    if (error instanceof Error) {
        const code = error.code;
        // Map system error codes to FOST exit codes
        if (code === 'ENOENT' || code === 'EACCES' || code === 'EISDIR') {
            return exports.EXIT_CODES.FILE_SYSTEM_ERROR;
        }
        if (code === 'ERR_INVALID_ARG_VALUE' || code === 'ERR_INVALID_ARG_TYPE') {
            return exports.EXIT_CODES.CLI_USAGE_ERROR;
        }
    }
    return exports.EXIT_CODES.RUNTIME_ERROR;
}
//# sourceMappingURL=base.js.map