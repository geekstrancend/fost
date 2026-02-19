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
   */
  private static async loadTsConfig(filePath: string): Promise<FostConfig> {
    // In a real implementation, this would require a TypeScript loader
    // For now, we'll just try to load it as a module
    try {
      delete require.cache[require.resolve(filePath)];
      const module = require(filePath);
      return this.mergeConfig(module.default || module);
    } catch (error) {
      throw new Error(`Failed to load TypeScript config from ${filePath}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Load JavaScript configuration file
   */
  private static loadJsConfig(filePath: string): FostConfig {
    try {
      delete require.cache[require.resolve(filePath)];
      const module = require(filePath);
      return this.mergeConfig(module.default || module);
    } catch (error) {
      throw new Error(`Failed to load JS config from ${filePath}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Load .fostrc file (JSON format)
   */
  private static loadRcFile(filePath: string): FostConfig {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const config = JSON.parse(content);
      return this.mergeConfig(config);
    } catch (error) {
      throw new Error(`Failed to parse .fostrc: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Load configuration from package.json
   */
  private static loadPackageJson(filePath: string): FostConfig | null {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const packageJson = JSON.parse(content);

      if (packageJson.fost) {
        return this.mergeConfig(packageJson.fost);
      }

      return null;
    } catch (error) {
      throw new Error(`Failed to parse package.json: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Merge user config with defaults
   */
  private static mergeConfig(userConfig: unknown): FostConfig {
    if (!userConfig || typeof userConfig !== 'object') {
      return { ...DEFAULT_CONFIG };
    }

    return {
      ...DEFAULT_CONFIG,
      ...(userConfig as Record<string, unknown>),
    };
  }
}

/**
 * Validate configuration
 */
export function validateConfig(config: FostConfig): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

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
