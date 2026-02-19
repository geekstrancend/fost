"use strict";
/**
 * Error Index - Export all error classes
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.catchError = exports.handleError = exports.EXIT_CODES = exports.getExitCode = exports.isFosztError = exports.FileSystemError = exports.ConfigError = exports.GenerationError = exports.SpecValidationError = exports.CLIUsageError = exports.FosztError = void 0;
var base_1 = require("./base");
Object.defineProperty(exports, "FosztError", { enumerable: true, get: function () { return base_1.FosztError; } });
Object.defineProperty(exports, "CLIUsageError", { enumerable: true, get: function () { return base_1.CLIUsageError; } });
Object.defineProperty(exports, "SpecValidationError", { enumerable: true, get: function () { return base_1.SpecValidationError; } });
Object.defineProperty(exports, "GenerationError", { enumerable: true, get: function () { return base_1.GenerationError; } });
Object.defineProperty(exports, "ConfigError", { enumerable: true, get: function () { return base_1.ConfigError; } });
Object.defineProperty(exports, "FileSystemError", { enumerable: true, get: function () { return base_1.FileSystemError; } });
Object.defineProperty(exports, "isFosztError", { enumerable: true, get: function () { return base_1.isFosztError; } });
Object.defineProperty(exports, "getExitCode", { enumerable: true, get: function () { return base_1.getExitCode; } });
Object.defineProperty(exports, "EXIT_CODES", { enumerable: true, get: function () { return base_1.EXIT_CODES; } });
var handler_1 = require("./handler");
Object.defineProperty(exports, "handleError", { enumerable: true, get: function () { return handler_1.handleError; } });
Object.defineProperty(exports, "catchError", { enumerable: true, get: function () { return handler_1.catchError; } });
//# sourceMappingURL=index.js.map