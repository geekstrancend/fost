/**
 * Plugin Architecture for FOST SDK Generators
 * Allows extending Fost with custom generators and transformers
 */
/**
 * Plugin metadata
 */
export interface PluginMetadata {
    name: string;
    version: string;
    description: string;
    author: string;
    license: string;
}
/**
 * Plugin hook for pre-generation
 */
export interface PreGenerationHook {
    (spec: any, config: any): Promise<void>;
}
/**
 * Plugin hook for post-generation
 */
export interface PostGenerationHook {
    (generatedSdk: any, config: any): Promise<void>;
}
/**
 * Plugin implementation
 */
export interface FostPlugin {
    metadata: PluginMetadata;
    preGeneration?: PreGenerationHook;
    postGeneration?: PostGenerationHook;
    register(context: PluginContext): void;
}
/**
 * Context provided to plugins
 */
export interface PluginContext {
    config: any;
    logger: any;
    helpers: {
        resolveType: (type: string) => string;
        formatCode: (code: string) => string;
        writeFile: (path: string, content: string) => Promise<void>;
    };
}
/**
 * Plugin registry
 */
export declare class PluginRegistry {
    private plugins;
    /**
     * Register a plugin
     */
    register(plugin: FostPlugin): void;
    /**
     * Run all pre-generation hooks
     */
    runPreGeneration(spec: any, config: any): Promise<void>;
    /**
     * Run all post-generation hooks
     */
    runPostGeneration(generatedSdk: any, config: any): Promise<void>;
    /**
     * Get all registered plugins
     */
    getPlugins(): FostPlugin[];
}
/**
 * Example custom plugin showing how to extend Fost
 */
export declare class ExamplePlugin implements FostPlugin {
    metadata: PluginMetadata;
    register(context: PluginContext): void;
    preGeneration(spec: any, _config: any): Promise<void>;
    postGeneration(generatedSdk: any, _config: any): Promise<void>;
}
//# sourceMappingURL=plugin-system.d.ts.map