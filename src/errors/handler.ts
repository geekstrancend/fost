/**
 * Centralized Error Handler for FOST CLI
 */

import { FosztError, isFosztError, getExitCode } from './base';

/**
 * Main error handler for the CLI
 */
export function handleError(error: unknown): never {
  let userMessage: string;
  let debugMessage: string;
  let exitCode: number;

  if (isFosztError(error)) {
    // FOST Error
    userMessage = error.getUserMessage();
    debugMessage = error.getDebugMessage();
    exitCode = error.exitCode;
  } else if (error instanceof Error) {
    // Standard Error
    userMessage = error.message;
    debugMessage = error.stack || error.message;
    exitCode = getExitCode(error);
  } else {
    // Unknown error
    userMessage = String(error);
    debugMessage = String(error);
    exitCode = 1;
  }

  // Print user message (always)
  console.error(`\x1b[31mERROR\x1b[0m ${userMessage}`);

  // Print debug message if DEBUG env var is set
  if (process.env.DEBUG) {
    console.error('\nDebug Information:');
    console.error(debugMessage);
  }

  // Exit with appropriate code
  process.exit(exitCode);
}

/**
 * Async error wrapper for CLI commands
 */
export async function catchError<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    handleError(error);
  }
}
