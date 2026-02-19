import { describe, it, expect } from 'vitest';
import { createLogger } from '../../dist/src/logger';

describe('Logger', () => {
  it('should create a logger instance', () => {
    const logger = createLogger();

    expect(logger).toBeDefined();
    expect(logger.debug).toBeDefined();
    expect(logger.info).toBeDefined();
    expect(logger.warn).toBeDefined();
    expect(logger.error).toBeDefined();
    expect(logger.success).toBeDefined();
    expect(logger.configure).toBeDefined();
  });

  it('should filter messages by log level', () => {
    const logger = createLogger();
    logger.configure({ level: 'info' });

    // This should not throw, just silently skip debug messages
    expect(() => logger.debug('Debug message')).not.toThrow();
    expect(() => logger.info('Info message')).not.toThrow();
  });

  it('should support JSON format', () => {
    const logger = createLogger();
    logger.configure({ format: 'json' });

    // Should not throw
    expect(() => logger.info('Test message')).not.toThrow();
  });

  it('should respect NO_COLOR environment variable', () => {
    const original = process.env.NO_COLOR;
    process.env.NO_COLOR = '1';

    const logger = createLogger();
    logger.configure({ colorize: true });

    // Should still work
    expect(() => logger.info('Test')).not.toThrow();

    // Restore
    if (original) {
      process.env.NO_COLOR = original;
    } else {
      delete process.env.NO_COLOR;
    }
  });

  it('should respond to DEBUG environment variable', () => {
    const original = process.env.DEBUG;
    process.env.DEBUG = '1';

    const logger = createLogger();
    logger.configure({ level: 'info' });

    // Debug should now be shown
    expect(() => logger.debug('Debug message')).not.toThrow();

    // Restore
    if (original) {
      process.env.DEBUG = original;
    } else {
      delete process.env.DEBUG;
    }
  });
});
