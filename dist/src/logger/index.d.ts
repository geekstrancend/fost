/**
 * Structured Logger for FOST
 * Provides consistent, formatted logging with verbosity control
 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';
export interface LoggerConfig {
    level?: LogLevel;
    colorize?: boolean;
    format?: 'text' | 'json';
}
export interface Logger {
    debug(message: string, context?: Record<string, unknown>): void;
    info(message: string, context?: Record<string, unknown>): void;
    warn(message: string, context?: Record<string, unknown>): void;
    error(message: string, context?: Record<string, unknown>): void;
    success(message: string): void;
    configure(options: LoggerConfig): void;
}
/**
 * Create a new logger instance
 */
export declare function createLogger(): Logger;
//# sourceMappingURL=index.d.ts.map