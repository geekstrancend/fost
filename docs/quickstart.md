# 5-Minute Quickstart

Get your first Fost-generated SDK in 5 minutes.

## Step 1: Install Fost

```bash
npm install -g fost
```

Verify installation:
```bash
fost --version
# ought/output: fost 0.1.0
```

## Step 2: Get an API Spec

You need an API specification. Choose one:

**Option A: Use a sample**
```bash
curl -o petstore.openapi.yaml \
  https://raw.githubusercontent.com/swagger-api/swagger-petstore/master/swagger.yaml
```

**Option B: Use your own**
- OpenAPI 3.0 spec (YAML/JSON)
- GraphQL schema (SDL)
- Smart contract ABI (JSON)

## Step 3: Generate SDK

```bash
fost generate petstore.openapi.yaml \
  --lang typescript \
  --type web2
```

Output directory: `./sdk`

## Step 4: Use the SDK

The generated SDK is ready to use:

```typescript
import { PetstoreClient } from './sdk';

const client = new PetstoreClient();

// Fully-typed!
const pet = await client.pets.getPet({
  petId: '123'
});

console.log(pet.name);
```

## What You Got

Inside `./sdk/`:

```
sdk/
  src/
    client.ts         - Main client class
    types/            - All type definitions (auto-generated)
    endpoints/        - Organized by resource
  tests/
    client.test.ts    - Full test suite
  docs/
    API.md           - Complete API documentation
  package.json       - Ready to publish
  tsconfig.json      - TypeScript config
```

## Next Steps

- Customize with `--config fost.config.json`
- Add to your project: `npm install ./sdk`
- Publish to npm (your own registry)
- Generate SDKs for other APIs

## Common Options

```bash
# Custom output directory
--output ./my-generated-sdk

# Generate Python instead
--lang python

# For blockchain/Web3
--type web3

# Include only types, no tests
--skip-tests

# Strict validation
--strict

# Verbose logging
--verbose
```

## Troubleshooting

**"Command not found"**
- Try `npx fost` instead of `fost`
- Ensure Node.js 18+ is installed

**"Invalid specification"**
- Validate with `fost validate --input spec.yaml`
- Check OpenAPI/GraphQL docs if needed

**"Generation failed"**
- Use `--verbose` for debug info
- Check error message carefully
- Create an issue if it persists

---

Next: Read the [Basic Usage Guide](./basic-usage.md)
