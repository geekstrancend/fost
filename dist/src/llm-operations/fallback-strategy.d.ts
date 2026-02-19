export type FallbackTier = 'tier1' | 'tier2' | 'tier3' | 'tier4';
export interface FallbackOption {
    type: 'alternate-prompt' | 'different-model' | 'template' | 'cache';
    promptId?: string;
    promptVersion?: string;
    model?: string;
    temperature?: number;
    template?: string;
    condition?: (error: Error) => boolean;
}
export interface FallbackConfig {
    tier1?: FallbackOption;
    tier2?: FallbackOption;
    tier3?: FallbackOption;
    tier4?: FallbackOption;
}
export interface FallbackResult {
    success: boolean;
    tier: FallbackTier;
    result?: any;
    error?: Error;
}
/**
 * Fallback Strategy - Multi-tier fallback system
 * Tries progressively simpler approaches when main LLM call fails
 */
export declare class FallbackStrategy {
    private tier3TemplateGenerator?;
    private tier4Cache?;
    constructor();
    /**
     * Execute with fallback chain
     */
    execute(options: {
        promptId: string;
        input: Record<string, any>;
        context?: Record<string, any>;
        originalError: Error;
        config?: FallbackConfig;
    }): Promise<FallbackResult>;
    /**
     * Tier 1: Alternate prompt with stricter parameters
     */
    private executeTier1;
    /**
     * Tier 2: Different model (faster/cheaper alternative)
     */
    private executeTier2;
    /**
     * Tier 3: Template-based generation (no LLM)
     */
    private executeTier3;
    /**
     * Tier 4: Return cached result
     */
    private executeTier4;
    /**
     * Cache successful result for future fallback
     */
    cacheResult(promptId: string, input: any, result: any): void;
    /**
     * Generate basic template-based output
     */
    private generateBasicTemplate;
    /**
     * Get default fallback config for a prompt
     */
    private getDefaultFallbackConfig;
    /**
     * Generate cache key from prompt and input
     */
    private getCacheKey;
    /**
     * Simple hash function for cache keys
     */
    private hash;
    /**
     * Set custom template generator
     */
    setTemplateGenerator(fn: (input: any, template: string) => any): void;
    /**
     * Clear cache
     */
    clearCache(): void;
    /**
     * Get cache size
     */
    getCacheSize(): number;
}
/**
 * Fallback result handler - Formats fallback results
 */
export declare class FallbackResultHandler {
    /**
     * Format fallback result for logging
     */
    static formatResult(result: FallbackResult): string;
    /**
     * Get quality assessment of fallback output
     */
    static assessQuality(tier: FallbackTier, _result: any): 'high' | 'medium' | 'low';
    /**
     * Suggest user action based on fallback result
     */
    static suggestAction(result: FallbackResult): string;
}
//# sourceMappingURL=fallback-strategy.d.ts.map