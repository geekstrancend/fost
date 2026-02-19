"use strict";
/**
 * Plugin Architecture for FOST SDK Generators
 * Allows extending Fost with custom generators and transformers
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExamplePlugin = exports.PluginRegistry = void 0;
/**
 * Plugin registry
 */
class PluginRegistry {
    constructor() {
        this.plugins = [];
    }
    /**
     * Register a plugin
     */
    register(plugin) {
        this.plugins.push(plugin);
    }
    /**
     * Run all pre-generation hooks
     */
    async runPreGeneration(spec, config) {
        for (const plugin of this.plugins) {
            if (plugin.preGeneration) {
                await plugin.preGeneration(spec, config);
            }
        }
    }
    /**
     * Run all post-generation hooks
     */
    async runPostGeneration(generatedSdk, config) {
        for (const plugin of this.plugins) {
            if (plugin.postGeneration) {
                await plugin.postGeneration(generatedSdk, config);
            }
        }
    }
    /**
     * Get all registered plugins
     */
    getPlugins() {
        return this.plugins;
    }
}
exports.PluginRegistry = PluginRegistry;
/**
 * Example custom plugin showing how to extend Fost
 */
class ExamplePlugin {
    constructor() {
        this.metadata = {
            name: 'example-plugin',
            version: '1.0.0',
            description: 'Example plugin for FOST',
            author: 'Fost Contributors',
            license: 'MIT',
        };
    }
    register(context) {
        context.logger.info(`Registered plugin: ${this.metadata.name}`);
    }
    async preGeneration(spec, _config) {
        // Transform spec before generation
        if (spec.info) {
            spec.info.title = `Custom: ${spec.info.title}`;
        }
    }
    async postGeneration(generatedSdk, _config) {
        // Additional processing after generation
        console.log('Post-generation hook:', generatedSdk);
    }
}
exports.ExamplePlugin = ExamplePlugin;
//# sourceMappingURL=plugin-system.js.map