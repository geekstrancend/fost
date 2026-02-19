"use strict";
/**
 * CODE GENERATION - Public API
 *
 * Exports the complete code generation system for SDK production.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SDKCodeGenerator = exports.TypeDefinitionBuilder = exports.MethodBuilder = exports.ConfigurationBuilder = exports.ErrorTypeBuilder = exports.ClientClassBuilder = exports.DEFAULT_EMITTER_OPTIONS = exports.CodeBuilder = exports.TypeScriptEmitter = void 0;
// Code emitter
var emitter_1 = require("./emitter");
Object.defineProperty(exports, "TypeScriptEmitter", { enumerable: true, get: function () { return emitter_1.TypeScriptEmitter; } });
Object.defineProperty(exports, "CodeBuilder", { enumerable: true, get: function () { return emitter_1.CodeBuilder; } });
Object.defineProperty(exports, "DEFAULT_EMITTER_OPTIONS", { enumerable: true, get: function () { return emitter_1.DEFAULT_EMITTER_OPTIONS; } });
// Generator builders
var generators_1 = require("./generators");
Object.defineProperty(exports, "ClientClassBuilder", { enumerable: true, get: function () { return generators_1.ClientClassBuilder; } });
Object.defineProperty(exports, "ErrorTypeBuilder", { enumerable: true, get: function () { return generators_1.ErrorTypeBuilder; } });
Object.defineProperty(exports, "ConfigurationBuilder", { enumerable: true, get: function () { return generators_1.ConfigurationBuilder; } });
Object.defineProperty(exports, "MethodBuilder", { enumerable: true, get: function () { return generators_1.MethodBuilder; } });
Object.defineProperty(exports, "TypeDefinitionBuilder", { enumerable: true, get: function () { return generators_1.TypeDefinitionBuilder; } });
// Main generator
var index_1 = require("./index");
Object.defineProperty(exports, "SDKCodeGenerator", { enumerable: true, get: function () { return index_1.SDKCodeGenerator; } });
//# sourceMappingURL=api.js.map