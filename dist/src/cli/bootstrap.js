"use strict";
/**
 * CLI Bootstrap
 * Initializes the CLI with global error handling and process setup
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.bootstrap = bootstrap;
const index_1 = require("./index");
/**
 * Global error handler for unhandled promise rejections
 */
function handleUnhandledRejection(reason) {
    const message = reason instanceof Error
        ? reason.message
        : String(reason);
    console.error(`\u001b[31mERROR\u001b[0m Unhandled Promise Rejection: ${message}`);
    if (process.env.DEBUG) {
        console.error(reason);
    }
    process.exit(1);
}
/**
 * Global error handler for uncaught exceptions
 */
function handleUncaughtException(error) {
    console.error(`\u001b[31mERROR\u001b[0m Uncaught Exception: ${error.message}`);
    if (process.env.DEBUG) {
        console.error(error.stack);
    }
    process.exit(1);
}
/**
 * Bootstrap the CLI application with error handlers
 */
async function bootstrap(options = {}) {
    // Setup global error handlers
    process.on('unhandledRejection', handleUnhandledRejection);
    process.on('uncaughtException', handleUncaughtException);
    // Handle SIGINT gracefully
    process.on('SIGINT', () => {
        console.error('\n\nAborted by user');
        process.exit(130); // Standard exit code for SIGINT
    });
    // Create and run CLI application
    const cli = new index_1.CLIApplication(options.argv);
    await cli.run();
}
//# sourceMappingURL=bootstrap.js.map