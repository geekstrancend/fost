# Troubleshooting Guide

Common issues and solutions when using Fost.

## Installation Issues

### Issue: `npm install fost` fails

**Error**: `404 Not Found`

**Solution**:
- Ensure you're using the correct package name
- Check NPM registry: `npm search fost`
- Try clearing cache: `npm cache clean --force`

```bash
npm cache clean --force
npm install fost
```

### Issue: TypeScript compilation errors after install

**Error**: `Cannot find module 'fost'`

**Solution**:
- Install type definitions: `npm install --save-dev @types/fost`
- Check tsconfig.json includes `node_modules`: `"typeRoots": ["./node_modules/@types"]`
- Verify Node.js version: `node --version` (requires 18+)

```bash
node --version  # Should be v18.0.0 or higher
npm install --save-dev typescript
```

## Configuration Issues

### Issue: Configuration file not found

**Error**: `Error: Cannot find configuration file`

**Solution**:
- Ensure `fost.config.json` or `fost.config.ts` exists in project root
- Check file permissions: `ls -la fost.config.json`
- Verify JSON syntax: Use `jq . fost.config.json` to validate

```bash
# Create default configuration
cat > fost.config.json << 'EOF'
{
  "fost": {
    "language": "typescript",
    "outputDir": "./dist"
  }
}
EOF
```

### Issue: Invalid configuration

**Error**: `ValidationError: Invalid configuration`

**Solution**:
- Validate config file: `fost validate --config fost.config.json`
- Check for required fields in configuration
- Ensure paths are correct (relative to project root)

```bash
# Test configuration
fost validate --config fost.config.json

# Detailed validation output
fost validate --config fost.config.json --verbose
```

### Issue: Environment variables not being replaced

**Error**: Variable references like `${API_KEY}` appear in output

**Solution**:
- Ensure `.env` file exists in project root
- Load environment before running fost: `source .env && fost generate`
- Check variable names match exactly (case-sensitive)

```bash
# Create .env file
echo "API_KEY=secret123" > .env
echo "API_BASE_URL=https://api.example.com" >> .env

# Load and run
source .env
fost generate
```

## Input Specification Issues

### Issue: OpenAPI specification validation fails

**Error**: `ValidationError: Invalid OpenAPI specification`

**Solution**:
- Validate OpenAPI spec: `fost validate api.openapi.json`
- Use OpenAPI validator: `npm install -g @connectrpc/protoc-gen-es`
- Check OpenAPI version (3.0+): `grep "openapi:" api.openapi.json`

```bash
# Validate against OpenAPI 3.0 schema
fost validate api.openapi.json --schema openapi-3.0

# Generate with strict validation
fost generate api.openapi.json --strict
```

### Issue: ABI file is missing or invalid

**Error**: `Error: Invalid ABI format` or `Cannot find ABI file`

**Solution**:
- Verify ABI is valid JSON: `jq . contract.abi.json`
- Ensure ABI is an array: Check first character is `[`
- Export ABI from contract: Use Etherscan, Truffle, or Hardhat

```bash
# Validate ABI syntax
jq . contract.abi.json > /dev/null && echo "Valid JSON"

# Check ABI is array
jq 'type' contract.abi.json  # Should output "array"
```

### Issue: GraphQL schema has syntax errors

**Error**: `Error parsing GraphQL schema`

**Solution**:
- Validate GraphQL schema: Use GraphQL Playground or online validators
- Check for missing type definitions
- Ensure proper SDL syntax

```bash
# Validate with graphql-core
npm install -g graphql
graphql schema.graphql
```

## Generation Issues

### Issue: Generation fails with "Input not found"

**Error**: `Error: Cannot find input file at path`

**Solution**:
- Verify input path in configuration is correct
- Use absolute path or relative to project root
- Check file permissions: `cat input.json`

```bash
# List files to confirm path
ls -la ./specs/

# Update configuration with correct path
cat fost.config.json | grep '"path"'
```

### Issue: Generation times out

**Error**: `Timeout: Generation took too long`

**Solution**:
- Reduce input size or split into multiple files
- Increase timeout: `--timeout 300000` (5 minutes)
- Check system resources: `top` or `htop`

```bash
# Run with extended timeout
fost generate --input api.json --timeout 300000

# Run in background with progress
fost generate --input api.json &
```

### Issue: Memory exhaustion during generation

**Error**: `JavaScript heap out of memory` or `ENOMEM`

**Solution**:
- Increase Node.js memory: `NODE_OPTIONS="--max-old-space-size=4096"`
- Split large inputs into smaller specifications
- Run with `--low-memory` flag if available

```bash
# Increase memory limit
export NODE_OPTIONS="--max-old-space-size=4096"
fost generate --input api.json

# Or use node directly
node --max-old-space-size=4096 ./node_modules/.bin/fost generate api.json
```

## Code Generation Issues

### Issue: Generated code has type errors

**Error**: `TS2339: Property 'X' does not exist`

**Solution**:
- Generate with `--strict` flag for better validation
- Check input specification for completeness
- Validate specification: `fost validate input.json --strict`

```bash
# Regenerate with strict validation
fost generate --input api.json --strict

# Check generated types
cat dist/types.ts | head -50
```

### Issue: Generated code doesn't match input specification

**Error**: Methods or properties missing from generated SDK

**Solution**:
- Verify input specification includes all definitions
- Check specification is saved correctly
- Use `--verbose` flag for detailed generation logs

```bash
# View generation details
fost generate --input api.json --verbose

# Compare input and output
diff <(jq .paths api.json | jq -r 'keys[]' | sort) \
     <(grep -o 'async [a-zA-Z]*(' dist/index.ts | sed 's/async //;s/($//' | sort)
```

### Issue: ESLint or Prettier errors in generated code

**Error**: Linting fails on generated files

**Solution**:
- Update `.eslintrc.json`: Add `"**/*.generated.ts": false`
- Disable linting for generated files
- Or configure ESLint to match code generation settings

```bash
# Skip linting for generated code
echo "dist/**/* linguist-generated=true" >> .gitattributes

# Or in .eslintignore
echo "dist/" >> .eslintignore
```

## Web3 Issues

### Issue: Contract ABI not recognized

**Error**: `ValidationError: Invalid contract ABI`

**Solution**:
- Ensure ABI is standard Solidity ABI format (array of objects)
- Export ABI from contract compiler or Etherscan
- Validate ABI structure: `jq '.[0] | keys' contract.abi.json`

```bash
# Download ABI from Etherscan
curl https://api.etherscan.io/api?module=contract&action=getabi&address=0x... > contract.abi.json

# Validate ABI format
jq 'if type == "array" then "Valid" else "Invalid: not an array" end' contract.abi.json
```

### Issue: RPC endpoint unreachable

**Error**: `Error: Cannot connect to RPC endpoint` or `ECONNREFUSED`

**Solution**:
- Verify RPC URL is correct and accessible
- Test endpoint: `curl -X POST https://rpc.endpoint --header "Content-Type: application/json" --data '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}'`
- Check network conditions and firewalls

```bash
# Test RPC endpoint
curl -X POST https://eth-rpc.example.com \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}'

# Should return: {"jsonrpc":"2.0","result":"0x1","id":1}
```

### Issue: Contract address not found on chain

**Error**: `Error: Contract not found at address` or `No code at address`

**Solution**:
- Verify address is correct (40 hex chars, no 0x prefix in config)
- Check address is on correct network
- Use block explorer to verify: `https://etherscan.io/address/0x...`

```bash
# Verify address has code
curl "https://eth-rpc.example.com" \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_getCode","params":["0xAddress","latest"],"id":1}'

# Should return bytecode (longer than 0x0)
```

## Testing Issues

### Issue: Generated tests don't run

**Error**: `Error: Test file not found` or tests fail

**Solution**:
- Verify `includeTests: true` in configuration
- Check test output directory: `ls dist/*.test.ts`
- Run tests with `npm test` or specific test runner

```bash
# Run generated tests
npm test

# Run specific test file
npm test dist/index.test.ts

# Run with coverage
npm test -- --coverage
```

### Issue: Test imports fail

**Error**: `Cannot find module 'dist'` or `SyntaxError: unexpected token`

**Solution**:
- Generate distribution files: `npm run build`
- Check test setup in `vitest.config.ts` or `jest.config.js`
- Ensure paths in tests match built output

```bash
# Build first
npm run build

# Then run tests
npm test

# Check test configuration
cat vitest.config.ts | grep -A 5 "resolve:"
```

## Publishing Issues

### Issue: Package fails to publish to NPM

**Error**: `403 Forbidden` or `401 Unauthorized`

**Solution**:
- Verify NPM login: `npm whoami`
- Check package name doesn't exist: `npm view @scope/package`
- Update version in package.json
- Authenticate with token if using private registry

```bash
# Login to NPM
npm login

# Or use token
npm set registry https://registry.npmjs.org/
npm set //registry.npmjs.org/:_authToken YOUR_TOKEN

# Verify package name available
npm view @myorg/my-package

# Publish
npm publish
```

## Getting Help

### Enable Verbose Logging

```bash
fost generate --verbose --input api.json
DEBUG=fost:* fost generate --input api.json
```

### Check Version

```bash
fost --version
npm list fost
```

### Report Issues

Include when reporting issues:
1. `fost --version`
2. `node --version`
3. `npm --version`
4. Your configuration file (sanitized)
5. Error output with `--verbose` flag
6. Reproduction steps

```bash
# Collect debug information
fost --version > debug.log
node --version >> debug.log
npm --version >> debug.log
npm list fost >> debug.log
```

## Next Steps

- [Configuration Reference](./configuration.md) - Understand all options
- [CLI Reference](./cli-reference.md) - All commands
- [GitHub Issues](https://github.com/yourrepo/fost/issues) - Community help
