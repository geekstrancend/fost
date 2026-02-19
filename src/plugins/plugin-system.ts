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
export class PluginRegistry {
  private plugins: FostPlugin[] = [];

  /**
   * Register a plugin
   */
  register(plugin: FostPlugin): void {
    this.plugins.push(plugin);
  }

  /**
   * Run all pre-generation hooks
   */
  async runPreGeneration(spec: any, config: any): Promise<void> {
    for (const plugin of this.plugins) {
      if (plugin.preGeneration) {
        await plugin.preGeneration(spec, config);
      }
    }
  }

  /**
   * Run all post-generation hooks
   */
  async runPostGeneration(generatedSdk: any, config: any): Promise<void> {
    for (const plugin of this.plugins) {
      if (plugin.postGeneration) {
        await plugin.postGeneration(generatedSdk, config);
      }
    }
  }

  /**
   * Get all registered plugins
   */
  getPlugins(): FostPlugin[] {
    return this.plugins;
  }
}

/**
 * Example custom plugin showing how to extend Fost
 */
export class ExamplePlugin implements FostPlugin {
  metadata: PluginMetadata = {
    name: 'example-plugin',
    version: '1.0.0',
    description: 'Example plugin for FOST',
    author: 'Fost Contributors',
    license: 'MIT',
  };

  register(context: PluginContext): void {
    context.logger.info(`Registered plugin: ${this.metadata.name}`);
  }

  async preGeneration(spec: any, _config: any): Promise<void> {
    // Transform spec before generation
    if (spec.info) {
      spec.info.title = `Custom: ${spec.info.title}`;
    }
  }

  async postGeneration(generatedSdk: any, _config: any): Promise<void> {
    // Additional processing after generation
    console.log('Post-generation hook:', generatedSdk);
  }
}
