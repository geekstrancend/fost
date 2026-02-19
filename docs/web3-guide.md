# Web3 Smart Contract SDK Generation

Generate type-safe SDKs for Ethereum smart contracts and Web3 interactions.

## Supported Formats

### Contract ABIs
- Solidity ABI JSON format
- Multiple contract support
- Event definitions
- Constructor parameters
- Function overloads

### Blockchain Networks
- Ethereum mainnet and testnets
- Polygon, Arbitrum, Optimism
- Base, Avalanche, Fantom
- Custom RPC endpoints

## Getting Started

### 1. Prepare Contract ABI

```json
[
  {
    "type": "function",
    "name": "transfer",
    "inputs": [
      { "name": "to", "type": "address" },
      { "name": "amount", "type": "uint256" }
    ],
    "outputs": [
      { "name": "", "type": "bool" }
    ],
    "stateMutability": "nonpayable"
  }
]
```

### 2. Generate SDK

```bash
fost generate \
  --type web3 \
  --input contract.abi.json \
  --chain ethereum \
  --lang typescript \
  --output ./contract-sdk
```

### 3. Use Generated SDK

```typescript
import { ContractClient } from './contract-sdk';
import { ethers } from 'ethers';

const provider = new ethers.JsonRpcProvider('https://eth-rpc.example.com');
const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

const contract = new ContractClient(
  '0x1234567890123456789012345678901234567890',
  signer
);

// Fully typed interactions!
const tx = await contract.transfer('0xabcd...', ethers.parseEther('1.0'));
await tx.wait();
```

## Contract Interactions

### Read-Only Functions

```typescript
// Call view functions (no gas cost)
const balance = await contract.balanceOf('0xuser...');
const decimals = await contract.decimals();
const totalSupply = await contract.totalSupply();
```

### State-Modifying Functions

```typescript
// Send transactions (costs gas)
const tx = await contract.approve(
  '0xspender...',
  ethers.parseEther('100')
);
const receipt = await tx.wait();

console.log('Approved in', receipt?.blockNumber);
```

## Event Handling

```typescript
// Listen to contract events
const filter = contract.filters.Transfer('0xuser...', null);
const events = await contract.queryFilter(filter, -1000);

events.forEach(event => {
  console.log(`${event.args.from} → ${event.args.to}: ${event.args.value}`);
});

// Subscribe to real-time events
contract.on('Transfer', (from, to, amount, event) => {
  console.log(`Transfer: ${from} → ${to}, ${amount}`);
});
```

## Configuration

### Contract Configuration

```json
{
  "fost": {
    "web3": {
      "contracts": [
        {
          "name": "ERC20",
          "address": "0x1234...",
          "abi": "contract.abi.json",
          "network": "ethereum"
        }
      ],
      "rpc": "https://eth-rpc.example.com",
      "explorer": "https://etherscan.io",
      "includeEvents": true,
      "includeErrors": true,
      "strict": true
    }
  }
}
```

### Network Configuration

```typescript
import { ContractClient } from './contract-sdk';
import { Provider, Network } from 'ethers';

const networks = {
  ethereum: {
    rpc: 'https://eth-rpc.example.com',
    chainId: 1,
    explorer: 'https://etherscan.io'
  },
  polygon: {
    rpc: 'https://polygon-rpc.com',
    chainId: 137,
    explorer: 'https://polygonscan.com'
  },
  arbitrum: {
    rpc: 'https://arb1.arbitrum.io/rpc',
    chainId: 42161,
    explorer: 'https://arbiscan.io'
  }
};
```

## Advanced Features

### Multi-Contract Interactions

```typescript
import { ERC20Client } from './erc20-sdk';
import { UniswapV3Client } from './uniswap-sdk';

const token = new ERC20Client('0xToken...', signer);
const uniswap = new UniswapV3Client('0xRouter...', signer);

// Approve and swap in one flow
await token.approve(uniswap.address, ethers.parseEther('100'));
const tx = await uniswap.exactInputSingle({
  tokenIn: token.address,
  tokenOut: '0xUSDC...',
  fee: 3000,
  recipient: await signer.getAddress(),
  amountIn: ethers.parseEther('100'),
  amountOutMinimum: '0'
});
```

### Gas Estimation

```typescript
// Estimate gas costs
const gasEstimate = await contract.transfer.estimateGas(
  '0xrecipient...',
  ethers.parseEther('1.0')
);

// Add safety margin
const gasLimit = (gasEstimate * 120n) / 100n;

const tx = await contract.transfer(
  '0xrecipient...',
  ethers.parseEther('1.0'),
  { gasLimit }
);
```

### Error Handling

```typescript
import { ContractError } from './contract-sdk';

try {
  await contract.transfer('0x0000...', '0');
} catch (error) {
  if (error instanceof ContractError) {
    // Solidity revert reason
    console.log('Revert:', error.reason);
    console.log('Data:', error.data);
  } else if (error instanceof Error) {
    console.log('Error:', error.message);
  }
}
```

## Examples

### ERC20 Token

```bash
fost generate \
  --type web3 \
  --input erc20.abi.json \
  --chain ethereum \
  --output ./erc20-sdk
```

```typescript
import { ERC20Client } from './erc20-sdk';

const token = new ERC20Client('0x...', signer);

// Transfer tokens
await token.transfer('0xrecipient...', ethers.parseUnits('100', 18));

// Check balance
const balance = await token.balanceOf('0xuser...');
console.log('Balance:', ethers.formatUnits(balance, 18));
```

### Uniswap V3

```bash
fost generate \
  --type web3 \
  --input uniswap-v3.abi.json \
  --chain ethereum \
  --output ./uniswap-sdk
```

```typescript
import { UniswapV3RouterClient } from './uniswap-sdk';

const router = new UniswapV3RouterClient('0xE592427A0AEce92De3Edee1F18E0157C05861564', signer);

// Exact input swap
const tx = await router.exactInputSingle({
  tokenIn: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', // WETH
  tokenOut: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // USDC
  fee: 3000,
  recipient: await signer.getAddress(),
  deadline: Math.floor(Date.now() / 1000) + 60 * 20,
  amountIn: ethers.parseEther('1'),
  amountOutMinimum: '0'
});
```

### Custom Protocol

```bash
fost generate \
  --type web3 \
  --input custom-protocol.abi.json \
  --chain polygon \
  --output ./protocol-sdk
```

## Testing

### Unit Tests

```typescript
import { ContractClient } from './contract-sdk';
import { ethers } from 'ethers';

describe('ContractClient', () => {
  it('should transfer tokens', async () => {
    const signer = ethers.Wallet.createRandom();
    const contract = new ContractClient('0x...', signer);
    
    const tx = await contract.transfer('0xto...', '100');
    expect(tx.hash).toBeDefined();
  });

  it('should read contract state', async () => {
    const contract = new ContractClient('0x...', signer);
    const balance = await contract.balanceOf('0xuser...');
    expect(balance).toBeGreaterThanOrEqual(0);
  });
});
```

### Integration Tests

```typescript
// Test against live testnet
const provider = new ethers.JsonRpcProvider(
  'https://sepolia.infura.io/v3/' + process.env.INFURA_KEY
);

const contract = new ContractClient('0x...', signer);
const events = await contract.queryFilter(contract.filters.Transfer());

expect(events.length).toBeGreaterThan(0);
```

## Deployment

### Publish SDK Package

```bash
# Build
npm run build

# Setup package.json
npm init

# Publish
npm publish @myorg/contract-sdk
```

### Version Management

```bash
# Update when contract upgrades
npm version minor

# Publish new version
npm publish
```

## Best Practices

1. **Always Estimate Gas**: Use estimateGas before sending transactions
2. **Handle Decimals**: Use parseUnits/formatUnits for token amounts
3. **Set Deadlines**: Always set deadline for swap/time-sensitive operations
4. **Verify Addresses**: Always verify your addresses (checksums)
5. **Test on Testnet**: Deploy to testnet before mainnet
6. **Monitor Events**: Listen for contract events for real-time updates

## Common Patterns

### Balance Checking

```typescript
const balance = await token.balanceOf(address);
const formatted = ethers.formatUnits(balance, decimals);
console.log(`Balance: ${formatted} tokens`);
```

### Allowance and Approval

```typescript
const allowance = await token.allowance(owner, spender);
if (allowance < amount) {
  const approveTx = await token.approve(spender, amount);
  await approveTx.wait();
}
```

### Safe Transfer

```typescript
try {
  const tx = await token.transfer(to, amount);
  const receipt = await tx.wait();
  return receipt?.blockNumber;
} catch (error) {
  console.error('Transfer failed:', error);
  return null;
}
```

## Next Steps

- [Configuration Reference](./configuration.md) - All config options
- [CLI Reference](./cli-reference.md) - Command reference
- [Examples](./examples.md) - Real-world examples
