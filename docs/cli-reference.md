# CLI Reference

Complete reference of all Fost CLI commands and options.

## Getting Help

```bash
fost help                  # Show main help
fost help <command>        # Help for specific command
fost generate --help       # Help for generate command
```

## Commands

### generate

Generate SDK from specification.

```bash
fost generate --input <spec> [options]
```

**Required Options:**
- `--input, -i <file>` - Input specification file (OpenAPI, GraphQL, ABI)
- `--lang, -l <language>` - Target language (typescript, python, etc.)
- `--type <type>` - API type (web2, web3)

**Optional Options:**
- `--output, -o <dir>` - Output directory (default: ./sdk)
- `--name <name>` - SDK package name
- `--version <version>` - SDK version
- `--config <file>` - Configuration file
- `--skip-tests` - Don't generate tests
- `--skip-docs` - Don't generate documentation
- `--strict` - Enable strict validation
- `--verbose` - Verbose output
- `--json` - Output as JSON

**Examples:**
```bash
# Basic
fost generate api.openapi.yaml --lang typescript --type web2

# Custom output
fost generate api.yaml --lang typescript --type web2 --output ./my-sdk

# Python SDK
fost generate api.yaml --lang python --type web2

# Web3 smart contract
fost generate contract.abi.json --lang typescript --type web3

# With config
fost generate api.yaml --lang typescript --type web2 --config .fostrc
```

### validate

Validate input specification without generating code.

```bash
fost validate --input <spec> [options]
```

**Required Options:**
- `--input, -i <file>` - Input specification file

**Optional Options:**
- `--type <type>` - API type (web2, web3)
- `--strict` - Enable strict validation
- `--json` - Output as JSON

**Exit Codes:**
- 0 - Valid specification
- 3 - Validation errors

**Examples:**
```bash
# Validate OpenAPI
fost validate --input api.openapi.yaml

# Strict validation
fost validate --input api.yaml --strict

# Check Web3
fost validate --input contract.abi.json --type web3
```

### config

Manage Fost configuration.

```bash
fost config <subcommand>
```

**Subcommands:**
- `show` - Display current configuration
- `set <key> <value>` - Set configuration value
- `list` - List all settings
- `reset` - Reset to defaults

**Examples:**
```bash
fost config show
fost config set outputDir ./gen
fost config set language python
fost config list
fost config reset
```

### test

Run generated SDK tests.

```bash
fost test [options]
```

**Optional Options:**
- `--path <dir>` - SDK directory (default: ./sdk)
- `--coverage` - Generate coverage report
- `--watch` - Watch mode

**Examples:**
```bash
fost test --path ./generated-sdk --coverage
fost test --watch
```

### lint

Lint generated SDK code.

```bash
fost lint [options]
```

**Optional Options:**
- `--path <dir>` - SDK directory (default: ./sdk)
- `--fix` - Auto-fix issues
- `--strict` - Strict linting

**Examples:**
```bash
fost lint --path ./sdk
fost lint --fix --strict
```

### version

Display Fost version.

```bash
fost version
fost -v
fost --version
```

**Output:**
```
fost 0.1.0
```

### help

Show help message.

```bash
fost help                 # Main help
fost help generate        # Help for generate command
fost -h
fost --help
```

## Global Options

These work with any command:

- `--verbose` - Detailed output
- `--quiet, -q` - Minimal output
- `--color` - Force colored output
- `--no-color` - Disable colors
- `--json` - Output as JSON
- `--debug` - Debug mode (implies --verbose)

**Examples:**
```bash
fost generate api.yaml --lang ts --type web2 --verbose
fost validate api.yaml --color
fost config show --json
```

## Environment Variables

- `DEBUG=1` - Enable debug mode
- `NO_COLOR=1` - Disable colored output
- `FOST_CONFIG=path/to/config.json` - Config file path

**Examples:**
```bash
DEBUG=1 fost generate api.yaml --lang typescript --type web2
NO_COLOR=1 fost --version
FOST_CONFIG=.fostrc fost generate api.yaml --lang typescript --type web2
```

## Exit Codes

- `0` - Success
- `1` - Runtime error
- `2` - CLI usage error (invalid arguments)
- `3` - Validation error (invalid spec)
- `4` - Generation error
- `5` - File system error (file not found)
- `130` - User abort (Ctrl+C)

## Examples

### Full Workflow

```bash
# Validate first
fost validate api.openapi.yaml --strict

# Generate SDK
fost generate api.openapi.yaml \
  --lang typescript \
  --type web2 \
  --output ./petstore-sdk \
  --name petstore \
  --version 1.0.0

# Test the SDK
fost test --path ./petstore-sdk --coverage

# Lint the code
fost lint --path ./petstore-sdk --fix
```

### With Configuration

```bash
# Create config
cat > .fostrc << EOF
{
  "outputDir": "./sdk",
  "language": "typescript",
  "strict": true
}
EOF

# Use config
fost generate api.yaml --config .fostrc
```

---

For more details on each command, use `fost <command> --help`
