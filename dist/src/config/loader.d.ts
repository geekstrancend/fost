/**
 * Configuration Management for FOST
 * Handles loading and validation of config from multiple sources
 */
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
 * Configuration loader
 * Tries multiple sources in order of precedence:
 * 1. fost.config.ts
 * 2. fost.config.js
 * 3. .fostrc
 * 4. package.json "fost" field
 */
export declare class ConfigLoader {
    /**
     * Load configuration from workspace
     */
    static load(cwd?: string): Promise<FostConfig>;
    /**
     * Load TypeScript configuration file
     */
    private static loadTsConfig;
    /**
     * Load JavaScript configuration file
     */
    private static loadJsConfig;
    /**
     * Load .fostrc file (JSON format)
     */
    private static loadRcFile;
    /**
     * Load configuration from package.json
     */
    private static loadPackageJson;
    /**
     * Merge user config with defaults
     */
    private static mergeConfig;
}
/**
 * Validate configuration
 */
export declare function validateConfig(config: FostConfig): {
    valid: boolean;
    errors: string[];
};
//# sourceMappingURL=loader.d.ts.map