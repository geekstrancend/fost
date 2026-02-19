export interface LLMMetrics {
    successRate: number;
    hallucintionRate: number;
    validationFailureRate: number;
    fallbackRate: number;
    averageLatencyMs: number;
    p95LatencyMs: number;
    p99LatencyMs: number;
    maxLatencyMs: number;
    costPerCall: number;
    totalTokensUsed: number;
    totalCostUsed: number;
    successRateTrend: 'improving' | 'stable' | 'degrading';
    latencyTrend: 'improving' | 'stable' | 'degrading';
    costTrend: 'improving' | 'stable' | 'degrading';
    alerts: {
        successRateDropped: boolean;
        hallucintionRateIncreased: boolean;
        latencyIncreased: boolean;
        costIncreased: boolean;
        circuitBreakerOpen: boolean;
    };
}
export interface LLMMetricsSnapshot {
    timestamp: Date;
    promptId: string;
    success: boolean;
    latencyMs: number;
    tokensUsed: number;
    costUsed: number;
    fallbackUsed: boolean;
    hallucinations: number;
    validationFailed: boolean;
}
/**
 * LLM Monitoring - Tracks metrics and health
 */
export declare class LLMMonitor {
    private snapshots;
    private metricsWindow;
    private enabled;
    private thresholds;
    constructor(enabled?: boolean);
    /**
     * Record successful call
     */
    recordSuccess(event: {
        promptId: string;
        duration: number;
        tokens: number;
        cost: number;
    }): void;
    /**
     * Record fallback usage
     */
    recordFallback(event: {
        promptId: string;
        reason: string;
        fallbackTier: string;
    }): void;
    /**
     * Record failure
     */
    recordFailure(event: {
        promptId: string;
        error: string;
        duration: number;
    }): void;
    /**
     * Record hallucinations detected
     */
    recordHallucinations(event: {
        promptId: string;
        count: number;
    }): void;
    /**
     * Record validation failure
     */
    recordValidationFailure(_promptId: string): void;
    /**
     * Get current metrics
     */
    getMetrics(promptId?: string): LLMMetrics;
    /**
     * Check health
     */
    checkHealth(): {
        healthy: boolean;
        issues: string[];
    };
    /**
     * Get per-prompt metrics
     */
    getMetricsPerPrompt(): Map<string, LLMMetrics>;
    /**
     * Export metrics as JSON
     */
    export(): {
        snapshots: LLMMetricsSnapshot[];
        metrics: LLMMetrics;
    };
    /**
     * Clear all metrics
     */
    clear(): void;
    /**
     * Get snapshot count
     */
    getSnapshotCount(): number;
    private getEmptyMetrics;
    private calculateTrend;
    private trimSnapshots;
}
/**
 * Metrics formatter - Pretty-print metrics
 */
export declare class MetricsFormatter {
    static formatMetrics(metrics: LLMMetrics): string;
    static formatHealth(health: {
        healthy: boolean;
        issues: string[];
    }): string;
}
//# sourceMappingURL=monitoring.d.ts.map