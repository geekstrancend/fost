"use strict";
// Fallback Strategy - Multi-tier fallback system for failed LLM calls
Object.defineProperty(exports, "__esModule", { value: true });
exports.FallbackResultHandler = exports.FallbackStrategy = void 0;
/**
 * Fallback Strategy - Multi-tier fallback system
 * Tries progressively simpler approaches when main LLM call fails
 */
class FallbackStrategy {
    constructor() {
        this.tier4Cache = new Map();
    }
    /**
     * Execute with fallback chain
     */
    async execute(options) {
        const config = options.config || this.getDefaultFallbackConfig(options.promptId);
        // Tier 1: Retry with alternate prompt and stricter parameters
        if (config.tier1) {
            try {
                const result = await this.executeTier1(options, config.tier1);
                if (result.success) {
                    return { success: true, tier: 'tier1', result: result.result };
                }
            }
            catch (error) {
                console.warn(`Tier 1 fallback failed: ${error}`);
            }
        }
        // Tier 2: Try different model (faster/cheaper)
        if (config.tier2) {
            try {
                const result = await this.executeTier2(options, config.tier2);
                if (result.success) {
                    return { success: true, tier: 'tier2', result: result.result };
                }
            }
            catch (error) {
                console.warn(`Tier 2 fallback failed: ${error}`);
            }
        }
        // Tier 3: Use template-based generation (no LLM)
        if (config.tier3) {
            try {
                const result = await this.executeTier3(options, config.tier3);
                if (result.success) {
                    return { success: true, tier: 'tier3', result: result.result };
                }
            }
            catch (error) {
                console.warn(`Tier 3 fallback failed: ${error}`);
            }
        }
        // Tier 4: Return cached result from similar query
        if (config.tier4) {
            try {
                const result = await this.executeTier4(options, config.tier4);
                if (result.success) {
                    return { success: true, tier: 'tier4', result: result.result };
                }
            }
            catch (error) {
                console.warn(`Tier 4 fallback failed: ${error}`);
            }
        }
        // All fallbacks exhausted
        return {
            success: false,
            tier: 'tier1',
            error: new Error('All fallback strategies exhausted'),
        };
    }
    /**
     * Tier 1: Alternate prompt with stricter parameters
     */
    async executeTier1(options, _fallback) {
        // Tier 1 is typically handled by the LLM client with different parameters
        // This is a placeholder for the actual implementation
        console.log(`Falling back to Tier 1: Alternate prompt for ${options.promptId}`);
        return {
            success: false, // Would be implemented by LLMClient
        };
    }
    /**
     * Tier 2: Different model (faster/cheaper alternative)
     */
    async executeTier2(options, fallback) {
        console.log(`Falling back to Tier 2: Different model for ${options.promptId}`);
        console.log(`  Using model: ${fallback.model || 'gpt-3.5-turbo'}`);
        return {
            success: false, // Would be implemented by LLMClient
        };
    }
    /**
     * Tier 3: Template-based generation (no LLM)
     */
    async executeTier3(options, fallback) {
        console.log(`Falling back to Tier 3: Template-based generation for ${options.promptId}`);
        // Use template to generate output
        if (fallback.template && this.tier3TemplateGenerator) {
            try {
                const result = this.tier3TemplateGenerator(options.input, fallback.template);
                return { success: true, result };
            }
            catch (error) {
                return { success: false };
            }
        }
        // Fallback to basic template
        const basicResult = this.generateBasicTemplate(options.promptId, options.input);
        return { success: true, result: basicResult };
    }
    /**
     * Tier 4: Return cached result
     */
    async executeTier4(options, _fallback) {
        return new Promise(resolve => {
            console.log(`Falling back to Tier 4: Cached result for ${options.promptId}`);
            const cacheKey = this.getCacheKey(options.promptId, options.input);
            const cached = this.tier4Cache?.get(cacheKey);
            if (cached) {
                console.log(`  Found cached result`);
                resolve({ success: true, result: cached });
            }
            else {
                resolve({ success: false });
            }
        });
    }
    /**
     * Cache successful result for future fallback
     */
    cacheResult(promptId, input, result) {
        const cacheKey = this.getCacheKey(promptId, input);
        this.tier4Cache?.set(cacheKey, result);
    }
    /**
     * Generate basic template-based output
     */
    generateBasicTemplate(_promptId, _input) {
        switch (_promptId) {
            case 'typescript-types':
                return {
                    interface_name: 'GeneratedType',
                    code: 'interface GeneratedType { [key: string]: any; }',
                    imports: [],
                    validation: {
                        properties_from_schema: false,
                        no_hallucinations: true,
                        syntax_correct: true,
                    },
                };
            case 'docstring-generation':
                return {
                    jsdoc: '/**\n * Auto-generated method\n */',
                    isComplete: false,
                };
            case 'test-generation':
                return {
                    tests: `describe('generated', () => {
  it('placeholder test', () => {
    expect(true).toBe(true);
  });
});`,
                    testCount: 1,
                };
            default:
                return {
                    success: false,
                    message: 'No template available for this prompt type',
                };
        }
    }
    /**
     * Get default fallback config for a prompt
     */
    getDefaultFallbackConfig(_promptId) {
        return {
            tier1: {
                type: 'alternate-prompt',
                temperature: 0.05, // Even lower for stricter output
            },
            tier2: {
                type: 'different-model',
                model: 'gpt-3.5-turbo', // Faster, cheaper
            },
            tier3: {
                type: 'template',
                template: 'basic',
            },
            tier4: {
                type: 'cache',
            },
        };
    }
    /**
     * Generate cache key from prompt and input
     */
    getCacheKey(promptId, input) {
        const inputStr = JSON.stringify(input);
        return `${promptId}:${this.hash(inputStr)}`;
    }
    /**
     * Simple hash function for cache keys
     */
    hash(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = (hash << 5) - hash + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return Math.abs(hash).toString(16);
    }
    /**
     * Set custom template generator
     */
    setTemplateGenerator(fn) {
        this.tier3TemplateGenerator = fn;
    }
    /**
     * Clear cache
     */
    clearCache() {
        this.tier4Cache?.clear();
    }
    /**
     * Get cache size
     */
    getCacheSize() {
        return this.tier4Cache?.size || 0;
    }
}
exports.FallbackStrategy = FallbackStrategy;
/**
 * Fallback result handler - Formats fallback results
 */
class FallbackResultHandler {
    /**
     * Format fallback result for logging
     */
    static formatResult(result) {
        if (result.success) {
            return `Fallback succeeded (Tier ${result.tier[result.tier.length - 1]}): ${JSON.stringify(result.result).slice(0, 100)}...`;
        }
        else {
            return `All fallbacks exhausted: ${result.error?.message}`;
        }
    }
    /**
     * Get quality assessment of fallback output
     */
    static assessQuality(tier, _result) {
        // Tier 1: High quality (same model, different params)
        if (tier === 'tier1')
            return 'high';
        // Tier 2: Medium quality (different model)
        if (tier === 'tier2')
            return 'medium';
        // Tier 3: Low quality (template-based)
        if (tier === 'tier3')
            return 'low';
        // Tier 4: Medium quality (cached result)
        if (tier === 'tier4')
            return 'medium';
        return 'low';
    }
    /**
     * Suggest user action based on fallback result
     */
    static suggestAction(result) {
        if (result.success) {
            return `Used fallback (Tier ${result.tier[result.tier.length - 1]}). Output quality may be reduced. Consider manual review.`;
        }
        else {
            return 'Generation completely failed. Please check logs and retry manually.';
        }
    }
}
exports.FallbackResultHandler = FallbackResultHandler;
//# sourceMappingURL=fallback-strategy.js.map