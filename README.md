# Fost - AI-Powered SDK Generator

Generate fully-typed, production-ready SDKs in minutes from OpenAPI specs, GraphQL schemas, or smart contract ABIs.

## What is Fost?

Fost is a powerful CLI tool that transforms API specifications into complete, type-safe SDKs with zero configuration. Supports both Web2 (REST, GraphQL) and Web3 (smart contracts) APIs.

**Why Fost?**
- ⚡ **Fast**: Generate SDKs in minutes, not days
- 📦 **Complete**: Includes types, docs, tests, and examples
- 🔒 **Type-Safe**: Full TypeScript support with strict typing
- 🧠 **AI-Powered**: LLM-enhanced code generation for quality
- 🌐 **Multi-Platform**: Web2 + Web3 support
- 🛠️ **Developer-First**: Clean CLI, sensible defaults, zero dependencies

## Quick Start

### Installation

```bash
npm install -g fost
```

### Generate Your First SDK

```bash
# From OpenAPI spec
fost generate api.openapi.yaml --lang typescript --output ./sdk

# From smart contract ABI
fost generate contract.abi.json --lang typescript --type web3 --output ./sdk

# Validate before generating
fost validate api.openapi.yaml
```

## Features

### Supported Input Formats
- **REST APIs**: OpenAPI 3.0+, Swagger 2.0
- **Smart Contracts**: EVM ABI, Solana IDL
- **Blockchain**: Chain metadata for multi-chain support

### Generated SDK Includes
- Fully-typed client class
- Type definitions for all requests/responses
- Comprehensive API documentation
- Example code and usage patterns
- Unit and integration tests
- Error handling with custom error types

### Configuration

Create `fost.config.json`:

```json
{
  "outputDir": "./sdk",
  "language": "typescript",
  "includeTests": true,
  "includeDocs": true,
  "strict": true,
  "logLevel": "info"
}
```

Or use `package.json`:

```json
{
  "fost": {
    "outputDir": "./sdk",
    "language": "typescript"
  }
}
```

## Commands

```bash
fost generate [input] [options]    # Generate SDKs
fost validate [input]               # Validate specifications
fost config show                    # Show configuration
fost --version                      # Show version
fost --help                         # Show help
```

## Environment Variables

```bash
DEBUG=1 fost generate api.yaml      # Enable debug output
NO_COLOR=1 fost generate api.yaml   # Disable colored output
```

## Examples

### OpenAPI to TypeScript SDK

```bash
fost generate petstore.openapi.yaml \
  --lang typescript \
  --output ./petstore-sdk
```

Generated code:
```typescript
import { PetstoreClient } from './petstore-sdk';

const client = new PetstoreClient();
const pet = await client.pets.get('123');
console.log(pet); // Fully typed!
```

### Smart Contract to Web3 SDK

```bash
fost generate uniswap-v4.abi.json \
  --lang typescript \
  --type web3 \
  --output ./uniswap-sdk
```

Generated code:
```typescript
import { UniswapV4 } from './uniswap-sdk';

const contract = new UniswapV4(provider);
const pools = await contract.getPools();
return pools; // Type-safe with ABI runtime checking
```

## Project Structure

```
src/
├── cli/              # Command-line interface
├── errors/           # Error handling system
├── logger/           # Structured logging
├── config/           # Configuration management
├── code-generation/  # SDK code generators
├── input-analysis/   # Spec parsing & normalization
├── llm-operations/   # LLM integration
└── plugins/          # Plugin system
```

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Run tests
npm test

# Watch mode
npm run watch

# Try locally
npm run cli -- --help
```

## Documentation

See detailed guides in the `docs/` folder:
- [Quick Start Guide](./docs/quickstart.md)
- [CLI Reference](./docs/cli-reference.md)
- [Architecture Overview](./docs/README.md)

## License

MIT - See [LICENSE](./LICENSE) for details

## Support

- **Issues**: [GitHub Issues](https://github.com/Emmyhack/fost/issues)
- **Discussions**: [GitHub Discussions](https://github.com/Emmyhack/fost/discussions)
- **Docs**: [Full documentation](./docs/)

---

Built with TypeScript, tested with Vitest, and published to npm.

**Fost** - Generate SDKs. Not documentation. Not boilerplate. Real, usable code.
