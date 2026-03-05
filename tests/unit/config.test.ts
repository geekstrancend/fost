import { describe, it, expect } from 'vitest';
import { FostConfig, ConfigLoader, validateConfig } from '../../dist/src/config';

describe('ConfigLoader', () => {
  it('should return default config when no config file exists', async () => {
    const config = await ConfigLoader.load('/nonexistent/path');

    expect(config).toBeDefined();
    expect(config.outputDir).toBe('./sdk');
    expect(config.target).toBe('web2');
    expect(config.strict).toBe(false);
  });
});

describe('validateConfig', () => {
  it('should validate correct config', () => {
    const config: FostConfig = {
      outputDir: './sdk',
      target: 'web2',
      strict: false,
    };

    const result = validateConfig(config);

    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should reject invalid target', () => {
    const config: FostConfig = {
      target: 'invalid' as any,
    };

    const result = validateConfig(config);

    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('Invalid target'))).toBe(true);
  });

  it('should reject non-boolean strict value', () => {
    const config: FostConfig = {
      strict: 'yes' as any,
    };

    const result = validateConfig(config);

    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('strict must be a boolean'))).toBe(true);
  });

  it('should reject invalid log level', () => {
    const config: FostConfig = {
      logLevel: 'verbose' as any,
    };

    const result = validateConfig(config);

    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('Invalid logLevel'))).toBe(true);
  });

  it('should accept valid config with all fields', () => {
    const config: FostConfig = {
      outputDir: './generated',
      target: 'web3',
      strict: true,
      language: 'typescript',
      includeTests: false,
      includeDocs: true,
      logLevel: 'debug',
      noColor: true,
    };

    const result = validateConfig(config);

    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });
});
