// Monitoring and Metrics - Track LLM performance and health

export interface LLMMetrics {
  // Success rates
  successRate: number;           // 0-1, percentage of successful calls
  hallucintionRate: number;      // per 1000 calls
  validationFailureRate: number; // 0-1
  fallbackRate: number;          // 0-1, percentage using fallback

  // Performance
  averageLatencyMs: number;
  p95LatencyMs: number;
  p99LatencyMs: number;
  maxLatencyMs: number;

  // Cost
  costPerCall: number;
  totalTokensUsed: number;
  totalCostUsed: number;

  // Trends
  successRateTrend: 'improving' | 'stable' | 'degrading';
  latencyTrend: 'improving' | 'stable' | 'degrading';
  costTrend: 'improving' | 'stable' | 'degrading';

  // Alerts
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
export class LLMMonitor {
  private snapshots: LLMMetricsSnapshot[] = [];
  private metricsWindow = 1000; // Keep last 1000 metrics
  private enabled: boolean;

  // Thresholds for alerts
  private thresholds = {
    minSuccessRate: 0.9,       // 90%
    maxHallucintionRate: 0.02, // 2 per 100 calls
    maxLatencyMs: 10000,       // 10 seconds
    costIncreasePercent: 0.2,  // 20%
  };

  constructor(enabled = true) {
    this.enabled = enabled;
  }

  /**
   * Record successful call
   */
  recordSuccess(event: {
    promptId: string;
    duration: number;
    tokens: number;
    cost: number;
  }): void {
    if (!this.enabled) return;

    this.snapshots.push({
      timestamp: new Date(),
      promptId: event.promptId,
      success: true,
      latencyMs: event.duration,
      tokensUsed: event.tokens,
      costUsed: event.cost,
      fallbackUsed: false,
      hallucinations: 0,
      validationFailed: false,
    });

    this.trimSnapshots();
  }

  /**
   * Record fallback usage
   */
  recordFallback(event: {
    promptId: string;
    reason: string;
    fallbackTier: string;
  }): void {
    if (!this.enabled) return;

    console.warn(`Fallback activated for ${event.promptId}: ${event.reason} (Tier: ${event.fallbackTier})`);

    this.snapshots.push({
      timestamp: new Date(),
      promptId: event.promptId,
      success: true,
      latencyMs: 0,
      tokensUsed: 0,
      costUsed: 0,
      fallbackUsed: true,
      hallucinations: 0,
      validationFailed: false,
    });

    this.trimSnapshots();
  }

  /**
   * Record failure
   */
  recordFailure(event: {
    promptId: string;
    error: string;
    duration: number;
  }): void {
    if (!this.enabled) return;

    this.snapshots.push({
      timestamp: new Date(),
      promptId: event.promptId,
      success: false,
      latencyMs: event.duration,
      tokensUsed: 0,
      costUsed: 0,
      fallbackUsed: false,
      hallucinations: 0,
      validationFailed: false,
    });

    this.trimSnapshots();
  }

  /**
   * Record hallucinations detected
   */
  recordHallucinations(event: {
    promptId: string;
    count: number;
  }): void {
    if (!this.enabled) return;

    const latest = this.snapshots[this.snapshots.length - 1];
    if (latest) {
      latest.hallucinations = event.count;
    }
  }

  /**
   * Record validation failure
   */
  recordValidationFailure(_promptId: string): void {
    if (!this.enabled) return;

    const latest = this.snapshots[this.snapshots.length - 1];
    if (latest) {
      latest.validationFailed = true;
    }
  }

  /**
   * Get current metrics
   */
  getMetrics(promptId?: string): LLMMetrics {
    const filtered = promptId
      ? this.snapshots.filter(s => s.promptId === promptId)
      : this.snapshots;

    if (filtered.length === 0) {
      return this.getEmptyMetrics();
    }

    // Calculate success rate
    const successful = filtered.filter(s => s.success).length;
    const successRate = successful / filtered.length;

    // Calculate hallucination rate
    const hallucinations = filtered.reduce((sum, s) => sum + s.hallucinations, 0);
    const hallucintionRate = (hallucinations / filtered.length) * 1000; // Per 1000

    // Calculate validation failure rate
    const validationFailures = filtered.filter(s => s.validationFailed).length;
    const validationFailureRate = validationFailures / filtered.length;

    // Calculate fallback rate
    const fallbacks = filtered.filter(s => s.fallbackUsed).length;
    const fallbackRate = fallbacks / filtered.length;

    // Calculate latencies
    const latencies = filtered.map(s => s.latencyMs);
    const avgLatency = latencies.reduce((a, b) => a + b, 0) / latencies.length;
    const sortedLatencies = [...latencies].sort((a, b) => a - b);
    const p95Index = Math.floor(sortedLatencies.length * 0.95);
    const p99Index = Math.floor(sortedLatencies.length * 0.99);

    // Calculate costs
    const totalCost = filtered.reduce((sum, s) => sum + s.costUsed, 0);
    const avgCost = totalCost / filtered.length;
    const totalTokens = filtered.reduce((sum, s) => sum + s.tokensUsed, 0);

    // Determine trends (comparing last 100 vs previous 100)
    const successRateTrend = this.calculateTrend(
      filtered.slice(-100),
      filtered.slice(-200, -100),
      s => (s.success ? 1 : 0)
    );

    const latencyTrend = this.calculateTrend(
      filtered.slice(-100),
      filtered.slice(-200, -100),
      s => s.latencyMs
    );

    const costTrend = this.calculateTrend(
      filtered.slice(-100),
      filtered.slice(-200, -100),
      s => s.costUsed,
      'minimize' // Lower is better for cost
    );

    // Check alerts
    const alerts = {
      successRateDropped: successRate < this.thresholds.minSuccessRate,
      hallucintionRateIncreased: hallucintionRate > this.thresholds.maxHallucintionRate,
      latencyIncreased: avgLatency > this.thresholds.maxLatencyMs,
      costIncreased: costTrend === 'degrading', // For cost, degrading = increasing
      circuitBreakerOpen: false, // Set by CircuitBreaker
    };

    return {
      successRate,
      hallucintionRate,
      validationFailureRate,
      fallbackRate,
      averageLatencyMs: Math.round(avgLatency),
      p95LatencyMs: sortedLatencies[p95Index] || 0,
      p99LatencyMs: sortedLatencies[p99Index] || 0,
      maxLatencyMs: Math.max(...latencies),
      costPerCall: avgCost,
      totalTokensUsed: totalTokens,
      totalCostUsed: totalCost,
      successRateTrend,
      latencyTrend,
      costTrend,
      alerts,
    };
  }

  /**
   * Check health
   */
  checkHealth(): { healthy: boolean; issues: string[] } {
    const metrics = this.getMetrics();
    const issues: string[] = [];

    if (metrics.alerts.successRateDropped) {
      issues.push(`Success rate dropped to ${(metrics.successRate * 100).toFixed(1)}%`);
    }

    if (metrics.alerts.hallucintionRateIncreased) {
      issues.push(
        `Hallucination rate increased to ${metrics.hallucintionRate.toFixed(2)} per 1000 calls`
      );
    }

    if (metrics.alerts.latencyIncreased) {
      issues.push(`Average latency increased to ${metrics.averageLatencyMs}ms`);
    }

    if (metrics.alerts.costIncreased) {
      issues.push('Cost per call increasing');
    }

    return {
      healthy: issues.length === 0,
      issues,
    };
  }

  /**
   * Get per-prompt metrics
   */
  getMetricsPerPrompt(): Map<string, LLMMetrics> {
    const promptIds = new Set(this.snapshots.map(s => s.promptId));
    const metrics = new Map<string, LLMMetrics>();

    for (const promptId of promptIds) {
      metrics.set(promptId, this.getMetrics(promptId));
    }

    return metrics;
  }

  /**
   * Export metrics as JSON
   */
  export(): { snapshots: LLMMetricsSnapshot[]; metrics: LLMMetrics } {
    return {
      snapshots: this.snapshots,
      metrics: this.getMetrics(),
    };
  }

  /**
   * Clear all metrics
   */
  clear(): void {
    this.snapshots = [];
  }

  /**
   * Get snapshot count
   */
  getSnapshotCount(): number {
    return this.snapshots.length;
  }

  private getEmptyMetrics(): LLMMetrics {
    return {
      successRate: 0,
      hallucintionRate: 0,
      validationFailureRate: 0,
      fallbackRate: 0,
      averageLatencyMs: 0,
      p95LatencyMs: 0,
      p99LatencyMs: 0,
      maxLatencyMs: 0,
      costPerCall: 0,
      totalTokensUsed: 0,
      totalCostUsed: 0,
      successRateTrend: 'stable',
      latencyTrend: 'stable',
      costTrend: 'stable',
      alerts: {
        successRateDropped: false,
        hallucintionRateIncreased: false,
        latencyIncreased: false,
        costIncreased: false,
        circuitBreakerOpen: false,
      },
    };
  }

  private calculateTrend(
    recent: LLMMetricsSnapshot[],
    previous: LLMMetricsSnapshot[],
    fn: (s: LLMMetricsSnapshot) => number,
    direction: 'maximize' | 'minimize' = 'maximize'
  ): 'improving' | 'stable' | 'degrading' {
    if (recent.length === 0 || previous.length === 0) {
      return 'stable';
    }

    const recentAvg = recent.reduce((sum, s) => sum + fn(s), 0) / recent.length;
    const previousAvg = previous.reduce((sum, s) => sum + fn(s), 0) / previous.length;

    const changePercent = (recentAvg - previousAvg) / previousAvg;

    if (Math.abs(changePercent) < 0.05) {
      return 'stable'; // Less than 5% change
    }

    // For maximize metrics: positive change is improving
    // For minimize metrics: negative change is improving
    const isImproving = direction === 'maximize' ? changePercent > 0 : changePercent < 0;

    return isImproving ? 'improving' : 'degrading';
  }

  private trimSnapshots(): void {
    if (this.snapshots.length > this.metricsWindow) {
      this.snapshots = this.snapshots.slice(-this.metricsWindow);
    }
  }
}

/**
 * Metrics formatter - Pretty-print metrics
 */
export class MetricsFormatter {
  static formatMetrics(metrics: LLMMetrics): string {
    const lines = [
      'LLM Metrics Report',
      '==================',
      '',
      'Success Metrics:',
      `  Success Rate:          ${(metrics.successRate * 100).toFixed(1)}%`,
      `  Hallucination Rate:    ${metrics.hallucintionRate.toFixed(2)} per 1000`,
      `  Validation Failures:   ${(metrics.validationFailureRate * 100).toFixed(1)}%`,
      `  Fallback Usage:        ${(metrics.fallbackRate * 100).toFixed(1)}%`,
      '',
      'Performance Metrics:',
      `  Average Latency:       ${metrics.averageLatencyMs}ms`,
      `  P95 Latency:           ${metrics.p95LatencyMs}ms`,
      `  P99 Latency:           ${metrics.p99LatencyMs}ms`,
      `  Max Latency:           ${metrics.maxLatencyMs}ms`,
      '',
      'Cost Metrics:',
      `  Cost per Call:         $${metrics.costPerCall.toFixed(4)}`,
      `  Total Tokens Used:     ${metrics.totalTokensUsed}`,
      `  Total Cost:            $${metrics.totalCostUsed.toFixed(2)}`,
      '',
      'Trends:',
      `  Success Rate:          ${metrics.successRateTrend}`,
      `  Latency:               ${metrics.latencyTrend}`,
      `  Cost:                  ${metrics.costTrend}`,
      '',
      'Alerts:',
      ...(metrics.alerts.successRateDropped ? ['  [!] Success rate dropped'] : []),
      ...(metrics.alerts.hallucintionRateIncreased ? ['  [!] Hallucination rate increased'] : []),
      ...(metrics.alerts.latencyIncreased ? ['  [!] Latency increased'] : []),
      ...(metrics.alerts.costIncreased ? ['  [!] Cost increasing'] : []),
      ...(metrics.alerts.circuitBreakerOpen ? ['  [!] Circuit breaker OPEN'] : []),
      ...(Object.values(metrics.alerts).every(a => !a) ? ['  All systems normal'] : []),
    ];

    return lines.join('\n');
  }

  static formatHealth(health: { healthy: boolean; issues: string[] }): string {
    const status = health.healthy ? 'HEALTHY' : 'ISSUES DETECTED';
    const lines = [
      `Status: ${status}`,
      ...health.issues.map(issue => `  - ${issue}`),
    ];

    return lines.join('\n');
  }
}
