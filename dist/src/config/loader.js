"use strict";
/**
 * Configuration Management for FOST
 * Handles loading and validation of config from multiple sources
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigLoader = void 0;
exports.validateConfig = validateConfig;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
/**
 * Default configuration
 */
const DEFAULT_CONFIG = {
    outputDir: './sdk',
    target: 'web2',
    strict: false,
    language: 'typescript',
    includeTests: true,
    includeDocs: true,
    logLevel: 'info',
    noColor: false,
};
/**
 * Configuration loader
 * Tries multiple sources in order of precedence:
 * 1. fost.config.ts
 * 2. fost.config.js
 * 3. .fostrc
 * 4. package.json "fost" field
 */
class ConfigLoader {
    /**
     * Load configuration from workspace
     */
    static async load(cwd = process.cwd()) {
        // Try TypeScript config first
        const tsConfigPath = path.join(cwd, 'fost.config.ts');
        if (fs.existsSync(tsConfigPath)) {
            return this.loadTsConfig(tsConfigPath);
        }
        // Try JavaScript config
        const jsConfigPath = path.join(cwd, 'fost.config.js');
        if (fs.existsSync(jsConfigPath)) {
            return this.loadJsConfig(jsConfigPath);
        }
        // Try .fostrc
        const rcPath = path.join(cwd, '.fostrc');
        if (fs.existsSync(rcPath)) {
            return this.loadRcFile(rcPath);
        }
        // Try package.json
        const packageJsonPath = path.join(cwd, 'package.json');
        if (fs.existsSync(packageJsonPath)) {
            const config = this.loadPackageJson(packageJsonPath);
            if (config) {
                return config;
            }
        }
        // Return defaults if no config found
        return { ...DEFAULT_CONFIG };
    }
    /**
     * Load TypeScript configuration file
     */
    static async loadTsConfig(filePath) {
        // In a real implementation, this would require a TypeScript loader
        // For now, we'll just try to load it as a module
        try {
            delete require.cache[require.resolve(filePath)];
            const module = require(filePath);
            return this.mergeConfig(module.default || module);
        }
        catch (error) {
            throw new Error(`Failed to load TypeScript config from ${filePath}: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    /**
     * Load JavaScript configuration file
     */
    static loadJsConfig(filePath) {
        try {
            delete require.cache[require.resolve(filePath)];
            const module = require(filePath);
            return this.mergeConfig(module.default || module);
        }
        catch (error) {
            throw new Error(`Failed to load JS config from ${filePath}: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    /**
     * Load .fostrc file (JSON format)
     */
    static loadRcFile(filePath) {
        try {
            const content = fs.readFileSync(filePath, 'utf-8');
            const config = JSON.parse(content);
            return this.mergeConfig(config);
        }
        catch (error) {
            throw new Error(`Failed to parse .fostrc: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    /**
     * Load configuration from package.json
     */
    static loadPackageJson(filePath) {
        try {
            const content = fs.readFileSync(filePath, 'utf-8');
            const packageJson = JSON.parse(content);
            if (packageJson.fost) {
                return this.mergeConfig(packageJson.fost);
            }
            return null;
        }
        catch (error) {
            throw new Error(`Failed to parse package.json: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    /**
     * Merge user config with defaults
     */
    static mergeConfig(userConfig) {
        if (!userConfig || typeof userConfig !== 'object') {
            return { ...DEFAULT_CONFIG };
        }
        return {
            ...DEFAULT_CONFIG,
            ...userConfig,
        };
    }
}
exports.ConfigLoader = ConfigLoader;
/**
 * Validate configuration
 */
function validateConfig(config) {
    const errors = [];
    if (config.target && !['web2', 'web3'].includes(config.target)) {
        errors.push(`Invalid target: ${config.target}. Must be 'web2' or 'web3'`);
    }
    if (config.language && typeof config.language !== 'string') {
        errors.push('language must be a string');
    }
    if (config.outputDir && typeof config.outputDir !== 'string') {
        errors.push('outputDir must be a string');
    }
    if (config.strict !== undefined && typeof config.strict !== 'boolean') {
        errors.push('strict must be a boolean');
    }
    if (config.logLevel && !['debug', 'info', 'warn', 'error'].includes(config.logLevel)) {
        errors.push(`Invalid logLevel: ${config.logLevel}`);
    }
    return {
        valid: errors.length === 0,
        errors,
    };
}
//# sourceMappingURL=loader.js.map