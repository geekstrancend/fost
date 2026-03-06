// Determinism Controls - Reproducibility and consistency

export interface DeterminismConfig {
  // Temperature: 0 = deterministic, 1 = creative
  temperature: number;

  // Top-p: Nucleus sampling for diversity control
  topP?: number;

  // Seed: For reproducible outputs (if model supports)
  seed?: number;

  // Model version: Pin to specific model release
  model: string;

  // Timeout: Maximum time to wait for response
  timeoutMs?: number;
}

/**
 * Predefined determinism configurations for common use cases
 */
export const DETERMINISM_PRESETS = {
  // Highly deterministic for code generation
  CODE_GENERATION: {
    temperature: 0.1,
    topP: 0.95,
    seed: 42,
    model: 'gpt-4-turbo-2024-04-09',
    timeoutMs: 30000,
  } as DeterminismConfig,

  // Deterministic but slightly more flexible
  TYPE_GENERATION: {
    temperature: 0.15,
    topP: 0.95,
    seed: 42,
    model: 'gpt-4-turbo-2024-04-09',
    timeoutMs: 30000,
  } as DeterminismConfig,

  // Deterministic for documentation
  DOCUMENTATION: {
    temperature: 0.3,
    topP: 0.95,
    seed: 42,
    model: 'gpt-4-turbo-2024-04-09',
    timeoutMs: 30000,
  } as DeterminismConfig,

  // Slightly creative for examples
  EXAMPLE_GENERATION: {
    temperature: 0.5,
    topP: 0.9,
    model: 'gpt-4-turbo-2024-04-09',
    timeoutMs: 30000,
  } as DeterminismConfig,

  // Creative for brainstorming
  CREATIVE: {
    temperature: 0.8,
    topP: 0.9,
    model: 'gpt-4-turbo-2024-04-09',
    timeoutMs: 30000,
  } as DeterminismConfig,
};

/**
 * Determinism Manager - Controls reproducibility
 */
export class DeterminismManager {
  /**
   * Validate determinism config
   */
  static validate(config: DeterminismConfig): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (config.temperature < 0 || config.temperature > 1) {
      errors.push('Temperature must be between 0 and 1');
    }

    if (config.topP && (config.topP < 0 || config.topP > 1)) {
      errors.push('topP must be between 0 and 1');
    }

    if (!config.model || config.model.trim().length === 0) {
      errors.push('Model must be specified');
    }

    if (config.timeoutMs && config.timeoutMs < 1000) {
      errors.push('Timeout must be at least 1000ms');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Get config recommendations based on use case
   */
  static getRecommendation(
    useCase: 'code' | 'docs' | 'tests' | 'examples' | 'creative'
  ): DeterminismConfig {
    switch (useCase) {
      case 'code':
        return DETERMINISM_PRESETS.CODE_GENERATION;
      case 'docs':
        return DETERMINISM_PRESETS.DOCUMENTATION;
      case 'tests':
        return DETERMINISM_PRESETS.TYPE_GENERATION;
      case 'examples':
        return DETERMINISM_PRESETS.EXAMPLE_GENERATION;
      case 'creative':
        return DETERMINISM_PRESETS.CREATIVE;
      default:
        return DETERMINISM_PRESETS.CODE_GENERATION;
    }
  }

  /**
   * Make config more deterministic
   */
  static makeMoreDeterministic(config: DeterminismConfig): DeterminismConfig {
    return {
      ...config,
      temperature: Math.max(0, config.temperature - 0.1),
      topP: config.topP ? Math.min(1, config.topP + 0.05) : 0.95,
    };
  }

  /**
   * Make config more creative
   */
  static makeMoreCreative(config: DeterminismConfig): DeterminismConfig {
    return {
      ...config,
      temperature: Math.min(1, config.temperature + 0.1),
      topP: config.topP ? Math.max(0.5, config.topP - 0.05) : 0.85,
    };
  }

  /**
   * Calculate reproducibility score (0-1)
   * Higher temperature = lower reproducibility
   */
  static getReproducibilityScore(config: DeterminismConfig): number {
    // Temperature is the main factor affecting reproducibility
    // 0.0 = 1.0 reproducibility
    // 1.0 = 0.0 reproducibility
    const tempScore = 1 - config.temperature;

    // Seed also affects reproducibility
    const seedScore = config.seed ? 0.1 : 0;

    return Math.min(1, tempScore + seedScore);
  }
}

/**
 * Reproducibility Tester - Validates determinism
 */
export interface ReproducibilityTest {
  promptId: string;
  input: any;
  expectedOutput?: string;
  tolerance: number;    // 0-1, how exact must match be
  runs: number;         // How many times to run
  config: DeterminismConfig;
}

export interface ReproducibilityTestResult {
  passed: boolean;
  reproducibilityPercent: number;
  runs: number;
  matches: number;
  errors: string[];
  averageLatencyMs: number;
  totalCostUsd: number;
}

export class ReproducibilityTester {
  private executedTests: ReproducibilityTest[] = [];

  /**
   * Create a reproducibility test
   */
  createTest(options: {
    promptId: string;
    input: any;
    expectedOutput?: string;
    tolerance?: number;
    runs?: number;
    config?: DeterminismConfig;
  }): ReproducibilityTest {
    return {
      promptId: options.promptId,
      input: options.input,
      expectedOutput: options.expectedOutput,
      tolerance: options.tolerance ?? 0.95,
      runs: options.runs ?? 5,
      config: options.config ?? DETERMINISM_PRESETS.CODE_GENERATION,
    };
  }

  /**
   * Run reproducibility test (would be called by integration)
   */
  async runTest(test: ReproducibilityTest): Promise<ReproducibilityTestResult> {
    const outputs: string[] = [];
    const latencies: number[] = [];
    const costs: number[] = [];
    const errors: string[] = [];

    // Validate config
    const validation = DeterminismManager.validate(test.config);
    if (!validation.valid) {
      return {
        passed: false,
        reproducibilityPercent: 0,
        runs: 0,
        matches: 0,
        errors: validation.errors,
        averageLatencyMs: 0,
        totalCostUsd: 0,
      };
    }

    // Run test multiple times (would call LLM in real implementation)
    for (let i = 0; i < test.runs; i++) {
      try {
        // This is where actual LLM call would happen
        // For now, simulate consistent behavior
        const output = await this.simulateLLMCall(test.input);
        outputs.push(output);

        // Simulate latency and cost
        latencies.push(Math.random() * 3000 + 500);
        costs.push(Math.random() * 0.01 + 0.005);
      } catch (error) {
        errors.push(`Run ${i + 1}: ${error}`);
      }
    }

    // Analyze reproducibility
    let matches: number;
    if (test.expectedOutput) {
      // Compare against expected output
      matches = outputs.filter(o => this.similarity(o, test.expectedOutput!) > test.tolerance)
        .length;
    } else {
      // Compare outputs against each other
      const firstOutput = outputs[0];
      matches = outputs.filter(o => this.similarity(o, firstOutput) > test.tolerance).length;
    }

    const reproducibilityPercent = (matches / outputs.length) * 100;
    const passed = reproducibilityPercent >= 80; // 80% threshold

    const averageLatency = latencies.length > 0
      ? latencies.reduce((a, b) => a + b, 0) / latencies.length
      : 0;

    const totalCost = costs.reduce((a, b) => a + b, 0);

    return {
      passed,
      reproducibilityPercent,
      runs: outputs.length,
      matches,
      errors,
      averageLatencyMs: Math.round(averageLatency),
      totalCostUsd: totalCost,
    };
  }

  /**
   * Get all executed tests
   */
  getExecutedTests(): ReproducibilityTest[] {
    return this.executedTests;
  }

  /**
   * Simulate LLM call for testing (would be replaced by actual LLM)
   */
  private async simulateLLMCall(input: any): Promise<string> {
    // Simulate with consistent but slightly random output
    return JSON.stringify({ simulated: true, input });
  }

  /**
   * Calculate similarity between two strings
   */
  private similarity(a: string, b: string): number {
    // Simple similarity metric (would use more sophisticated comparison in real impl)
    if (a === b) return 1;

    const shorter = a.length < b.length ? a : b;
    const longer = a.length < b.length ? b : a;

    const editDistance = this.levenshteinDistance(shorter, longer);
    return 1 - editDistance / longer.length;
  }

  /**
   * Levenshtein distance for string comparison
   */
  private levenshteinDistance(s1: string, s2: string): number {
    const costs: number[] = [];
    for (let i = 0; i <= s1.length; i++) {
      let lastValue = i;
      for (let j = 0; j <= s2.length; j++) {
        if (i === 0) {
          costs[j] = j;
        } else if (j > 0) {
          let newValue = costs[j - 1];
          if (s1.charAt(i - 1) !== s2.charAt(j - 1)) {
            newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
          }
          costs[j - 1] = lastValue;
          lastValue = newValue;
        }
      }
      if (i > 0) costs[s2.length] = lastValue;
    }
    return costs[s2.length];
  }
}

/**
 * Model version manager - Track and pin models
 */
export class ModelVersionManager {
  private pinned: Map<string, string> = new Map();

  /**
   * Pin a model version for a use case
   */
  pin(useCase: string, modelVersion: string): void {
    this.pinned.set(useCase, modelVersion);
    console.log(`Pinned ${useCase} to ${modelVersion}`);
  }

  /**
   * Get pinned version
   */
  getPinned(useCase: string): string | undefined {
    return this.pinned.get(useCase);
  }

  /**
   * Unpin
   */
  unpin(useCase: string): void {
    this.pinned.delete(useCase);
  }

  /**
   * List all pinned versions
   */
  listPinned(): Record<string, string> {
    const result: Record<string, string> = {};
    for (const [key, value] of this.pinned.entries()) {
      result[key] = value;
    }
    return result;
  }

  /**
   * Check if version is up to date
   */
  isLatest(modelVersion: string, latestVersion: string): boolean {
    return modelVersion === latestVersion;
  }

  /**
   * Migrate to new version
   */
  migrate(useCase: string, newVersion: string): void {
    const old = this.pinned.get(useCase);
    this.pin(useCase, newVersion);
    console.log(`Migrated ${useCase}: ${old} -> ${newVersion}`);
  }
}
