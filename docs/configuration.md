# Configuration Reference

Complete guide to Fost configuration options.

## Configuration File

Create a `fost.config.json` or `fost.config.ts` in your project root:

```json
{
  "fost": {
    "version": "1.0",
    "outputDir": "./dist",
    "cacheDir": ".fost-cache",
    "language": "typescript",
    "strict": true
  }
}
```

## Core Options

### outputDir
- **Type**: string
- **Default**: `./dist`
- **Description**: Directory where generated SDKs are output

```json
{ "outputDir": "./generated-sdk" }
```

### language
- **Type**: `"typescript" | "javascript" | "python" | "go"`
- **Default**: `"typescript"`
- **Description**: Target programming language for generated code

```json
{ "language": "typescript" }
```

### strict
- **Type**: boolean
- **Default**: `false`
- **Description**: Enforce strict validation and type checking

```json
{ "strict": true }
```

### cacheDir
- **Type**: string
- **Default**: `.fost-cache`
- **Description**: Directory for caching generated files

```json
{ "cacheDir": ".cache/fost" }
```

### includeTests
- **Type**: boolean
- **Default**: `true`
- **Description**: Generate test files for the SDK

```json
{ "includeTests": true }
```

### includeDocs
- **Type**: boolean
- **Default**: `true`
- **Description**: Generate documentation files

```json
{ "includeDocs": true }
```

## Input Configuration

### inputs
- **Type**: `Array<InputConfig>`
- **Description**: Array of input specifications to process

```json
{
  "inputs": [
    {
      "type": "openapi",
      "path": "./api.openapi.json",
      "name": "api"
    },
    {
      "type": "web3",
      "path": "./contracts.abi.json",
      "name": "contracts"
    }
  ]
}
```

### input[type]
Supported: `openapi`, `swagger`, `web3`, `graphql`

```json
{
  "type": "openapi",
  "path": "./openapi.yaml",
  "name": "myapi"
}
```

### input[path]
Path to specification file (relative or absolute)

```json
{
  "path": "specs/api.json"
}
```

### input[name]
Name for the generated SDK

```json
{
  "name": "user-api"
}
```

## Output Configuration

### package
- **Type**: string
- **Description**: Package name for generated SDK

```json
{ "package": "@myorg/api-sdk" }
```

### version
- **Type**: string
- **Description**: Initial version for generated SDK

```json
{ "version": "0.1.0" }
```

### author
- **Type**: string
- **Description**: Author information for generated SDK

```json
{ "author": "John Doe <john@example.com>" }
```

## API Configuration

### baseURL
- **Type**: string
- **Description**: Base URL for API client

```json
{
  "api": {
    "baseURL": "https://api.example.com/v1"
  }
}
```

### timeout
- **Type**: number
- **Default**: `30000` (milliseconds)
- **Description**: Request timeout

```json
{
  "api": {
    "timeout": 5000
  }
}
```

### retryPolicy
- **Type**: RetryConfig
- **Description**: Configure retry behavior

```json
{
  "api": {
    "retryPolicy": {
      "maxRetries": 3,
      "backoff": "exponential",
      "initialDelay": 100
    }
  }
}
```

## Authentication Configuration

### auth
- **Type**: AuthConfig
- **Description**: Authentication settings for generated SDK

```json
{
  "auth": {
    "type": "apikey",
    "headerName": "X-API-Key",
    "envVar": "API_KEY"
  }
}
```

### auth[type]
Supported: `apikey`, `bearer`, `oauth2`, `basic`, `custom`

```json
{
  "auth": {
    "type": "oauth2",
    "clientId": "${OAUTH_CLIENT_ID}",
    "clientSecret": "${OAUTH_CLIENT_SECRET}",
    "tokenURL": "https://oauth.example.com/token"
  }
}
```

### auth[envVar]
Environment variable name for sensitive values

```json
{
  "auth": {
    "envVar": "API_KEY"
  }
}
```

## Web3 Configuration

### web3
- **Type**: Web3Config
- **Description**: Web3-specific settings

```json
{
  "web3": {
    "network": "ethereum",
    "rpc": "https://eth-rpc.example.com",
    "chainId": 1
  }
}
```

### web3[network]
Supported: `ethereum`, `polygon`, `arbitrum`, `optimism`, `base`, `avalanche`, `fantom`

```json
{
  "web3": {
    "network": "polygon"
  }
}
```

### web3[rpc]
RPC endpoint URL

```json
{
  "web3": {
    "rpc": "https://polygon-rpc.com"
  }
}
```

### web3[chainId]
Chain ID (required for multi-chain support)

```json
{
  "web3": {
    "chainId": 137
  }
}
```

### web3[explorer]
Block explorer URL

```json
{
  "web3": {
    "explorer": "https://polygonscan.com"
  }
}
```

## Code Generation

### codegen
- **Type**: CodegenConfig
- **Description**: Code generation options

```json
{
  "codegen": {
    "skipValidation": false,
    "prettier": true,
    "eslint": true,
    "comments": true
  }
}
```

### codegen[prettier]
- **Type**: boolean | PrettierConfig
- **Description**: Format generated code with Prettier

```json
{
  "codegen": {
    "prettier": {
      "printWidth": 80,
      "tabWidth": 2,
      "trailingComma": "es5"
    }
  }
}
```

### codegen[eslint]
- **Type**: boolean | ESLintConfig
- **Description**: Lint generated code

```json
{
  "codegen": {
    "eslint": {
      "extends": ["eslint:recommended"],
      "rules": {
        "no-console": "warn"
      }
    }
  }
}
```

### codegen[comments]
- **Type**: boolean
- **Description**: Include JSDoc comments in generated code

```json
{
  "codegen": {
    "comments": true
  }
}
```

## TypeScript Configuration

### typescript
- **Type**: TypeScriptConfig
- **Description**: TypeScript-specific settings

```json
{
  "typescript": {
    "target": "ES2020",
    "module": "ESM",
    "strict": true,
    "declaration": true,
    "sourceMap": true
  }
}
```

### typescript[strict]
- **Type**: boolean
- **Default**: `false`
- **Description**: Enable strict type checking

```json
{
  "typescript": {
    "strict": true
  }
}
```

### typescript[declaration]
- **Type**: boolean
- **Default**: `true`
- **Description**: Generate `.d.ts` declaration files

```json
{
  "typescript": {
    "declaration": true
  }
}
```

## Plugins

### plugins
- **Type**: PluginConfig[]
- **Description**: Enable and configure plugins

```json
{
  "plugins": [
    {
      "name": "validation",
      "enabled": true,
      "options": {
        "strict": true
      }
    },
    {
      "name": "testing",
      "enabled": true,
      "options": {
        "framework": "vitest"
      }
    }
  ]
}
```

## Examples

### Minimal Configuration

```json
{
  "fost": {
    "inputs": [
      {
        "type": "openapi",
        "path": "api.json"
      }
    ],
    "language": "typescript"
  }
}
```

### Standard Web2 Configuration

```json
{
  "fost": {
    "version": "1.0",
    "inputs": [
      {
        "type": "openapi",
        "path": "./specs/api.openapi.yaml",
        "name": "api"
      }
    ],
    "outputDir": "./generated",
    "language": "typescript",
    "strict": true,
    "includeTests": true,
    "includeDocs": true,
    "api": {
      "baseURL": "https://api.example.com/v1",
      "timeout": 10000,
      "retryPolicy": {
        "maxRetries": 3,
        "backoff": "exponential"
      }
    },
    "auth": {
      "type": "apikey",
      "headerName": "Authorization",
      "envVar": "API_KEY"
    },
    "codegen": {
      "prettier": true,
      "eslint": true,
      "comments": true
    },
    "typescript": {
      "strict": true,
      "declaration": true,
      "sourceMap": true
    }
  }
}
```

### Standard Web3 Configuration

```json
{
  "fost": {
    "version": "1.0",
    "inputs": [
      {
        "type": "web3",
        "path": "./contracts/Token.abi.json",
        "name": "token"
      },
      {
        "type": "web3",
        "path": "./contracts/Router.abi.json",
        "name": "router"
      }
    ],
    "outputDir": "./generated",
    "language": "typescript",
    "strict": true,
    "includeTests": true,
    "includeDocs": true,
    "web3": {
      "network": "ethereum",
      "rpc": "https://eth-rpc.example.com",
      "chainId": 1,
      "explorer": "https://etherscan.io"
    },
    "codegen": {
      "prettier": true,
      "comments": true
    },
    "typescript": {
      "strict": true,
      "declaration": true
    }
  }
}
```

### Multi-Input Configuration

```json
{
  "fost": {
    "inputs": [
      {
        "type": "openapi",
        "path": "./specs/api.json",
        "name": "api"
      },
      {
        "type": "graphql",
        "path": "./specs/schema.graphql",
        "name": "graphql"
      },
      {
        "type": "web3",
        "path": "./contracts/Token.abi.json",
        "name": "token"
      }
    ],
    "outputDir": "./sdk",
    "language": "typescript",
    "strict": true,
    "package": "@myorg/unified-sdk",
    "version": "1.0.0"
  }
}
```

## Environment Variables

All string values can reference environment variables:

```json
{
  "api": {
    "baseURL": "${API_BASE_URL}",
    "timeout": "${API_TIMEOUT}"
  },
  "auth": {
    "clientId": "${OAUTH_CLIENT_ID}",
    "clientSecret": "${OAUTH_CLIENT_SECRET}"
  },
  "web3": {
    "rpc": "${RPC_ENDPOINT}"
  }
}
```

Reference them in `.env`:

```bash
API_BASE_URL=https://api.example.com
OAUTH_CLIENT_ID=client123
OAUTH_CLIENT_SECRET=secret456
RPC_ENDPOINT=https://eth-rpc.example.com
```

## Next Steps

- [CLI Reference](./cli-reference.md) - All CLI commands
- [Web2 Guide](./web2-guide.md) - REST API SDKs
- [Web3 Guide](./web3-guide.md) - Smart contract SDKs
