"use strict";
/**
 * Centralized Error Handler for FOST CLI
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleError = handleError;
exports.catchError = catchError;
const base_1 = require("./base");
/**
 * Main error handler for the CLI
 */
function handleError(error) {
    let userMessage;
    let debugMessage;
    let exitCode;
    if ((0, base_1.isFosztError)(error)) {
        // FOST Error
        userMessage = error.getUserMessage();
        debugMessage = error.getDebugMessage();
        exitCode = error.exitCode;
    }
    else if (error instanceof Error) {
        // Standard Error
        userMessage = error.message;
        debugMessage = error.stack || error.message;
        exitCode = (0, base_1.getExitCode)(error);
    }
    else {
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
async function catchError(fn) {
    try {
        return await fn();
    }
    catch (error) {
        handleError(error);
    }
}
//# sourceMappingURL=handler.js.map