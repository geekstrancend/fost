# Web2 SDK Generation Guide

Generate production-ready SDKs from REST APIs and GraphQL schemas.

## Supported Formats

### OpenAPI 3.0+
- Full OpenAPI 3.0 and 3.1 support
- Security schemes (API key, OAuth 2.0, JWT)
- Request/response validation
- Status code handling
- Custom headers and authentication

### Swagger 2.0
- Legacy Swagger specifications
- Basic authentication patterns
- Type definitions from parameters and responses

## Getting Started

### 1. Prepare Your API Specification

```bash
# Download from URL
curl -o api.openapi.yaml https://api.example.com/openapi.json

# Or use local file
ls api.openapi.yaml
```

### 2. Generate SDK

```bash
fost generate \
  --input api.openapi.yaml \
  --lang typescript \
  --output ./sdk
```

### 3. Use Generated SDK

```typescript
import { ApiClient } from './sdk';

const client = new ApiClient({
  baseURL: 'https://api.example.com',
  apiKey: process.env.API_KEY
});

// Fully typed!
const users = await client.users.list({ limit: 10 });
const user = await client.users.get(users[0].id);
```

## Configuration

### OpenAPI-Specific Options

```json
{
  "fost": {
    "outputDir": "./sdk",
    "includeTests": true,
    "includeDocs": true,
    "strict": true,
    "auth": {
      "apiKey": {
        "headerName": "X-API-Key",
        "envVar": "API_KEY"
      },
      "oauth": {
        "tokenURL": "https://oauth.example.com/token",
        "scopes": ["read", "write"]
      }
    }
  }
}
```

## Authentication Patterns

### API Key

```typescript
const client = new ApiClient({
  apiKey: process.env.API_KEY
});
```

### OAuth 2.0

```typescript
const client = new ApiClient({
  oauth: {
    clientId: process.env.OAUTH_CLIENT_ID,
    clientSecret: process.env.OAUTH_CLIENT_SECRET,
    tokenURL: 'https://oauth.example.com/token'
  }
});
```

### Custom Headers

```typescript
const client = new ApiClient({
  headers: {
    'X-Custom-Header': 'value',
    'Authorization': `Bearer ${token}`
  }
});
```

## Advanced Features

### Request Validation

```typescript
// Generated SDK validates all requests
try {
  await client.users.create({
    email: 'invalid-email', // Validation error
    name: 'John'
  });
} catch (error) {
  if (error instanceof ValidationError) {
    console.log(error.details);
  }
}
```

### Response Transformation

```typescript
// Responses are automatically typed and validated
const response = await client.users.list();
response.users.forEach(user => {
  // IDE autocomplete works - fully typed!
  console.log(user.id, user.email);
});
```

### Error Handling

```typescript
import { ApiError, ValidationError, NetworkError } from './sdk';

try {
  await client.api.call();
} catch (error) {
  if (error instanceof ApiError) {
    // API returned an error
    console.log(error.status, error.message);
  } else if (error instanceof ValidationError) {
    // Request validation failed
    console.log(error.details);
  } else if (error instanceof NetworkError) {
    // Network request failed
    console.log(error.cause);
  }
}
```

## Examples

### E-commerce API

```bash
fost generate \
  --input https://api.shopify.com/openapi.json \
  --lang typescript \
  --output ./shopify-sdk
```

```typescript
import { ShopifyClient } from './shopify-sdk';

const client = new ShopifyClient({
  shop: 'mystore.myshopify.com',
  accessToken: process.env.SHOPIFY_TOKEN
});

const products = await client.products.list();
const orders = await client.orders.list({ status: 'fulfilled' });
```

### Payment API

```bash
fost generate \
  --input stripe-openapi.json \
  --lang typescript \
  --output ./stripe-sdk
```

```typescript
import { StripeClient } from './stripe-sdk';

const client = new StripeClient({
  apiKey: process.env.STRIPE_API_KEY
});

const charge = await client.charges.create({
  amount: 2000,
  currency: 'usd',
  sourceId: 'tok_visa'
});
```

## Testing Generated SDKs

```bash
# Run generated tests
npm test

# With coverage
npm test -- --coverage

# Watch mode
npm test -- --watch
```

## Deployment

### NPM Package

```bash
# Build
npm run build

# Publish
npm publish

# Use in other projects
npm install @myorg/api-sdk
```

### Monorepo Integration

```bash
# Generate to specific workspace
fost generate api.json --output ./packages/sdk
```

## Troubleshooting

### Issue: Type Errors

```bash
# Enable strict mode for better validation
fost generate api.json --strict

# Check generated types
cat sdk/types.ts
```

### Issue: Missing Endpoints

```bash
# Validate spec first
fost validate api.json

# Check for syntax errors
jest --testPathPattern=validation
```

### Issue: Authentication Errors

```bash
# Debug authentication
DEBUG=1 fost generate api.json --verbose
```

## Best Practices

1. **Version Your Specs**: Keep API specs in version control
2. **Regenerate Regularly**: Keep SDKs in sync with API changes
3. **Document Custom Types**: Add JSDoc comments to generated code
4. **Test Integration**: Write integration tests for critical paths
5. **Monitor Breaking Changes**: Review generated code diffs

## Next Steps

- [Web3 Guide](./web3-guide.md) - Smart contract SDKs
- [CLI Reference](./cli-reference.md) - Complete command reference
- [Examples](./examples.md) - Real-world examples
