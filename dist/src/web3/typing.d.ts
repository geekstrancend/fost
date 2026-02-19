/**
 * Web3 Typing - Strict Type Safety for Web3 SDKs
 * Provides powerful type checking for blockchain operations
 */
/**
 * Ethereum address type (40 hex chars, no 0x prefix in type, but included in values)
 */
export type Address = string & {
    readonly __brand: 'Address';
};
/**
 * Create Address type
 */
export declare function address(value: string): Address;
/**
 * Chain ID type
 */
export type ChainId = number & {
    readonly __brand: 'ChainId';
};
export declare const CHAIN_IDS: {
    readonly ETHEREUM: 1;
    readonly SEPOLIA: 11155111;
    readonly POLYGON: 137;
    readonly ARBITRUM: 42161;
    readonly OPTIMISM: 10;
    readonly BASE: 8453;
    readonly SOLANA: 101;
};
/**
 * Create ChainId type
 */
export declare function chainId(value: number): ChainId;
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
export type TxHash = string & {
    readonly __brand: 'TxHash';
};
export declare function txHash(value: string): TxHash;
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
export declare function validateTransactionOptions(opts: TransactionOptions): void;
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
//# sourceMappingURL=typing.d.ts.map