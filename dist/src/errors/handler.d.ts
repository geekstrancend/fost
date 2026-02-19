/**
 * Centralized Error Handler for FOST CLI
 */
/**
 * Main error handler for the CLI
 */
export declare function handleError(error: unknown): never;
/**
 * Async error wrapper for CLI commands
 */
export declare function catchError<T>(fn: () => Promise<T>): Promise<T>;
//# sourceMappingURL=handler.d.ts.map