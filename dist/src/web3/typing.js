"use strict";
/**
 * Web3 Typing - Strict Type Safety for Web3 SDKs
 * Provides powerful type checking for blockchain operations
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CHAIN_IDS = void 0;
exports.address = address;
exports.chainId = chainId;
exports.txHash = txHash;
exports.validateTransactionOptions = validateTransactionOptions;
/**
 * Create Address type
 */
function address(value) {
    if (!value.match(/^0x[a-fA-F0-9]{40}$/)) {
        throw new Error(`Invalid address: ${value}`);
    }
    return value;
}
exports.CHAIN_IDS = {
    ETHEREUM: 1,
    SEPOLIA: 11155111,
    POLYGON: 137,
    ARBITRUM: 42161,
    OPTIMISM: 10,
    BASE: 8453,
    SOLANA: 101,
};
/**
 * Create ChainId type
 */
function chainId(value) {
    const validChains = Object.values(exports.CHAIN_IDS);
    if (!validChains.includes(value)) {
        throw new Error(`Invalid chain ID: ${value}`);
    }
    return value;
}
function txHash(value) {
    if (!value.match(/^0x[a-fA-F0-9]{64}$/)) {
        throw new Error(`Invalid transaction hash: ${value}`);
    }
    return value;
}
/**
 * Validate transaction options
 */
function validateTransactionOptions(opts) {
    if (opts.value && opts.value < 0n) {
        throw new Error('Transaction value cannot be negative');
    }
    if (opts.gasLimit && opts.gasLimit < 21000n) {
        throw new Error('Gas limit must be at least 21000');
    }
}
//# sourceMappingURL=typing.js.map