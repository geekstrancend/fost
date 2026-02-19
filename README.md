# Fost - Production SDK Generator

## Overview

Fost is an AI-powered CLI tool that generates fully-typed, production-ready SDKs from:

- OpenAPI specifications
- GraphQL schemas  
- Smart contract ABIs (Web3)

Generate SDKs in **minutes**, not days. Supports Web2 and Web3 APIs with TypeScript, Python, and more.

## Quick Start

### Installation

```bash
npm install -g fost
# or
npm install --save-dev fost
```

### Generate an SDK

```bash
fost generate example-api.openapi.yaml --lang typescript --type web2
```

Generated SDK appears in `./sdk` directory with:
- Fully-typed methods
- Comprehensive documentation
- Test suite
- Ready for production use

### Supported Targets

**Web2:**
- REST APIs via OpenAPI
- GraphQL APIs
- gRPC services

**Web3:**
- Smart contract ABIs (EVM, Solana, etc.)
- Blockchain RPC endpoints
- DeFi protocols

## Usage

### Basic Generation

```bash
fost generate --input api.openapi.yaml \
  --output ./generated-sdk \
  --lang typescript \
  --type web2
```

### Validation Only

```bash
fost validate --input api.openapi.yaml --type web2
```

### Advanced Options

```bash
fost generate \
  --input api.json \
  --lang typescript \
  --type web2 \
  --output ./sdk \
  --config fost.config.json \
  --skip-tests \
  --skip-docs \
  --strict
```

## Configuration

Create `fost.config.json` in your project root:

```json
{
  "outputDir": "./sdk",
  "target": "web2",
  "strict": false,
  "language": "typescript",
  "includeTests": true,
  "includeDocs": true,
  "logLevel": "info",
  "noColor": false
}
```

Or use `package.json`:

```json
{
  "fost": {
    "outputDir": "./sdk",
    "target": "web2"
  }
}
```

## Environment Variables

- `DEBUG` - Enable debug output: `DEBUG=1 fost generate ...`
- `NO_COLOR` - Disable colored output: `NO_COLOR=1 fost ...`

## Examples

### OpenAPI 3.0 to TypeScript SDK

```bash
fost generate petstore.openapi.yaml \
  --lang typescript \
  --type web2 \
  --output ./petstore-sdk
```

Generated SDK:
```typescript
import { PetstoreClient } from './petstore-sdk';

const client = new PetstoreClient();
const pet = await client.pets.get('123');
```

### Smart Contract ABI to Web3 SDK

```bash
fost generate uniswap-v4.abi.json \
  --lang typescript \
  --type web3 \
  --output ./uniswap-sdk
```

Generated SDK:
```typescript
import { UniswapV4 } from './uniswap-sdk';

const contract = new UniswapV4(provider);
const pools = await contract.getPools();
```

## Developers

### Contributing

We welcome contributions! See CONTRIBUTING.md.

### Development

```bash
# Clone repo
git clone https://github.com/Emmyhack/fost.git
cd fost

# Install dependencies
npm install

# Run tests
npm test

# Build
npm run build

# Try CLI locally
npm run cli -- --help
```

### Project Structure

```
src/
  cli/              - CLI commands and argument parsing
  errors/           - Centralized error handling
  logger/           - Structured logging
  config/           - Configuration management
  code-generation/  - SDK code generation engine
  input-analysis/   - OpenAPI/ABI parsing
  llm-operations/   - LLM integration for code quality
```

## License

MIT - See LICENSE for details

## Support

- GitHub Issues: Report bugs
- Discussions: Ask questions
- Documentation: Full guide available in docs/

---

**Built with performance and developer experience in mind.**
- **LLM Operations**: AI-powered code generation with safety controls
- **Input Analysis**: Parse and normalize OpenAPI, Chain Metadata, and Contract ABI specifications
- **Code Generation**: Generate type-safe, optimized SDKs
- **CLI Tool**: Full-featured command-line interface
- **Monitoring**: Built-in metrics collection and health monitoring
- **Determinism Control**: Reproducible code generation with version management

## Project Structure

```
src/
├── cli/              # Command-line interface
├── input-analysis/   # Specification parsing and normalization
├── code-generation/  # SDK code generators
└── llm-operations/   # LLM orchestration and safety
```

## Documentation

- [Architecture Overview](./ARCHITECTURE.md)
- [Code Generation Architecture](./CODE_GENERATION_ARCHITECTURE.md)
- [LLM Operations Strategy](./LLM_OPERATIONS_STRATEGY.md)
- [Project Status](./PROJECT_STATUS.md)
- [Delivery Summary](./DELIVERY_SUMMARY.md)

## Commands

- `generate` - Generate SDK from specification
- `validate` - Validate input specification
- `test` - Run generated SDK tests
- `lint` - Lint generated code
- `config` - Manage configuration
- `version` - Show version

## Build

```bash
npm run build     # Compile TypeScript
npm run watch     # Watch mode
npm run cli       # Run CLI
```

## License

MIT
