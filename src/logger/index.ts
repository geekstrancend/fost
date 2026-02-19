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

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const COLORS = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
};

/**
 * Create a new logger instance
 */
export function createLogger(): Logger {
  let config: Required<LoggerConfig> = {
    level: 'info',
    colorize: process.env.NO_COLOR ? false : true,
    format: 'text',
  };

  /**
   * Check if a message should be logged based on level
   */
  function shouldLog(messageLevel: LogLevel): boolean {
    return LOG_LEVELS[messageLevel] >= LOG_LEVELS[config.level];
  }

  /**
   * Format and output a log message
   */
  function output(
    level: LogLevel,
    message: string,
    context?: Record<string, unknown>
  ): void {
    if (!shouldLog(level)) return;

    if (config.format === 'json') {
      const entry = {
        level,
        message,
        timestamp: new Date().toISOString(),
        ...(context && Object.keys(context).length > 0 ? { context } : {}),
      };
      console.log(JSON.stringify(entry));
    } else {
      const levelUpper = level.toUpperCase();
      const color = getLevelColor(level);
      const icon = getLevelIcon(level);

      let output = `${icon} `;

      if (config.colorize) {
        output += `${color}${levelUpper}${COLORS.reset}`;
      } else {
        output += levelUpper;
      }

      output += `: ${message}`;

      if (context && Object.keys(context).length > 0 && process.env.DEBUG) {
        output += `\n  ${JSON.stringify(context, null, 2).split('\n').join('\n  ')}`;
      }

      console.log(output);
    }
  }

  /**
   * Get color for log level
   */
  function getLevelColor(level: LogLevel): string {
    switch (level) {
      case 'debug':
        return COLORS.gray;
      case 'info':
        return COLORS.blue;
      case 'warn':
        return COLORS.yellow;
      case 'error':
        return COLORS.red;
    }
  }

  /**
   * Get icon for log level
   */
  function getLevelIcon(level: LogLevel): string {
    switch (level) {
      case 'debug':
        return '';
      case 'info':
        return '';
      case 'warn':
        return '';
      case 'error':
        return '';
    }
  }

  return {
    debug(message: string, context?: Record<string, unknown>): void {
      output('debug', message, context);
    },

    info(message: string, context?: Record<string, unknown>): void {
      output('info', message, context);
    },

    warn(message: string, context?: Record<string, unknown>): void {
      output('warn', message, context);
    },

    error(message: string, context?: Record<string, unknown>): void {
      output('error', message, context);
    },

    success(message: string): void {
      if (config.colorize) {
        console.log(`${COLORS.green}SUCCESS${COLORS.reset}: ${message}`);
      } else {
        console.log(`SUCCESS: ${message}`);
      }
    },

    configure(options: LoggerConfig): void {
      config = { ...config, ...options };

      // Allow DEBUG env var to override level
      if (process.env.DEBUG) {
        config.level = 'debug';
      }
    },
  };
}
