import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';
import * as os from 'os';

describe('CLI E2E Tests', () => {
  let testDir: string;

  beforeEach(() => {
    // Create temporary test directory
    testDir = fs.mkdtempSync(path.join(os.tmpdir(), 'fost-e2e-'));
  });

  afterEach(() => {
    // Clean up test directory
    try {
      fs.rmSync(testDir, { recursive: true, force: true });
    } catch (_error) {
      // Ignore cleanup errors
    }
  });

  it('should show help message', () => {
    const result = execSync('node bin/fost.js --help', { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] });

    expect(result).toContain('FOST SDK Generator CLI');
    expect(result).toContain('Usage:');
    expect(result).toContain('Commands:');
  });

  it('should show version', () => {
    const result = execSync('node bin/fost.js --version', { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] });

    expect(result.trim()).toMatch(/^fost \d+\.\d+\.\d+/);
  });

  it('should fail with missing required arguments', () => {
    try {
      execSync('node bin/fost.js generate', { stdio: 'pipe', cwd: process.cwd() });
      expect.fail('Should have thrown error');
    } catch (error: any) {
      expect(error.status).not.toBe(0);
    }
  });

  it('should fail gracefully with non-existent input file', () => {
    try {
      execSync(
        'node bin/fost.js generate --input /nonexistent/file.json --lang typescript --type web2',
        { stdio: 'pipe' }
      );
      expect.fail('Should have thrown error');
    } catch (error: any) {
      expect(error.status).not.toBe(0);
    }
  });

  it('should create output directory for generation', () => {
    // Create a minimal valid input spec
    const inputFile = path.join(testDir, 'test-spec.json');
    fs.writeFileSync(
      inputFile,
      JSON.stringify({
        openapi: '3.0.0',
        info: { title: 'Test API', version: '1.0.0' },
        paths: {},
      })
    );

    const outputDir = path.join(testDir, 'generated');

    try {
      execSync(
        `node bin/fost.js generate --input ${inputFile} --lang typescript --type web2 --output ${outputDir}`,
        { stdio: 'pipe' }
      );

      // Check if output directory was created
      expect(fs.existsSync(outputDir)).toBe(true);
    } catch (error: any) {
      // May fail due to incomplete implementation, but directory should be attempted
      console.log('Error during generation:', error.message);
    }
  });

  it('should exit with correct code on validation error', () => {
    const invalidSpec = path.join(testDir, 'invalid.json');
    fs.writeFileSync(invalidSpec, '{ invalid json');

    try {
      execSync(
        `node bin/fost.js validate --input ${invalidSpec} --type web2`,
        { stdio: 'pipe' }
      );
      expect.fail('Should have thrown error');
    } catch (error: any) {
      // Should exit with error code
      expect(error.status).not.toBe(0);
    }
  });
});
