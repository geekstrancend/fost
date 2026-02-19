"use strict";
// Prompt Registry - Manages all prompt versions with versioning and lifecycle
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.PromptRegistry = void 0;
exports.createDefaultPromptRegistry = createDefaultPromptRegistry;
const fs = __importStar(require("fs"));
class PromptRegistry {
    constructor(registryPath = './prompt-registry.json') {
        this.prompts = new Map();
        this.registryPath = registryPath;
        this.loadFromDisk();
    }
    /**
     * Register a new prompt or update existing
     */
    register(prompt) {
        if (!this.prompts.has(prompt.id)) {
            this.prompts.set(prompt.id, []);
        }
        const versions = this.prompts.get(prompt.id);
        // Check if version exists
        const existing = versions.find(v => v.version === prompt.version);
        if (existing) {
            const index = versions.indexOf(existing);
            versions[index] = prompt;
        }
        else {
            versions.push(prompt);
            // Sort by semver
            versions.sort((a, b) => this.compareSemver(a.version, b.version));
        }
        this.saveToDisk();
    }
    /**
     * Get specific prompt version or latest stable version
     */
    get(promptId, version) {
        const versions = this.prompts.get(promptId);
        if (!versions || versions.length === 0) {
            return null;
        }
        if (version) {
            // Get specific version
            return versions.find(v => v.version === version) || null;
        }
        // Get latest non-retired version
        const active = versions.filter(v => !v.retiredAt);
        if (active.length === 0) {
            return null;
        }
        return active[active.length - 1]; // Latest
    }
    /**
     * Get all versions of a prompt
     */
    getAll(promptId) {
        return this.prompts.get(promptId) || [];
    }
    /**
     * List all active prompt IDs
     */
    listActive() {
        const active = [];
        for (const [id, versions] of this.prompts.entries()) {
            const hasActive = versions.some(v => !v.retiredAt);
            if (hasActive) {
                active.push(id);
            }
        }
        return active;
    }
    /**
     * Mark a version as deprecated (add sunset date)
     */
    deprecate(promptId, version, sunsetDate) {
        const prompt = this.get(promptId, version);
        if (!prompt) {
            throw new Error(`Prompt not found: ${promptId}@${version}`);
        }
        prompt.retiredAt = sunsetDate;
        this.register(prompt);
        console.warn(`Prompt ${promptId}@${version} deprecated, will be retired on ${sunsetDate.toISOString()}`);
    }
    /**
     * Retire a prompt version (remove from registry)
     */
    retire(promptId, version) {
        const versions = this.prompts.get(promptId);
        if (!versions)
            return;
        const index = versions.findIndex(v => v.version === version);
        if (index >= 0) {
            versions.splice(index, 1);
            this.saveToDisk();
        }
    }
    /**
     * Get registry statistics
     */
    getStats() {
        let totalPrompts = 0;
        let activePrompts = 0;
        let totalVersions = 0;
        let deprecatedVersions = 0;
        for (const [_, versions] of this.prompts.entries()) {
            totalPrompts++;
            totalVersions += versions.length;
            const hasActive = versions.some(v => !v.retiredAt);
            if (hasActive)
                activePrompts++;
            deprecatedVersions += versions.filter(v => v.retiredAt).length;
        }
        return { totalPrompts, activePrompts, totalVersions, deprecatedVersions };
    }
    /**
     * Export registry as JSON
     */
    export() {
        const result = {};
        for (const [id, versions] of this.prompts.entries()) {
            result[id] = versions;
        }
        return result;
    }
    /**
     * Import registry from JSON
     */
    import(data) {
        this.prompts.clear();
        for (const [_id, versions] of Object.entries(data)) {
            for (const version of versions) {
                this.register(version);
            }
        }
    }
    saveToDisk() {
        try {
            const data = this.export();
            fs.writeFileSync(this.registryPath, JSON.stringify(data, null, 2));
        }
        catch (error) {
            console.error('Failed to save prompt registry:', error);
        }
    }
    loadFromDisk() {
        try {
            if (fs.existsSync(this.registryPath)) {
                const content = fs.readFileSync(this.registryPath, 'utf-8');
                const data = JSON.parse(content);
                this.import(data);
            }
        }
        catch (error) {
            console.error('Failed to load prompt registry:', error);
        }
    }
    compareSemver(a, b) {
        const aParts = a.split('.').map(Number);
        const bParts = b.split('.').map(Number);
        for (let i = 0; i < 3; i++) {
            const aPart = aParts[i] || 0;
            const bPart = bParts[i] || 0;
            if (aPart !== bPart)
                return aPart - bPart;
        }
        return 0;
    }
}
exports.PromptRegistry = PromptRegistry;
/**
 * Pre-built prompt registry with FOST standard prompts
 */
function createDefaultPromptRegistry() {
    const registry = new PromptRegistry();
    // TypeScript Type Generation Prompt
    registry.register({
        id: 'typescript-types',
        version: '2.0.0',
        description: 'Generate TypeScript interface from OpenAPI schema',
        model: 'gpt-4-turbo-2024-04-09',
        temperature: 0.1,
        maxTokens: 2000,
        topP: 0.95,
        seed: 42,
        systemPrompt: `
You are a TypeScript code generator specializing in converting OpenAPI schemas to TypeScript interfaces.

CORE RULES:
1. Generate interfaces matching the exact schema structure
2. Only include properties defined in the schema
3. Do not invent properties or methods
4. Use correct type mappings: string→string, number→number, boolean→boolean, array→T[]
5. Mark optional fields with ?
6. Add JSDoc comments from schema descriptions

CHAIN OF THOUGHT:
Before generating, think through:
- What properties are in the schema?
- Which are required vs optional?
- What are the correct types?
- Are there any nested objects?

OUTPUT FORMAT:
{
  "interface_name": "string",
  "properties": [...],
  "code": "interface X { ... }",
  "imports": [],
  "validation": {
    "properties_from_schema": boolean,
    "no_hallucinations": boolean,
    "syntax_correct": boolean
  }
}
`,
        userPromptTemplate: `
Convert this OpenAPI schema to TypeScript:

\`\`\`json
\${schema}
\`\`\`

Context:
- SDK Type: \${sdkType}
- Naming Convention: \${convention}
- Existing Types: \${existingTypes}

Generate the TypeScript interface.
`,
        validationSchema: {
            type: 'object',
            properties: {
                interface_name: { type: 'string', pattern: '^[A-Z][a-zA-Z0-9]*$' },
                code: { type: 'string' },
                imports: { type: 'array', items: { type: 'string' } },
            },
            required: ['interface_name', 'code'],
        },
        examples: [
            {
                input: JSON.stringify({
                    schema: {
                        type: 'object',
                        properties: {
                            id: { type: 'string' },
                            email: { type: 'string' },
                        },
                        required: ['id'],
                    },
                }),
                output: JSON.stringify({
                    interface_name: 'User',
                    code: 'interface User { id: string; email?: string; }',
                    imports: [],
                }),
                explanation: 'id is required, email is optional',
            },
        ],
        tags: ['code-gen', 'typescript', 'types', 'openapi'],
        createdAt: new Date('2026-01-14'),
        modifiedAt: new Date('2026-01-14'),
        guardrails: {
            sourceReferences: true,
            chainOfThought: true,
            fewShotExamples: 3,
            constraints: [
                'Only use properties defined in the input schema',
                'Do not invent additional fields',
                'All required fields must be included',
                'Generated code must be syntactically valid',
            ],
            selfReview: true,
            confidenceScoring: true,
            negations: [
                'Do not create properties that do not exist in the source',
                'Do not hallucinate methods or fields',
                'Do not invent import paths',
            ],
        },
    });
    // Documentation Generation Prompt
    registry.register({
        id: 'docstring-generation',
        version: '1.0.0',
        description: 'Generate JSDoc comments for TypeScript methods',
        model: 'gpt-4-turbo-2024-04-09',
        temperature: 0.3,
        maxTokens: 1000,
        topP: 0.95,
        systemPrompt: `
You are a technical documentation writer. Generate clear, accurate JSDoc comments.

STYLE GUIDE:
- Be concise but complete
- Include @param for each parameter with type
- Include @returns with type
- Include @throws if applicable
- Include @example if useful
- Use markdown in descriptions

RULES:
- Infer parameter descriptions from context
- Be specific about types
- Mention side effects if any
- Keep examples short
`,
        userPromptTemplate: `
Generate JSDoc for this method:

\`\`\`typescript
\${methodSignature}
\`\`\`

Context:
- Class: \${className}
- Purpose: \${purpose}

Add JSDoc above the method.
`,
        validationSchema: {
            type: 'object',
            properties: {
                jsdoc: { type: 'string' },
                isComplete: { type: 'boolean' },
            },
            required: ['jsdoc', 'isComplete'],
        },
        examples: [
            {
                input: 'function getUserById(id: string): Promise<User>',
                output: `/**
 * Fetch a user by ID
 * @param id - The user identifier
 * @returns Promise resolving to the user object
 * @throws Error if user not found
 */`,
                explanation: 'Complete documentation with all sections',
            },
        ],
        tags: ['documentation', 'jsdoc', 'typescript'],
        createdAt: new Date('2026-01-14'),
        modifiedAt: new Date('2026-01-14'),
    });
    // Test Generation Prompt
    registry.register({
        id: 'test-generation',
        version: '1.2.0',
        description: 'Generate unit tests for SDK methods',
        model: 'gpt-4-turbo-2024-04-09',
        temperature: 0.2,
        maxTokens: 3000,
        topP: 0.95,
        systemPrompt: `
You are a test engineer. Generate comprehensive Jest unit tests.

TEST COVERAGE:
- Happy path: Normal operation
- Error paths: What can go wrong?
- Edge cases: Boundary conditions
- Mocking: External dependencies

PATTERNS:
- Use describe() for grouping
- Use it() for test cases
- Test return values, side effects, error messages

ASSERTIONS:
- Test the happy path
- Test error conditions
- Test parameter validation
`,
        userPromptTemplate: `
Generate tests for this method:

\`\`\`typescript
\${methodCode}
\`\`\`

Generate Jest tests covering happy path, error cases, and edge cases.
`,
        validationSchema: {
            type: 'object',
            properties: {
                tests: { type: 'string' },
                testCount: { type: 'number', minimum: 1 },
            },
            required: ['tests', 'testCount'],
        },
        examples: [
            {
                input: 'function add(a: number, b: number): number { return a + b; }',
                output: `describe('add', () => {
  it('should add two numbers', () => {
    expect(add(2, 3)).toBe(5);
  });
  it('should handle negative numbers', () => {
    expect(add(-1, 1)).toBe(0);
  });
});`,
                explanation: 'Complete test suite with happy path and edge case',
            },
        ],
        tags: ['testing', 'jest', 'unit-tests'],
        createdAt: new Date('2026-01-14'),
        modifiedAt: new Date('2026-01-14'),
    });
    return registry;
}
//# sourceMappingURL=prompt-registry.js.map