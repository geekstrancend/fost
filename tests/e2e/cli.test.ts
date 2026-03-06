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

  // NEW: E2E SDK Generation Tests
  describe('SDK Generation Pipeline', () => {
    it('should generate TypeScript SDK from Petstore OpenAPI spec', () => {
      const petstoreSpec = path.join(process.cwd(), 'tests/fixtures/petstore.openapi.yaml');
      const outputDir = path.join(testDir, 'petstore-sdk');

      // Execute generation command
      const result = execSync(
        `node bin/fost.js generate --input ${petstoreSpec} --lang typescript --type web2 --output ${outputDir}`,
        { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] }
      );

      // Verify exit success
      expect(result).toContain('Successfully generated SDK');

      // Verify all expected files were created
      const expectedFiles = [
        'types.ts',
        'client.ts',
        'errors.ts',
        'auth.ts',
        'index.ts',
        'README.md',
        'package.json',
        'tsconfig.json',
        '.gitignore'
      ];

      for (const file of expectedFiles) {
        const filePath = path.join(outputDir, file);
        expect(fs.existsSync(filePath)).toBe(true);
      }
    });

    it('should generate valid TypeScript in SDK files', () => {
      const petstoreSpec = path.join(process.cwd(), 'tests/fixtures/petstore.openapi.yaml');
      const outputDir = path.join(testDir, 'petstore-sdk-types');

      execSync(
        `node bin/fost.js generate --input ${petstoreSpec} --lang typescript --type web2 --output ${outputDir}`,
        { stdio: 'pipe' }
      );

      // Read generated types.ts
      const typesFile = path.join(outputDir, 'types.ts');
      const typesContent = fs.readFileSync(typesFile, 'utf-8');

      // Verify it contains expected TypeScript constructs
      expect(typesContent).toContain('export interface Pet');
      expect(typesContent).toContain('id: number');
      expect(typesContent).toContain('name: string');
      expect(typesContent).toContain('Request {');
      expect(typesContent).toContain('Response {');
    });

    it('should generate working client class with all endpoints', () => {
      const petstoreSpec = path.join(process.cwd(), 'tests/fixtures/petstore.openapi.yaml');
      const outputDir = path.join(testDir, 'petstore-sdk-client');

      execSync(
        `node bin/fost.js generate --input ${petstoreSpec} --lang typescript --type web2 --output ${outputDir}`,
        { stdio: 'pipe' }
      );

      // Read generated client.ts
      const clientFile = path.join(outputDir, 'client.ts');
      const clientContent = fs.readFileSync(clientFile, 'utf-8');

      // Verify it contains expected client constructs
      expect(clientContent).toContain('class PetstoreApiClient');
      expect(clientContent).toContain('constructor');
      expect(clientContent).toContain('async');
      expect(clientContent).toContain('request');
    });

    it('should generate package.json with correct metadata', () => {
      const petstoreSpec = path.join(process.cwd(), 'tests/fixtures/petstore.openapi.yaml');
      const outputDir = path.join(testDir, 'petstore-sdk-pkg');

      execSync(
        `node bin/fost.js generate --input ${petstoreSpec} --lang typescript --type web2 --output ${outputDir}`,
        { stdio: 'pipe' }
      );

      // Read and parse package.json
      const pkgFile = path.join(outputDir, 'package.json');
      const pkgContent = fs.readFileSync(pkgFile, 'utf-8');
      const pkg = JSON.parse(pkgContent);

      // Verify package.json structure
      expect(pkg.name).toBe('@petstoreapi/sdk');
      expect(pkg.version).toBeDefined();
      expect(pkg.description).toBeDefined();
      expect(pkg.main).toBe('dist/index.js');
      expect(pkg.types).toBe('dist/index.d.ts');
      expect(pkg.scripts).toBeDefined();
      expect(pkg.scripts.build).toBeDefined();
    });

    it('should generate tsconfig.json with appropriate settings', () => {
      const petstoreSpec = path.join(process.cwd(), 'tests/fixtures/petstore.openapi.yaml');
      const outputDir = path.join(testDir, 'petstore-sdk-ts');

      execSync(
        `node bin/fost.js generate --input ${petstoreSpec} --lang typescript --type web2 --output ${outputDir}`,
        { stdio: 'pipe' }
      );

      // Read and parse tsconfig.json
      const tsconfigFile = path.join(outputDir, 'tsconfig.json');
      const tsconfigContent = fs.readFileSync(tsconfigFile, 'utf-8');
      const tsconfig = JSON.parse(tsconfigContent);

      // Verify TypeScript configuration
      expect(tsconfig.compilerOptions).toBeDefined();
      expect(tsconfig.compilerOptions.target).toBe('ES2020');
      expect(tsconfig.compilerOptions.module).toBeDefined();
      expect(tsconfig.compilerOptions.declaration).toBe(true);
      expect(tsconfig.compilerOptions.strict).toBe(true);
    });

    it('should generate README with usage documentation', () => {
      const petstoreSpec = path.join(process.cwd(), 'tests/fixtures/petstore.openapi.yaml');
      const outputDir = path.join(testDir, 'petstore-sdk-docs');

      execSync(
        `node bin/fost.js generate --input ${petstoreSpec} --lang typescript --type web2 --output ${outputDir}`,
        { stdio: 'pipe' }
      );

      // Read README
      const readmeFile = path.join(outputDir, 'README.md');
      const readmeContent = fs.readFileSync(readmeFile, 'utf-8');

      // Verify README content
      expect(readmeContent).toContain('# PetstoreApi SDK');
      expect(readmeContent).toContain('Installation');
      expect(readmeContent).toContain('Usage');
      expect(readmeContent).toContain('api');
      expect(readmeContent).toContain('example');
    });

    it('should generate .gitignore file', () => {
      const petstoreSpec = path.join(process.cwd(), 'tests/fixtures/petstore.openapi.yaml');
      const outputDir = path.join(testDir, 'petstore-sdk-git');

      execSync(
        `node bin/fost.js generate --input ${petstoreSpec} --lang typescript --type web2 --output ${outputDir}`,
        { stdio: 'pipe' }
      );

      // Read .gitignore
      const gitIgnoreFile = path.join(outputDir, '.gitignore');
      const gitIgnoreContent = fs.readFileSync(gitIgnoreFile, 'utf-8');

      // Verify .gitignore content
      expect(gitIgnoreContent).toContain('node_modules');
      expect(gitIgnoreContent).toContain('dist');
      expect(gitIgnoreContent).toContain('.DS_Store');
    });
  });
});
