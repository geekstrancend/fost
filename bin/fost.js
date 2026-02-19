#!/usr/bin/env node

/**
 * Fost CLI Entry Point
 * Executable entry point for the Fost CLI when installed globally
 * Exit codes:
 *  0 - Success
 *  1 - Runtime error
 *  2 - CLI usage error
 *  3 - Validation error
 *  4 - Generation error
 *  5 - File system error
 * 130 - SIGINT (user abort)
 */

const { bootstrap } = require('../dist/src/cli/bootstrap');

bootstrap({ argv: process.argv.slice(2) })
  .catch((error) => {
    // Should not reach here due to global handlers in bootstrap
    // But provide fallback just in case
    console.error('FATAL:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  });
