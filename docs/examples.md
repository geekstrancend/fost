# Examples & Real-World Scenarios

Ready-to-use examples for common use cases.

## REST API Examples

### 1. GitHub API SDK

```bash
# Initialize project
mkdir github-sdk && cd github-sdk
npm init -y

# Download OpenAPI spec
curl -o github.openapi.json \
  https://raw.githubusercontent.com/github/rest-api-description/main/openapi.json

# Generate SDK
fost generate \
  --input github.openapi.json \
  --lang typescript \
  --output ./sdk
```

**Usage**:

```typescript
import { GitHubClient } from './sdk';

const client = new GitHubClient({
  token: process.env.GITHUB_TOKEN
});

// Get user repositories
const repos = await client.repos.listForUser({
  username: 'torvalds'
});

repos.forEach(repo => {
  console.log(`${repo.name}: ${repo.description}`);
});

// Create an issue
const issue = await client.issues.create({
  owner: 'yourname',
  repo: 'your-repo',
  title: 'Bug: Something is broken',
  body: 'Description of the issue'
});
```

### 2. Stripe Payment API

```bash
# Download Stripe OpenAPI spec
curl -o stripe.openapi.json \
  https://raw.githubusercontent.com/stripe/openapi/master/openapi/spec3.json

# Configuration
cat > fost.config.json << 'EOF'
{
  "fost": {
    "inputs": [{
      "type": "openapi",
      "path": "stripe.openapi.json"
    }],
    "language": "typescript",
    "outputDir": "./stripe-sdk",
    "auth": {
      "type": "bearer",
      "envVar": "STRIPE_API_KEY"
    }
  }
}
EOF

# Generate
fost generate
```

**Usage**:

```typescript
import { StripeClient } from './stripe-sdk';

const stripe = new StripeClient({
  apiKey: process.env.STRIPE_API_KEY
});

// Create payment intent
const intent = await stripe.paymentIntents.create({
  amount: 2000, // $20.00
  currency: 'usd',
  payment_method_types: ['card']
});

// Get customer
const customer = await stripe.customers.retrieve('cus_...');

// List transactions
const charges = await stripe.charges.list({
  limit: 10
});
```

### 3. Shopify Admin API

```bash
cat > fost.config.json << 'EOF'
{
  "fost": {
    "inputs": [{
      "type": "openapi",
      "path": "shopify.openapi.json"
    }],
    "api": {
      "baseURL": "https://${SHOP_NAME}.myshopify.com/admin/api/2024-01"
    },
    "auth": {
      "type": "bearer",
      "headerName": "X-Shopify-Access-Token",
      "envVar": "SHOPIFY_ACCESS_TOKEN"
    }
  }
}
EOF

fost generate
```

**Usage**:

```typescript
import { ShopifyClient } from './shopify-sdk';

const shopify = new ShopifyClient({
  baseURL: `https://${process.env.SHOP_NAME}.myshopify.com/admin/api/2024-01`,
  accessToken: process.env.SHOPIFY_ACCESS_TOKEN
});

// List products
const products = await shopify.products.list({
  limit: 50,
  fields: 'id,title,vendor,product_type'
});

// Create product
const product = await shopify.products.create({
  title: 'New T-Shirt',
  vendor: 'MyBrand',
  product_type: 'Apparel'
});

// Update inventory
await shopify.inventory_levels.adjust({
  inventory_item_id: '...',
  available_adjustment: 10
});
```

## Web3 Smart Contract Examples

### 1. ERC20 Token Integration

```bash
# Download ERC20 ABI
cat > erc20.abi.json << 'EOF'
[
  {
    "type": "function",
    "name": "transfer",
    "inputs": [
      { "name": "to", "type": "address" },
      { "name": "amount", "type": "uint256" }
    ],
    "outputs": [{ "name": "", "type": "bool" }]
  },
  {
    "type": "function",
    "name": "balanceOf",
    "inputs": [{ "name": "account", "type": "address" }],
    "outputs": [{ "name": "", "type": "uint256" }],
    "stateMutability": "view"
  }
]
EOF

# Generate SDK
fost generate \
  --type web3 \
  --input erc20.abi.json \
  --chain ethereum \
  --name erc20-token
```

**Usage**:

```typescript
import { ERC20Client } from './erc20-token-sdk';
import { ethers } from 'ethers';

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

// USDC token on Ethereum
const usdc = new ERC20Client(
  '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
  signer
);

// Check balance
const balance = await usdc.balanceOf('0xuser...');
console.log(`USDC Balance: ${ethers.formatUnits(balance, 6)}`);

// Transfer tokens
const tx = await usdc.transfer(
  '0xrecipient...',
  ethers.parseUnits('100', 6)
);
await tx.wait();
console.log('Transfer confirmed');
```

### 2. Uniswap V3 Trading

```bash
cat > fost.config.json << 'EOF'
{
  "fost": {
    "inputs": [
      {
        "type": "web3",
        "path": "uniswap-router.abi.json",
        "name": "uniswap"
      },
      {
        "type": "web3",
        "path": "erc20.abi.json",
        "name": "erc20"
      }
    ],
    "web3": {
      "network": "ethereum",
      "rpc": "https://eth-rpc.example.com",
      "chainId": 1
    }
  }
}
EOF

fost generate
```

**Usage**:

```typescript
import { UniswapClient, ERC20Client } from './sdk';
import { ethers } from 'ethers';

const signer = new ethers.Wallet(process.env.PRIVATE_KEY);

const weth = new ERC20Client('0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', signer);
const router = new UniswapClient('0xE592427A0AEce92De3Edee1F18E0157C05861564', signer);

// 1. Approve router to spend WETH
const approveTx = await weth.approve(
  router.address,
  ethers.parseEther('10')
);
await approveTx.wait();

// 2. Swap WETH to USDC
const swapTx = await router.exactInputSingle({
  tokenIn: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', // WETH
  tokenOut: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // USDC
  fee: 3000,
  recipient: await signer.getAddress(),
  deadline: Math.floor(Date.now() / 1000) + 60 * 20,
  amountIn: ethers.parseEther('1'),
  amountOutMinimum: '0'
});

console.log('Swap transaction:', swapTx.hash);
const receipt = await swapTx.wait();
```

### 3. Multi-Chain Contract Interaction

```bash
cat > fost.config.json << 'EOF'
{
  "fost": {
    "inputs": [
      {
        "type": "web3",
        "path": "token.abi.json",
        "name": "token"
      }
    ],
    "web3": {
      "networks": [
        {
          "name": "ethereum",
          "chainId": 1,
          "rpc": "https://eth-rpc.example.com"
        },
        {
          "name": "polygon",
          "chainId": 137,
          "rpc": "https://polygon-rpc.com"
        },
        {
          "name": "arbitrum",
          "chainId": 42161,
          "rpc": "https://arb1.arbitrum.io/rpc"
        }
      ]
    }
  }
}
EOF

fost generate
```

**Usage**:

```typescript
import { TokenClient } from './sdk';
import { ethers } from 'ethers';

const networks = {
  ethereum: 'https://eth-rpc.example.com',
  polygon: 'https://polygon-rpc.com',
  arbitrum: 'https://arb1.arbitrum.io/rpc'
};

// Interact with token on different chains
const getTokenBalance = async (chain: keyof typeof networks, address: string) => {
  const provider = new ethers.JsonRpcProvider(networks[chain]);
  const token = new TokenClient(address, provider);
  return await token.balanceOf('0xuser...');
};

// Check balance on all chains
for (const chain of Object.keys(networks) as Array<keyof typeof networks>) {
  const balance = await getTokenBalance(chain, '0xtoken...');
  console.log(`${chain}: ${ethers.formatUSDC(balance, 18)}`);
}
```

## Real-World Integration Examples

### 1. E-Commerce Platform  

```typescript
import { ShopifyClient } from './shopify-sdk';
import { StripeClient } from './stripe-sdk';

class ECommerceService {
  shopify: ShopifyClient;
  stripe: StripeClient;

  constructor() {
    this.shopify = new ShopifyClient({
      accessToken: process.env.SHOPIFY_TOKEN
    });
    this.stripe = new StripeClient({
      apiKey: process.env.STRIPE_KEY
    });
  }

  async processOrder(productId: string, quantity: number) {
    // Get product from Shopify
    const product = await this.shopify.products.get(productId);
    
    // Create Stripe payment intent
    const intent = await this.stripe.paymentIntents.create({
      amount: product.price * quantity * 100,
      currency: 'usd'
    });

    // Update inventory
    await this.shopify.inventory_levels.adjust({
      inventory_item_id: product.variants[0].inventory_item_id,
      available_adjustment: -quantity
    });

    return intent;
  }
}
```

### 2. DeFi Protocol Dashboard

```typescript
import { UniswapClient, AaveClient, CurveClient } from './sdk';

class DeFiPortfolio {
  uniswap: UniswapClient;
  aave: AaveClient;
  curve: CurveClient;

  constructor(signer: ethers.Signer) {
    this.uniswap = new UniswapClient('0xUniswap...', signer);
    this.aave = new AaveClient('0xAave...', signer);
    this.curve = new CurveClient('0xCurve...', signer);
  }

  async getPortfolioValue() {
    const uniPositions = await this.uniswap.positions.get();
    const aaveAssets = await this.aave.getUserAccountData();
    const curveBalance = await this.curve.balanceOf(this.userAddress);

    return {
      uniswap: uniPositions.reduce((sum, p) => sum + p.value, 0),
      aave: aaveAssets.totalCollateralUSD,
      curve: curveBalance
    };
  }

  async rebalance() {
    const portfolio = await this.getPortfolioValue();
    
    if (portfolio.aave > portfolio.uniswap) {
      // Move liquidity from Aave to Uniswap
      const amount = portfolio.aave * 0.1;
      await this.aave.withdraw(amount);
      await this.uniswap.addLiquidity(amount);
    }
  }
}
```

### 3. API Monitoring Service

```typescript
import { GitHubClient, SlackClient, DatadogClient } from './sdk';

class APIMonitor {
  github: GitHubClient;
  slack: SlackClient;
  datadog: DatadogClient;

  async checkRepositoryHealth(owner: string, repo: string) {
    // Get repo metrics
    const repoData = await this.github.repos.get({ owner, repo });
    const issues = await this.github.issues.listForRepo({ owner, repo });
    const tests = await this.github.checks.listForRepo({ owner, repo });

    const health = {
      openIssues: issues.length,
      failedTests: tests.filter(t => t.status === 'failed').length,
      lastUpdate: repoData.updated_at
    };

    // Log to Datadog
    await this.datadog.metrics.send({
      metric: 'repo.health',
      value: health.openIssues + health.failedTests,
      tags: [`repo:${repo}`, `owner:${owner}`]
    });

    // Alert if unhealthy
    if (health.failedTests > 5) {
      await this.slack.messages.send({
        channel: '#alerts',
        text: `⚠️ ${repo} has ${health.failedTests} failed tests`
      });
    }
  }
}
```

## Testing Generated SDKs

### E2E Test Example

```typescript
import { describe, it, expect, beforeAll } from 'vitest';
import { APIClient } from './sdk';

describe('API Client E2E Tests', () => {
  let client: APIClient;

  beforeAll(() => {
    client = new APIClient({
      baseURL: 'https://api.example.com',
      apiKey: process.env.TEST_API_KEY
    });
  });

  it('should list users', async () => {
    const users = await client.users.list();
    expect(users).toBeDefined();
    expect(Array.isArray(users)).toBe(true);
  });

  it('should create and retrieve user', async () => {
    const created = await client.users.create({
      name: 'Test User',
      email: 'test@example.com'
    });
    
    const retrieved = await client.users.get(created.id);
    expect(retrieved.email).toBe('Test User');
  });

  it('should handle errors gracefully', async () => {
    expect(
      client.users.get('invalid-id')
    ).rejects.toThrow();
  });
});
```

## Publishing Examples

### Publish to NPM

```bash
# Update version
npm version minor

# Add files to .npmignore
cat > .npmignore << 'EOF'
src/
*.test.ts
vitest.config.ts
.env*
EOF

# Publish
npm publish
```

### Use Published SDK

```bash
npm install @myorg/my-sdk

import { MyAPIClient } from '@myorg/my-sdk';

const client = new MyAPIClient({
  apiKey: process.env.API_KEY
});
```

## Next Steps

- Check out [Web2 Guide](./web2-guide.md) for more REST API examples
- See [Web3 Guide](./web3-guide.md) for more smart contract examples
- Read [Configuration Reference](./configuration.md) for all options
