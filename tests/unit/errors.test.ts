import { describe, it, expect } from 'vitest';
import { CLIUsageError, SpecValidationError, GenerationError, ConfigError } from '../src/errors';

describe('Error Classes', () => {
  describe('CLIUsageError', () => {
    it('should create a CLI usage error', () => {
      const error = new CLIUsageError('Missing required argument: --input');

      expect(error.message).toBe('Missing required argument: --input');
      expect(error.code).toBe('CLI_USAGE_ERROR');
      expect(error.exitCode).toBe(2);
    });

    it('should include metadata', () => {
      const error = new CLIUsageError('Invalid argument', { argumentName: 'input' });

      expect(error.metadata).toEqual({ argumentName: 'input' });
    });
  });

  describe('SpecValidationError', () => {
    it('should create a spec validation error', () => {
      const errors = [
        { code: 'INVALID_TYPE', message: 'Invalid type definition' },
      ];
      const error = new SpecValidationError('Validation failed', errors);

      expect(error.message).toBe('Validation failed');
      expect(error.errors).toEqual(errors);
      expect(error.exitCode).toBe(3);
    });

    it('should include suggestions in user message', () => {
      const errors = [
        {
          code: 'MISSING_FIELD',
          message: 'Missing required field',
          suggestion: 'Add the field to your schema',
        },
      ];
      const error = new SpecValidationError('Validation failed', errors);
      const userMessage = error.getUserMessage();

      expect(userMessage).toContain('Suggestion: Add the field to your schema');
    });
  });

  describe('GenerationError', () => {
    it('should create a generation error', () => {
      const error = new GenerationError('Failed to generate', 'type-generation');

      expect(error.message).toBe('Failed to generate');
      expect(error.phase).toBe('type-generation');
      expect(error.exitCode).toBe(4);
    });

    it('should include phase in user message', () => {
      const error = new GenerationError('Failed', 'validation');
      const userMessage = error.getUserMessage();

      expect(userMessage).toContain('validation');
    });
  });

  describe('ConfigError', () => {
    it('should create a config error', () => {
      const error = new ConfigError('Invalid configuration');

      expect(error.message).toBe('Invalid configuration');
      expect(error.code).toBe('CONFIG_ERROR');
      expect(error.exitCode).toBe(1);
    });
  });
});
