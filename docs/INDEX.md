# Fost Documentation Index

Complete guide to all Fost documentation and resources.

## Getting Started

- **[Quick Start](./quickstart.md)** - Get up and running in 5 minutes
- **[README](./README.md)** - Project overview and introduction

## Core Guides

### REST API SDKs (Web2)
- **[Web2 Guide](./web2-guide.md)** - Generate SDKs from OpenAPI/Swagger specs
  - Supported formats (OpenAPI 3.0+, Swagger 2.0)
  - Authentication patterns (API Key, OAuth 2.0, JWT)
  - Request/response validation
  - Real-world examples (GitHub, Stripe, Shopify APIs)

### Smart Contract SDKs (Web3)
- **[Web3 Guide](./web3-guide.md)** - Generate SDKs from smart contract ABIs
  - Solidity ABI support
  - Multi-chain support (Ethereum, Polygon, Arbitrum, etc.)
  - Event handling and listening
  - Contract interactions (read, write, events)
  - Real-world examples (ERC20, Uniswap V3, multi-contract)

## Reference Documentation

### Configuration
- **[Configuration Reference](./configuration.md)** - All Fost configuration options
  - Core options (language, output, caching)
  - Input/output configuration
  - API configuration
  - Authentication setup
  - Web3 settings
  - Code generation options
  - TypeScript compilation settings
  - Plugin configuration
  - Real-world configuration examples

### Command Reference
- **[CLI Reference](./cli-reference.md)** - Complete CLI command documentation
  - `init` - Initialize a new Fost project
  - `generate` - Generate SDK from specification
  - `validate` - Validate specifications
  - `test` - Run generated tests
  - `lint` - Lint generated code
  - `config` - Manage configuration
  - `completion` - Shell completion
  - All command options and flags

## Learning Resources

### Examples & Tutorials
- **[Examples & Real-World Scenarios](./examples.md)** - Comprehensive examples
  - REST API examples (GitHub, Stripe, Shopify SDKs)
  - Web3 examples (ERC20, Uniswap V3, multi-chain)
  - Real-world integrations
    - E-commerce platform with Shopify + Stripe
    - DeFi portfolio tracking with Uniswap + Aave + Curve
    - API monitoring service with GitHub + Slack + Datadog
  - E2E testing examples
  - Publishing to NPM

### Advanced Topics
- **[Plugin Development Guide](./plugin-development.md)** - Create custom plugins
  - Plugin architecture and interfaces
  - Validation hooks
  - Code generation hooks
  - Transformation hooks
  - Real-world plugins (maturity validator, deprecation warnings, security scanner, Web3 analyzer)
  - Testing and distributing plugins

### Troubleshooting
- **[Troubleshooting Guide](./troubleshooting.md)** - Solve common issues
  - Installation issues
  - Configuration problems
  - Input specification errors
  - Generation failures
  - Web3-specific issues
  - Testing problems
  - Publishing issues
  - How to enable verbose logging and debug

## Quick Command Reference

```bash
# Initialize a new project
fost init --type web2 --name my-sdk

# Generate SDK from OpenAPI
fost generate --input api.openapi.json --lang typescript --type web2

# Generate SDK from ABI
fost generate --input contract.abi.json --lang typescript --type web3 --chain ethereum

# Validate a specification
fost validate --input api.json --strict

# Run tests
npm test

# Lint generated code
fost lint --path ./sdk --fix

# Get help
fost --help
fost help init
```

## Documentation Structure

```
docs/
├── README.md                    # Project overview
├── INDEX.md                     # This file
├── quickstart.md                # 5-minute getting started
├── cli-reference.md             # CLI command reference
├── web2-guide.md                # REST API SDK guide
├── web3-guide.md                # Smart contract SDK guide
├── configuration.md             # Configuration options
├── troubleshooting.md           # Common issues & solutions
├── examples.md                  # Real-world examples
└── plugin-development.md        # Creating custom plugins
```

## Key Features Documented

### Code Generation
- ✅ OpenAPI 3.0+ → TypeScript SDK
- ✅ Swagger 2.0 → TypeScript SDK
- ✅ Solidity ABI → TypeScript SDK
- ✅ Multi-language support (TypeScript, JavaScript, Python, Go)
- ✅ Type-safe client generation
- ✅ Request/response validation
- ✅ Error handling
- ✅ Test generation
- ✅ Documentation generation

### Authentication
- ✅ API Key authentication
- ✅ Bearer tokens
- ✅ OAuth 2.0
- ✅ Basic auth
- ✅ Custom headers
- ✅ Environment variable support

### Web3 Features
- ✅ Multi-chain support
- ✅ RPC endpoint configuration
- ✅ Event listening and filtering
- ✅ Gas estimation
- ✅ Transaction handling
- ✅ Custom contract interactions
- ✅ Function overload support

### Developer Experience
- ✅ CLI with progress reporting
- ✅ Configuration file support
- ✅ Validation before generation
- ✅ JSON output format
- ✅ Verbose/quiet modes
- ✅ Shell completion
- ✅ Plugin extensibility

## Common Use Cases

### Use Case: Generate GitHub API SDK
```bash
curl -o github.openapi.json https://raw.githubusercontent.com/github/rest-api-description/main/openapi.json
fost generate --input github.openapi.json --lang typescript --type web2 --output ./github-sdk
```
See [Examples](./examples.md#1-github-api-sdk) for full details.

### Use Case: Generate Uniswap V3 SDK
```bash
fost generate --input uniswap-v3.abi.json --lang typescript --type web3 --chain ethereum
```
See [Examples](./examples.md#2-uniswap-v3-trading) for full implementation.

### Use Case: DeFi Protocol Integration
```bash
# Generate SDKs for multiple protocols
fost init --type web3 --name defi-portfolio
# Then use the generated clients for Uniswap, Aave, Curve
```
See [Examples](./examples.md#2-defi-protocol-dashboard) for the full implementation.

### Use Case: Create Custom Plugin
```typescript
export class SecurityPlugin implements IPlugin {
  name = 'security-scanner';
  // ... implement hooks
}
```
See [Plugin Development](./plugin-development.md#example-3-security-scanner-plugin) for full details.

## Learning Path

**Beginner:**
1. Read [Quick Start](./quickstart.md)
2. Run `fost init`
3. Try first `fost generate` with the sample spec
4. Check [Examples](./examples.md) for common patterns

**Intermediate:**
1. Study [Web2 Guide](./web2-guide.md) or [Web3 Guide](./web3-guide.md)
2. Explore [Configuration Reference](./configuration.md)
3. Implement real-world examples from [Examples](./examples.md)

**Advanced:**
1. Master [Configuration Reference](./configuration.md) edge cases
2. Implement multi-SDK projects
3. Develop custom plugins with [Plugin Development Guide](./plugin-development.md)
4. Deploy generated SDKs to NPM

## Need Help?

1. **Getting started?** → [Quick Start](./quickstart.md)
2. **Have an error?** → [Troubleshooting Guide](./troubleshooting.md)
3. **Learning the CLI?** → [CLI Reference](./cli-reference.md)
4. **Looking for examples?** → [Examples](./examples.md)
5. **Need to configure?** → [Configuration Reference](./configuration.md)
6. **Want to extend Fost?** → [Plugin Development Guide](./plugin-development.md)

## Resources

- **GitHub:** https://github.com/yourrepo/fost
- **Issues:** https://github.com/yourrepo/fost/issues
- **Discussions:** https://github.com/yourrepo/fost/discussions
- **Discord:** [Join community](https://discord.gg/fost)

## Version Information

This documentation covers **Fost v0.1.0+**

Last updated: 2024

---

**Start here:** [Quick Start](./quickstart.md) | **Next step:** [Web2 Guide](./web2-guide.md) or [Web3 Guide](./web3-guide.md)
