/**
 * Web3 Typing - Strict Type Safety for Web3 SDKs
 * Provides powerful type checking for blockchain operations
 */

/**
 * Ethereum address type (40 hex chars, no 0x prefix in type, but included in values)
 */
export type Address = string & { readonly __brand: 'Address' };

/**
 * Create Address type
 */
export function address(value: string): Address {
  if (!value.match(/^0x[a-fA-F0-9]{40}$/)) {
    throw new Error(`Invalid address: ${value}`);
  }
  return value as Address;
}

/**
 * Chain ID type
 */
export type ChainId = number & { readonly __brand: 'ChainId' };

export const CHAIN_IDS = {
  ETHEREUM: 1,
  SEPOLIA: 11155111,
  POLYGON: 137,
  ARBITRUM: 42161,
  OPTIMISM: 10,
  BASE: 8453,
  SOLANA: 101,
} as const;

/**
 * Create ChainId type
 */
export function chainId(value: number): ChainId {
  const validChains = Object.values(CHAIN_IDS);
  if (!validChains.includes(value)) {
    throw new Error(`Invalid chain ID: ${value}`);
  }
  return value as ChainId;
}

/**
 * Amount with decimals
 */
export interface Amount {
  value: bigint;
  decimals: number;
}

/**
 * Transaction hash type
 */
export type TxHash = string & { readonly __brand: 'TxHash' };

export function txHash(value: string): TxHash {
  if (!value.match(/^0x[a-fA-F0-9]{64}$/)) {
    throw new Error(`Invalid transaction hash: ${value}`);
  }
  return value as TxHash;
}

/**
 * Contract ABI type
 */
export type ContractABI = Array<{
  type: string;
  name: string;
  inputs?: any[];
  outputs?: any[];
  stateMutability?: string;
}>;

/**
 * Transaction options with strict typing
 */
export interface TransactionOptions {
  from: Address;
  to: Address;
  value?: bigint;
  data?: string;
  gasLimit?: bigint;
  gasPrice?: bigint;
  nonce?: number;
  chainId?: ChainId;
}

/**
 * Validate transaction options
 */
export function validateTransactionOptions(opts: TransactionOptions): void {
  if (opts.value && opts.value < 0n) {
    throw new Error('Transaction value cannot be negative');
  }

  if (opts.gasLimit && opts.gasLimit < 21000n) {
    throw new Error('Gas limit must be at least 21000');
  }
}

/**
 * Web3 SDK client interface with strict typing
 */
export interface Web3SDKClient {
  readonly chainId: ChainId;
  readonly address: Address;

  /**
   * Send transaction with validation
   */
  sendTransaction(opts: TransactionOptions): Promise<TxHash>;

  /**
   * Call contract method (read-only)
   */
  call(address: Address, data: string): Promise<string>;

  /**
   * Get account balance
   */
  getBalance(address: Address): Promise<Amount>;
}
