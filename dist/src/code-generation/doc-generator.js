"use strict";
/**
 * Documentation and Examples Generator for SDKs
 * Generates production-ready documentation that exactly matches generated code
 * Supports Web2 (REST/GraphQL), Web3 (Blockchain), and other SDK types
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentationGenerator = exports.ErrorHandlingBuilder = exports.ExamplesBuilder = exports.AuthenticationBuilder = exports.QuickstartBuilder = exports.ReadmeBuilder = void 0;
// ============================================================================
// README BUILDER
// ============================================================================
class ReadmeBuilder {
    constructor(config) {
        this.context = null;
        this.config = config;
    }
    withContext(context) {
        this.context = context;
        return this;
    }
    build() {
        const sections = [];
        sections.push(this.buildHeader());
        sections.push(this.buildQuickLinks());
        sections.push(this.buildFeatures());
        sections.push(this.buildInstallation());
        sections.push(this.buildQuickStart());
        sections.push(this.buildDocumentationLinks());
        sections.push(this.buildSupport());
        sections.push(this.buildFooter());
        return sections.filter((s) => s.length > 0).join("\n\n");
    }
    buildHeader() {
        return [
            `# ${this.config.sdkName}`,
            "",
            this.config.description,
            "",
            `**Version:** ${this.config.sdkVersion}`,
        ].join("\n");
    }
    buildQuickLinks() {
        const links = [
            "## Quick Links",
            "",
            "- [Quickstart Guide](#quickstart)",
            "- [Authentication Guide](#authentication)",
            "- [Examples](#examples)",
            "- [Error Handling](#error-handling)",
            "- [Troubleshooting](#troubleshooting)",
        ];
        if (this.config.repositoryURL) {
            links.push(`- [GitHub](${this.config.repositoryURL})`);
        }
        if (this.config.documentationBaseURL) {
            links.push(`- [Full Documentation](${this.config.documentationBaseURL})`);
        }
        return links.join("\n");
    }
    buildFeatures() {
        if (!this.context)
            return "";
        const features = this.extractFeatures();
        if (features.length === 0)
            return "";
        const lines = [
            "## Features",
            "",
            ...features.map((f) => `- ${f}`),
        ];
        return lines.join("\n");
    }
    buildInstallation() {
        const language = this.config.language;
        let installCommand = "";
        if (language === "typescript" || language === "javascript") {
            installCommand = `npm install ${this.config.sdkName}`;
        }
        else if (language === "python") {
            installCommand = `pip install ${this.config.sdkName}`;
        }
        else if (language === "go") {
            installCommand = `go get github.com/.../${this.config.sdkName}`;
        }
        return [
            "## Installation",
            "",
            "### Using Package Manager",
            "",
            "```bash",
            installCommand,
            "```",
            "",
            "### From Source",
            "",
            "```bash",
            `git clone https://github.com/.../...-sdk.git`,
            `cd ${this.config.sdkName}`,
            this.getLanguageInstallCommand(),
            "```",
        ]
            .filter((l) => l)
            .join("\n");
    }
    buildQuickStart() {
        return [
            "## Quick Start",
            "",
            "### 1. Import the SDK",
            "",
            this.getImportExample(),
            "",
            "### 2. Create a Client",
            "",
            this.getClientCreationExample(),
            "",
            "### 3. Make Your First Call",
            "",
            this.getFirstCallExample(),
            "",
            "[Read the full quickstart guide](#quickstart)",
        ]
            .join("\n");
    }
    buildDocumentationLinks() {
        return [
            "## Documentation",
            "",
            "- **[Quickstart Guide](./docs/QUICKSTART.md)** - Get up and running in 5 minutes",
            this.config.authRequired
                ? "- **[Authentication Guide](./docs/AUTHENTICATION.md)** - Set up your API credentials or wallet"
                : "",
            "- **[Usage Examples](./docs/EXAMPLES.md)** - Common use cases with code",
            "- **[API Reference](./docs/API_REFERENCE.md)** - Complete method reference",
            "- **[Error Handling](./docs/ERROR_HANDLING.md)** - Understanding error codes and recovery",
            "- **[Troubleshooting](./docs/TROUBLESHOOTING.md)** - Common issues and solutions",
        ]
            .filter((l) => l.length > 0)
            .join("\n");
    }
    buildSupport() {
        const support = ["## Support", ""];
        if (this.config.repositoryURL) {
            support.push(`**GitHub Issues:** [Report bugs](${this.config.repositoryURL}/issues)`);
        }
        if (this.config.documentationBaseURL) {
            support.push(`**Documentation:** [${this.config.documentationBaseURL}](${this.config.documentationBaseURL})`);
        }
        support.push("**Email:** support@example.com");
        return support.join("\n");
    }
    buildFooter() {
        return [
            "## License",
            "",
            "This SDK is licensed under the MIT License - see LICENSE file for details.",
        ].join("\n");
    }
    extractFeatures() {
        if (!this.context)
            return [];
        if (!this.context.designPlan)
            return [];
        const features = [];
        features.push("Comprehensive API coverage");
        if (this.context.methods && this.context.methods.size > 0) {
            features.push(`${this.context.methods.size}+ well-documented methods`);
        }
        if (this.config.authRequired) {
            features.push("Secure authentication support");
        }
        features.push("Type-safe operations");
        features.push("Comprehensive error handling");
        features.push("Full TypeScript support");
        return features;
    }
    getImportExample() {
        switch (this.config.language) {
            case "typescript":
            case "javascript":
                return `\`\`\`typescript\nimport { ${this.config.sdkName.charAt(0).toUpperCase() + this.config.sdkName.slice(1)} } from '${this.config.sdkName}';\n\`\`\``;
            case "python":
                return `\`\`\`python\nfrom ${this.config.sdkName} import ${this.config.sdkName.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join("")}\n\`\`\``;
            case "go":
                return `\`\`\`go\nimport "${this.config.sdkName}"\n\`\`\``;
            default:
                return "```\n// Import example\n```";
        }
    }
    getClientCreationExample() {
        const clientName = `${this.config.sdkName.charAt(0).toUpperCase() + this.config.sdkName.slice(1)}`;
        if (this.config.language === "typescript" || this.config.language === "javascript") {
            if (this.config.authRequired) {
                return `\`\`\`typescript\nconst client = new ${clientName}({\n  apiKey: process.env.API_KEY\n});\n\`\`\``;
            }
            else {
                return `\`\`\`typescript\nconst client = new ${clientName}();\n\`\`\``;
            }
        }
        return "```\n// Client creation example\n```";
    }
    getFirstCallExample() {
        const method = this.context?.methods?.keys().next().value || "getData";
        if (this.config.language === "typescript" || this.config.language === "javascript") {
            return `\`\`\`typescript\nconst result = await client.${method}();\nconsole.log(result);\n\`\`\``;
        }
        return "```\n// First call example\n```";
    }
    getLanguageInstallCommand() {
        switch (this.config.language) {
            case "typescript":
                return "npm install";
            case "python":
                return "pip install -e .";
            case "go":
                return "go build";
            default:
                return "# Install dependencies";
        }
    }
}
exports.ReadmeBuilder = ReadmeBuilder;
// ============================================================================
// QUICKSTART BUILDER
// ============================================================================
class QuickstartBuilder {
    constructor(config) {
        this.context = null;
        this.config = config;
    }
    withContext(context) {
        this.context = context;
        return this;
    }
    build() {
        const sections = [];
        sections.push(this.buildTitle());
        sections.push(this.buildPrerequisites());
        sections.push(this.buildSetup());
        sections.push(this.buildFirstRequest());
        sections.push(this.buildCommonTasks());
        sections.push(this.buildNextSteps());
        return sections.filter((s) => s.length > 0).join("\n\n");
    }
    buildTitle() {
        return [
            `# ${this.config.sdkName} Quickstart`,
            "",
            "Get up and running with the SDK in 5 minutes.",
        ].join("\n");
    }
    buildPrerequisites() {
        const prereqs = [
            "## Prerequisites",
            "",
            "- Node.js 14+ (for JavaScript/TypeScript)",
            "- Python 3.8+ (for Python)",
            "- Go 1.16+ (for Go)",
            "",
            this.config.authRequired
                ? "- Your API key (get it from [your dashboard](https://dashboard.example.com))"
                : "- No setup required!",
        ];
        return prereqs.filter((p) => p).join("\n");
    }
    buildSetup() {
        return [
            "## Installation & Setup",
            "",
            `### Step 1: Install the SDK`,
            "",
            `\`\`\`bash`,
            this.getInstallCommand(),
            `\`\`\``,
            "",
            this.config.authRequired
                ? `### Step 2: Set Your Credentials\n\n\`\`\`bash\nexport API_KEY="your-api-key-here"\n\`\`\``
                : "",
        ]
            .filter((s) => s.length > 0)
            .join("\n");
    }
    buildFirstRequest() {
        const method = this.context?.methods?.keys().next().value || "getData";
        return [
            "## Your First Request",
            "",
            "```typescript",
            `import { ${this.config.sdkName} } from '${this.config.sdkName}';`,
            "",
            `const client = new ${this.config.sdkName}({`,
            `  apiKey: process.env.API_KEY`,
            `});`,
            "",
            `// Make your first call`,
            `const response = await client.${method}();`,
            `console.log(response);`,
            "```",
            "",
            "Success! You just made your first API call.",
        ].join("\n");
    }
    buildCommonTasks() {
        if (!this.context || !this.context.methods)
            return "";
        const methods = Array.from(this.context.methods.values())
            .slice(0, 3);
        if (methods.length === 0)
            return "";
        const examples = [
            "## Common Tasks",
            "",
        ];
        methods.forEach((method, index) => {
            examples.push(`### Example ${index + 1}: ${method.name}`);
            examples.push("");
            examples.push(this.buildMethodExample(method));
            examples.push("");
        });
        return examples.join("\n");
    }
    buildNextSteps() {
        return [
            "## Next Steps",
            "",
            "- Read the [full documentation](./docs/)",
            "- Set up [authentication](./docs/AUTHENTICATION.md) if needed",
            "- Browse [usage examples](./docs/EXAMPLES.md)",
            "- Learn about [error handling](./docs/ERROR_HANDLING.md)",
            "- Check [troubleshooting](./docs/TROUBLESHOOTING.md) for common issues",
        ].join("\n");
    }
    getInstallCommand() {
        switch (this.config.language) {
            case "javascript":
            case "typescript":
                return `npm install ${this.config.sdkName}`;
            case "python":
                return `pip install ${this.config.sdkName}`;
            case "go":
                return `go get github.com/.../${this.config.sdkName}`;
            default:
                return "# Install command";
        }
    }
    buildMethodExample(method) {
        if (this.config.language === "typescript" || this.config.language === "javascript") {
            const params = method.parameters || [];
            const paramNames = params.map((p) => `${p.name}: "${p.name}_value"`).join(", ");
            return [
                "```typescript",
                `const result = await client.${method.name}(${paramNames ? `{ ${paramNames} }` : ""});`,
                `console.log(result);`,
                "```",
            ].join("\n");
        }
        return "```\n// Example code\n```";
    }
}
exports.QuickstartBuilder = QuickstartBuilder;
// ============================================================================
// AUTHENTICATION BUILDER
// ============================================================================
class AuthenticationBuilder {
    constructor(config) {
        this.config = config;
    }
    withContext(_context) {
        return this;
    }
    build() {
        if (!this.config.authRequired) {
            return this.buildNoAuthRequired();
        }
        const sections = [];
        sections.push(this.buildTitle());
        sections.push(this.buildAuthMethod());
        sections.push(this.buildSetupGuide());
        sections.push(this.buildBestPractices());
        sections.push(this.buildTroubleshooting());
        return sections.filter((s) => s.length > 0).join("\n\n");
    }
    buildTitle() {
        return [
            `# Authentication`,
            "",
            `${this.config.sdkName} supports multiple authentication methods.`,
        ].join("\n");
    }
    buildAuthMethod() {
        switch (this.config.authMethod) {
            case "api-key":
                return this.buildApiKeyAuth();
            case "oauth":
                return this.buildOAuthAuth();
            case "wallet":
                return this.buildWalletAuth();
            default:
                return "";
        }
    }
    buildApiKeyAuth() {
        return [
            "## API Key Authentication",
            "",
            "### Get Your API Key",
            "",
            "1. Sign up at [dashboard.example.com](https://dashboard.example.com)",
            "2. Navigate to **Settings > API Keys**",
            "3. Click **Generate New Key**",
            "4. Copy your key and store it securely",
            "",
            "### Using Your API Key",
            "",
            "```typescript",
            `import { ${this.config.sdkName} } from '${this.config.sdkName}';`,
            "",
            `const client = new ${this.config.sdkName}({`,
            `  apiKey: process.env.API_KEY`,
            `});`,
            "```",
            "",
            "### Environment Variables",
            "",
            "```bash",
            `echo "API_KEY=your-api-key-here" > .env`,
            "```",
        ].join("\n");
    }
    buildOAuthAuth() {
        return [
            "## OAuth 2.0 Authentication",
            "",
            "### Authorization Flow",
            "",
            "1. Redirect user to auth endpoint",
            "2. User grants permission",
            "3. Receive authorization code",
            "4. Exchange code for access token",
            "",
            "### Implementation",
            "",
            "```typescript",
            `const client = new ${this.config.sdkName}({`,
            `  clientId: process.env.CLIENT_ID,`,
            `  clientSecret: process.env.CLIENT_SECRET,`,
            `  redirectUri: 'http://localhost:3000/callback'`,
            `});`,
            "```",
        ].join("\n");
    }
    buildWalletAuth() {
        return [
            "## Wallet Authentication",
            "",
            "### Supported Wallets",
            "",
            "- MetaMask",
            "- WalletConnect",
            "- Coinbase Wallet",
            "- Phantom",
            "",
            "### Connect Wallet",
            "",
            "```typescript",
            `const client = new ${this.config.sdkName}();`,
            "",
            "// Connect to wallet",
            "await client.connectWallet();",
            "",
            "// Now ready to make calls",
            "const account = await client.getAccount();",
            "console.log('Connected:', account.address);",
            "```",
        ].join("\n");
    }
    buildSetupGuide() {
        return [
            "## Setup Guide",
            "",
            "### Development Environment",
            "",
            "1. Create `.env.local` file",
            "2. Add your credentials",
            "3. Load in your application",
            "",
            "### Production Environment",
            "",
            "- Store secrets in environment variables",
            "- Use a secrets manager (AWS Secrets Manager, etc.)",
            "- Never commit credentials to version control",
        ].join("\n");
    }
    buildBestPractices() {
        return [
            "## Security Best Practices",
            "",
            "- Never hardcode API keys",
            "- Rotate API keys regularly",
            "- Use environment variables",
            "- Restrict key permissions",
            "- Monitor key usage",
            "- Revoke compromised keys immediately",
        ].join("\n");
    }
    buildTroubleshooting() {
        return [
            "## Troubleshooting",
            "",
            "### Invalid API Key",
            "- Ensure key is copied correctly",
            "- Check environment variable name",
            "- Generate a new key in dashboard",
            "",
            "### Authentication Fails",
            "- Verify credentials in environment",
            "- Check network connectivity",
            "- Review error message for details",
        ].join("\n");
    }
    buildNoAuthRequired() {
        return [
            "# Authentication",
            "",
            `${this.config.sdkName} requires no authentication.`,
            "",
            "Simply import and use the SDK:",
            "",
            "```typescript",
            `import { ${this.config.sdkName} } from '${this.config.sdkName}';`,
            "",
            `const client = new ${this.config.sdkName}();`,
            "```",
        ].join("\n");
    }
}
exports.AuthenticationBuilder = AuthenticationBuilder;
// ============================================================================
// EXAMPLES BUILDER
// ============================================================================
class ExamplesBuilder {
    constructor() {
        this.examples = [];
    }
    withContext(_context) {
        return this;
    }
    addExample(example) {
        this.examples.push(example);
        return this;
    }
    build() {
        const sections = [];
        sections.push(this.buildTitle());
        sections.push(this.buildBeginnerExamples());
        sections.push(this.buildIntermediateExamples());
        sections.push(this.buildAdvancedExamples());
        return sections.filter((s) => s.length > 0).join("\n\n");
    }
    buildTitle() {
        return [
            "# Usage Examples",
            "",
            "Complete code examples for common tasks.",
        ].join("\n");
    }
    buildBeginnerExamples() {
        const beginnerExamples = this.examples.filter((e) => e.difficulty === "beginner");
        if (beginnerExamples.length === 0)
            return "";
        const sections = [
            "## Beginner Examples",
            "",
            "Great for learning the basics.",
            "",
        ];
        beginnerExamples.forEach((example) => {
            sections.push(this.buildExampleSection(example));
        });
        return sections.join("\n");
    }
    buildIntermediateExamples() {
        const intermediateExamples = this.examples.filter((e) => e.difficulty === "intermediate");
        if (intermediateExamples.length === 0)
            return "";
        const sections = [
            "## Intermediate Examples",
            "",
            "Build on the basics with more complex scenarios.",
            "",
        ];
        intermediateExamples.forEach((example) => {
            sections.push(this.buildExampleSection(example));
        });
        return sections.join("\n");
    }
    buildAdvancedExamples() {
        const advancedExamples = this.examples.filter((e) => e.difficulty === "advanced");
        if (advancedExamples.length === 0)
            return "";
        const sections = [
            "## Advanced Examples",
            "",
            "Powerful patterns for complex use cases.",
            "",
        ];
        advancedExamples.forEach((example) => {
            sections.push(this.buildExampleSection(example));
        });
        return sections.join("\n");
    }
    buildExampleSection(example) {
        const sections = [
            `### ${example.title}`,
            "",
            example.description,
            "",
            "```" + example.language,
            example.code,
            "```",
        ];
        if (example.output) {
            sections.push("");
            sections.push("**Output:**");
            sections.push("");
            sections.push("```");
            sections.push(example.output);
            sections.push("```");
        }
        if (example.explanation) {
            sections.push("");
            sections.push("**Explanation:**");
            sections.push("");
            sections.push(example.explanation);
        }
        sections.push("");
        return sections.join("\n");
    }
}
exports.ExamplesBuilder = ExamplesBuilder;
// ============================================================================
// ERROR HANDLING BUILDER
// ============================================================================
class ErrorHandlingBuilder {
    constructor() {
        this._context = null;
    }
    withContext(_context) {
        this._context = _context;
        return this;
    }
    build() {
        const sections = [];
        sections.push(this.buildTitle());
        sections.push(this.buildErrorTypes());
        sections.push(this.buildRecoveryStrategies());
        sections.push(this.buildErrorHandlingPatterns());
        return sections.filter((s) => s.length > 0).join("\n\n");
    }
    buildTitle() {
        return [
            "# Error Handling",
            "",
            "Understanding and handling errors from the SDK.",
        ].join("\n");
    }
    buildErrorTypes() {
        if (!this._context || !this._context.errorTypes || this._context.errorTypes.size === 0) {
            return this.buildGenericErrors();
        }
        const sections = ["## Error Types", ""];
        const errors = Array.from(this._context.errorTypes.values());
        // Group by category
        const byCategory = new Map();
        errors.forEach((error) => {
            const category = this.categorizeError(error.errorType);
            if (!byCategory.has(category)) {
                byCategory.set(category, []);
            }
            byCategory.get(category).push(error);
        });
        byCategory.forEach((categoryErrors, category) => {
            sections.push(`### ${category}`);
            sections.push("");
            categoryErrors.forEach((error) => {
                sections.push(`#### ${error.errorCode}`);
                sections.push("");
                sections.push(`**Description:** ${error.description}`);
                sections.push("");
                sections.push(`**Cause:** ${error.cause}`);
                sections.push("");
                sections.push(`**Solution:** ${error.solution}`);
                sections.push("");
                if (error.example) {
                    sections.push("**Example:**");
                    sections.push("");
                    sections.push("```typescript");
                    sections.push(error.example);
                    sections.push("```");
                    sections.push("");
                }
            });
        });
        return sections.join("\n");
    }
    buildGenericErrors() {
        return [
            "## Common Error Types",
            "",
            "### Network Errors",
            "",
            "- Connection timeouts",
            "- DNS resolution failures",
            "- Rate limiting",
            "",
            "### Authentication Errors",
            "",
            "- Invalid credentials",
            "- Expired tokens",
            "- Insufficient permissions",
            "",
            "### Validation Errors",
            "",
            "- Invalid parameters",
            "- Missing required fields",
            "- Type mismatches",
            "",
            "### Server Errors",
            "",
            "- 5xx server errors",
            "- Service unavailable",
            "- Internal errors",
        ].join("\n");
    }
    buildRecoveryStrategies() {
        return [
            "## Recovery Strategies",
            "",
            "### Retry Logic",
            "",
            "```typescript",
            `async function withRetry(fn, maxRetries = 3) {`,
            `  for (let i = 0; i < maxRetries; i++) {`,
            `    try {`,
            `      return await fn();`,
            `    } catch (error) {`,
            `      if (i === maxRetries - 1) throw error;`,
            `      await sleep(1000 * Math.pow(2, i));`,
            `    }`,
            `  }`,
            `}`,
            "```",
            "",
            "### Error Detection",
            "",
            "```typescript",
            `try {`,
            `  const result = await client.getData();`,
            `} catch (error) {`,
            `  if (error.code === 'AUTH_ERROR') {`,
            `    // Handle auth error`,
            `  } else if (error.code === 'RATE_LIMIT') {`,
            `    // Retry with backoff`,
            `  } else {`,
            `    // Unknown error`,
            `  }`,
            `}`,
            "```",
        ].join("\n");
    }
    buildErrorHandlingPatterns() {
        return [
            "## Best Practices",
            "",
            "- Always wrap API calls in try-catch",
            "- Check error codes to determine recovery strategy",
            "- Implement exponential backoff for retries",
            "- Log errors with full context",
            "- Don't expose internal errors to users",
            "- Provide helpful error messages",
        ].join("\n");
    }
    categorizeError(errorType) {
        if (errorType.includes("auth") || errorType.includes("permission")) {
            return "Authentication & Authorization";
        }
        if (errorType.includes("validation")) {
            return "Validation Errors";
        }
        if (errorType.includes("network") || errorType.includes("connection")) {
            return "Network Errors";
        }
        if (errorType.includes("rate")) {
            return "Rate Limiting";
        }
        if (errorType.includes("server")) {
            return "Server Errors";
        }
        return "Other Errors";
    }
}
exports.ErrorHandlingBuilder = ErrorHandlingBuilder;
// ============================================================================
// MAIN DOCUMENTATION GENERATOR
// ============================================================================
class DocumentationGenerator {
    constructor(config) {
        this.context = null;
        this.config = config;
    }
    withDesignPlan(designPlan) {
        if (!this.context) {
            this.context = {
                config: this.config,
                designPlan,
                methods: new Map(),
                types: new Map(),
                errorTypes: new Map(),
                exampleCode: new Map(),
                prerequisites: [],
                setupSteps: [],
            };
        }
        else {
            this.context.designPlan = designPlan;
        }
        return this;
    }
    withMethods(methods) {
        if (!this.context) {
            this.context = {
                config: this.config,
                designPlan: {},
                methods: new Map(),
                types: new Map(),
                errorTypes: new Map(),
                exampleCode: new Map(),
                prerequisites: [],
                setupSteps: [],
            };
        }
        methods.forEach((method) => {
            this.context.methods.set(method.name, method);
        });
        return this;
    }
    withErrors(errors) {
        if (!this.context) {
            this.context = {
                config: this.config,
                designPlan: {},
                methods: new Map(),
                types: new Map(),
                errorTypes: new Map(),
                exampleCode: new Map(),
                prerequisites: [],
                setupSteps: [],
            };
        }
        errors.forEach((error) => {
            this.context.errorTypes.set(error.errorCode, error);
        });
        return this;
    }
    generateReadme() {
        return new ReadmeBuilder(this.config).withContext(this.context).build();
    }
    generateQuickstart() {
        return new QuickstartBuilder(this.config).withContext(this.context).build();
    }
    generateAuthentication() {
        return new AuthenticationBuilder(this.config).withContext(this.context).build();
    }
    generateExamples(examples) {
        const builder = new ExamplesBuilder().withContext(this.context);
        examples.forEach((ex) => builder.addExample(ex));
        return builder.build();
    }
    generateErrorHandling() {
        return new ErrorHandlingBuilder().withContext(this.context).build();
    }
    generateAll(examples) {
        return {
            readme: this.generateReadme(),
            quickstart: this.generateQuickstart(),
            authentication: this.generateAuthentication(),
            examples: this.generateExamples(examples),
            errorHandling: this.generateErrorHandling(),
            apiReference: this.generateApiReference(),
        };
    }
    generateApiReference() {
        if (!this.context || !this.context.methods || this.context.methods.size === 0) {
            return "# API Reference\n\nNo methods documented.";
        }
        const sections = ["# API Reference", "", ""];
        const methods = Array.from(this.context.methods.values());
        methods.forEach((method) => {
            sections.push(`## ${method.name}()`);
            sections.push("");
            sections.push(method.description || "");
            sections.push("");
            if (method.parameters && method.parameters.length > 0) {
                sections.push("### Parameters");
                sections.push("");
                sections.push("| Name | Type | Description |");
                sections.push("|------|------|-------------|");
                method.parameters.forEach((param) => {
                    sections.push(`| ${param.name} | ${param.type} | ${param.description || ""} |`);
                });
                sections.push("");
            }
            sections.push("---");
            sections.push("");
        });
        return sections.join("\n");
    }
}
exports.DocumentationGenerator = DocumentationGenerator;
// ============================================================================
// EXPORTS
// ============================================================================
// All classes are exported above via class declaration
//# sourceMappingURL=doc-generator.js.map