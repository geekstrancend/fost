/**
 * Configuration Management for FOST
 * Handles loading and validation of config from multiple sources
 */

import * as fs from 'fs';
import * as path from 'path';

/**
 * FOST Configuration Schema
 */
export interface FostConfig {
  /**
   * Output directory for generated SDKs
   */
  outputDir?: string;

  /**
   * Default SDK target type
   */
  target?: 'web2' | 'web3';

  /**
   * Enable strict validation mode
   */
  strict?: boolean;

  /**
   * Default language for code generation
   */
  language?: string;

  /**
   * Include test generation
   */
  includeTests?: boolean;

  /**
   * Include documentation generation
   */
  includeDocs?: boolean;

  /**
   * Log level
   */
  logLevel?: 'debug' | 'info' | 'warn' | 'error';

  /**
   * Disable colored output
   */
  noColor?: boolean;
}

/**
 * Default configuration
 */
const DEFAULT_CONFIG: FostConfig = {
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
export class ConfigLoader {
  /**
   * Load configuration from workspace
   */
  static async load(cwd: string = process.cwd()): Promise<FostConfig> {
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
 * 
 * @param filePath - Path to the TypeScript configuration file
 * @returns Parsed and validated configuration
 * @throws {Error} If file cannot be loaded or parsed
 */
  private static async loadTsConfig(filePath: string): Promise<FostConfig> {
    try {
      // Clear require cache to ensure fresh load
      delete require.cache[require.resolve(filePath)];
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const module = require(filePath);
      const config = module.default || module;
      
      if (!config || typeof config !== 'object') {
        throw new Error('Configuration file must export a valid object');
      }

      return this.mergeConfig(config);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to load TypeScript config from ${filePath}: ${message}`, { cause: error });
    }
  }

  /**
   * Load JavaScript configuration file
   *
   * @param filePath - Path to the JavaScript configuration file
   * @returns Parsed and validated configuration
   * @throws {Error} If file cannot be loaded or parsed
   */
  private static async loadJsConfig(filePath: string): Promise<FostConfig> {
    try {
      // Clear require cache to ensure fresh load
      delete require.cache[require.resolve(filePath)];
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const module = require(filePath);
      const config = module.default || module;

      if (!config || typeof config !== 'object') {
        throw new Error('Configuration file must export a valid object');
      }

      return this.mergeConfig(config);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to load JS config from ${filePath}: ${message}`, { cause: error });
    }
  }

  /**
   * Load .fostrc file (JSON format)
   *
   * @param filePath - Path to the .fostrc file
   * @returns Parsed and validated configuration
   * @throws {Error} If file cannot be parsed
   */
  private static loadRcFile(filePath: string): FostConfig {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const config = JSON.parse(content);

      if (!config || typeof config !== 'object') {
        throw new Error('.fostrc file must contain a valid JSON object');
      }

      return this.mergeConfig(config);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to parse .fostrc: ${message}`, { cause: error });
    }
  }

  /**
   * Load configuration from package.json
   *
   * @param filePath - Path to package.json
   * @returns Configuration from "fost" field, or null if not present
   * @throws {Error} If file cannot be parsed
   */
  private static loadPackageJson(filePath: string): FostConfig | null {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const packageJson = JSON.parse(content) as Record<string, unknown>;

      if (packageJson.fost && typeof packageJson.fost === 'object') {
        return this.mergeConfig(packageJson.fost);
      }

      return null;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to parse package.json: ${message}`, { cause: error });
    }
  }

  /**
   * Merge user config with defaults
   * 
   * @param userConfig - User-provided configuration (any shape)
   * @returns Merged configuration with defaults for missing values
   */
  private static mergeConfig(userConfig: unknown): FostConfig {
    if (!userConfig || typeof userConfig !== 'object') {
      return { ...DEFAULT_CONFIG };
    }

    const config = userConfig as Record<string, unknown>;
    
    return {
      ...DEFAULT_CONFIG,
      outputDir: typeof config.outputDir === 'string' ? config.outputDir : DEFAULT_CONFIG.outputDir,
      target: (config.target === 'web2' || config.target === 'web3') ? config.target : DEFAULT_CONFIG.target,
      strict: typeof config.strict === 'boolean' ? config.strict : DEFAULT_CONFIG.strict,
      language: typeof config.language === 'string' ? config.language : DEFAULT_CONFIG.language,
      includeTests: typeof config.includeTests === 'boolean' ? config.includeTests : DEFAULT_CONFIG.includeTests,
      includeDocs: typeof config.includeDocs === 'boolean' ? config.includeDocs : DEFAULT_CONFIG.includeDocs,
      logLevel: (config.logLevel === 'debug' || config.logLevel === 'info' || config.logLevel === 'warn' || config.logLevel === 'error')
        ? config.logLevel
        : DEFAULT_CONFIG.logLevel,
      noColor: typeof config.noColor === 'boolean' ? config.noColor : DEFAULT_CONFIG.noColor,
    };
  }
}

/**
 * Validate configuration against schema
 * Ensures configuration values are within acceptable ranges and correct types
 *
 * @param config - Configuration to validate
 * @returns Validation result with list of errors if invalid
 */
export function validateConfig(config: FostConfig): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Validate target
  if (config.target && !['web2', 'web3'].includes(config.target)) {
    errors.push(`Invalid target: '${config.target}'. Must be 'web2' or 'web3'`);
  }

  // Validate language
  if (config.language && typeof config.language !== 'string') {
    errors.push('language must be a string');
  }

  // Validate outputDir
  if (config.outputDir && typeof config.outputDir !== 'string') {
    errors.push('outputDir must be a string');
  }

  if (config.outputDir && config.outputDir.length === 0) {
    errors.push('outputDir cannot be empty');
  }

  // Validate strict mode
  if (config.strict !== undefined && typeof config.strict !== 'boolean') {
    errors.push('strict must be a boolean');
  }

  // Validate log level
  if (config.logLevel && !['debug', 'info', 'warn', 'error'].includes(config.logLevel)) {
    errors.push(`Invalid logLevel: '${config.logLevel}'. Must be one of: debug, info, warn, error`);
  }

  // Validate noColor
  if (config.noColor !== undefined && typeof config.noColor !== 'boolean') {
    errors.push('noColor must be a boolean');
  }

  // Validate includeTests
  if (config.includeTests !== undefined && typeof config.includeTests !== 'boolean') {
    errors.push('includeTests must be a boolean');
  }

  // Validate includeDocs
  if (config.includeDocs !== undefined && typeof config.includeDocs !== 'boolean') {
    errors.push('includeDocs must be a boolean');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
