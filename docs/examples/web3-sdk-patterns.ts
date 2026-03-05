/**
 * WEB3 SDK USAGE PATTERNS
 * 
 * Best practices and patterns for using generated Web3 SDKs.
 * Emphasizes correctness, explicit state handling, and clarity.
 */

// ============================================================================
// PATTERN 1: WALLET CONNECTION WITH EXPLICIT STATE TRACKING
// ============================================================================

/**
 * Best Practice: Always check connection state before operations
 * 
 * This pattern ensures you know the wallet state at each step.
 * Prevents silent failures or unexpected behaviors.
 */

/*
Example Code:

import { UniswapSDK, WalletConnectionState } from '@uniswap/sdk-web3';

const sdk = new UniswapSDK({
  chainId: 'ethereum-mainnet',
  rpcUrl: 'https://eth-mainnet.alchemyapi.io/v2/YOUR_KEY',
  confirmationStrategy: {
    strategy: 'block_confirmations',
    blockConfirmations: 12,
    timeoutMs: 300000, // 5 minutes
    polling: { enabled: true, intervalMs: 1000, maxRetries: 300 }
  }
});

// Step 1: Connect wallet with explicit state tracking
async function setupWallet() {
  console.log('Current state:', sdk.wallet.getState());
  
  try {
    const connection = await sdk.connectWallet({
      walletType: 'metamask',
      autoSwitchChain: true,
      timeoutMs: 30000
    });
    
    // Check explicit connection state
    if (connection.state === WalletConnectionState.CONNECTED) {
      console.log('Connected to:', connection.address);
      console.log('Chain:', connection.chainId);
    } else if (connection.state === WalletConnectionState.WRONG_CHAIN) {
      console.log('Wallet on wrong chain:', connection.chainId);
      console.log('Please switch to required chain');
    } else {
      throw new Error(`Unexpected connection state: ${connection.state}`);
    }
  } catch (error) {
    if (error.code === 'WALLET_CONNECTION_FAILED') {
      console.error('Failed to connect wallet:', error.message);
    } else if (error.code === 'CHAIN_SWITCH_FAILED') {
      console.error('Failed to switch chain:', error.message);
    }
  }
}

// Step 2: Listen to connection changes
sdk.wallet.onConnect((connection) => {
  console.log('Wallet connected:', connection.address);
});

sdk.wallet.onDisconnect(() => {
  console.log('Wallet disconnected');
});

sdk.wallet.onChainChange((chainId) => {
  console.log('Chain switched to:', chainId);
  // May need to re-initialize certain operations
});

sdk.wallet.onAccountChange((address) => {
  console.log('Account switched to:', address);
});
*/

// ============================================================================
// PATTERN 2: READ VS WRITE OPERATIONS (CLEAR SEMANTIC DISTINCTION)
// ============================================================================

/**
 * Best Practice: Understand the difference between read and write operations
 * 
 * READ operations:
 * - Query blockchain state without changing it
 * - Fast, no gas cost, can be batched
 * - Immediate result (or simple polling)
 * 
 * WRITE operations:
 * - Change blockchain state (transactions)
 * - Require signer, cost gas, must be confirmed
 * - Multi-step: prepare -> sign -> submit -> confirm
 */

/*
Example Code:

// READ OPERATION: Get token balance (view function)
async function getBalance() {
  const balance = await sdk.token.read({
    contractAddress: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // USDC
    functionName: 'balanceOf',
    parameters: {
      account: sdk.wallet.getState().address
    },
    blockReference: 'latest' // Or specific block number for historical queries
  });
  
  console.log('Balance:', balance);
  return balance;
}

// WRITE OPERATION: Transfer tokens (state-changing transaction)
async function transferTokens(toAddress, amount) {
  console.log('Step 1: Estimate gas');
  const gasEstimate = await sdk.token.estimateGas({
    contractAddress: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    functionName: 'transfer',
    parameters: {
      recipient: toAddress,
      amount: amount.toString()
    }
  });
  
  console.log('Estimated gas:', gasEstimate.gasUnits);
  console.log('Estimated cost:', gasEstimate.estimatedCostUsd);
  
  // User reviews and approves the cost
  if (!userApprovesTransaction(gasEstimate)) {
    console.log('User rejected transaction');
    return;
  }
  
  console.log('Step 2: Submit transaction');
  const lifecycle = await sdk.token.submitTransaction({
    contractAddress: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    functionName: 'transfer',
    parameters: {
      recipient: toAddress,
      amount: amount.toString()
    },
    gasPrice: gasEstimate.gasPrice,
    gasUnits: gasEstimate.gasUnits
  });
  
  console.log('Transaction submitted:', lifecycle.hash);
  console.log('State:', lifecycle.state); // SUBMITTED
  
  // Explicitly wait for different confirmation levels
  console.log('Step 3: Wait for block inclusion');
  const included = await sdk.transaction.waitForConfirmation(lifecycle.hash, {
    strategy: 'block_confirmations',
    blockConfirmations: 1,
    timeoutMs: 60000
  });
  console.log('Included in block:', included.blockNumber);
  console.log('State:', included.state); // INCLUDED_IN_BLOCK
  
  console.log('Step 4: Wait for finality');
  const finalized = await sdk.transaction.waitForConfirmation(lifecycle.hash, {
    strategy: 'block_confirmations',
    blockConfirmations: 12,
    timeoutMs: 300000
  });
  console.log('Transaction finalized');
  console.log('State:', finalized.state); // FINALIZED
  console.log('Gas used:', finalized.gasUsed);
  console.log('Transaction fee:', finalized.transactionFee);
  
  return finalized;
}
*/

// ============================================================================
// PATTERN 3: EXPLICIT TRANSACTION LIFECYCLE MANAGEMENT
// ============================================================================

/**
 * Best Practice: Don't hide transaction states
 * 
 * Transaction states:
 * - PENDING_SUBMISSION: Prepared but not sent to chain
 * - SUBMITTED: Sent to mempool, waiting for inclusion
 * - INCLUDED_IN_BLOCK: In a block but not yet confirmed
 * - FINALIZED: Confirmed and can't be reverted
 * - DROPPED: Removed from mempool before inclusion
 * - REVERTED: Included but execution failed
 */

/*
Example Code:

async function submitAndTrackTransaction(transaction) {
  let lifecycle = await sdk.submitTransaction(transaction);
  
  // PENDING_SUBMISSION state
  console.log('Transaction prepared');
  console.assert(lifecycle.state === 'PENDING_SUBMISSION');
  console.assert(lifecycle.hash === undefined); // No hash yet
  
  // Wait for signing and submission
  lifecycle = await new Promise((resolve) => {
    const checkState = setInterval(async () => {
      const current = await sdk.transaction.getState(lifecycle.hash);
      if (current.state !== 'PENDING_SUBMISSION') {
        clearInterval(checkState);
        resolve(current);
      }
    }, 500);
  });
  
  // SUBMITTED state
  if (lifecycle.state === 'SUBMITTED') {
    console.log('In mempool with hash:', lifecycle.hash);
    console.log('Nonce:', lifecycle.nonce);
    
    // Set up monitoring for block inclusion
    const blockWatcher = setInterval(async () => {
      const updated = await sdk.transaction.getState(lifecycle.hash);
      
      if (updated.state === 'INCLUDED_IN_BLOCK') {
        clearInterval(blockWatcher);
        console.log('Included in block:', updated.blockNumber);
        console.log('Confirmations:', updated.confirmations);
        
        // Now wait for finality
        const finalized = await sdk.transaction.waitForConfirmation(
          lifecycle.hash,
          {
            strategy: 'block_confirmations',
            blockConfirmations: 12,
            timeoutMs: 300000
          }
        );
        
        if (finalized.state === 'FINALIZED') {
          console.log('Transaction finalized after', finalized.confirmations, 'blocks');
          console.log('Gas used:', finalized.gasUsed);
        } else if (finalized.state === 'REVERTED') {
          console.error('Transaction reverted:', finalized.revertReason);
        } else if (finalized.state === 'FAILED') {
          console.error('Transaction failed:', finalized.error);
        }
      } else if (updated.state === 'DROPPED') {
        clearInterval(blockWatcher);
        console.warn('Transaction dropped from mempool');
        console.log('Error:', updated.error);
      }
    }, 2000);
  }
}
*/

// ============================================================================
// PATTERN 4: GAS ESTIMATION SEPARATION
// ============================================================================

/**
 * Best Practice: Separate gas estimation from submission
 * 
 * Allows:
 * - User review before commitment
 * - Alternative gas price options
 * - Estimated costs in USD or other currencies
 */

/*
Example Code:

async function swapTokensWithGasReview() {
  const swapParams = {
    tokenIn: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // USDC
    tokenOut: '0xC02aaA39b223FE8D0A0e8e4F27ead9083C756Cc2', // WETH
    amountIn: '1000000000', // 1000 USDC
    minAmountOut: '500000000000000000' // 0.5 WETH
  };
  
  // Step 1: Estimate without commitment
  const gasEstimate = await sdk.router.estimateGas(swapParams);
  
  console.log('Gas estimate:');
  console.log('- Gas units:', gasEstimate.gasUnits);
  console.log('- Valid for:', gasEstimate.validForMs, 'ms');
  console.log('- Generated at:', new Date(gasEstimate.generatedAt).toISOString());
  
  console.log('Price options:');
  Object.entries(gasEstimate.gasPricePresets).forEach(([speed, option]) => {
    console.log(`- ${speed}:`);
    console.log(`  - Gas price: ${option.gasPrice}`);
    console.log(`  - Estimated cost: ${option.estimatedCostInNativeToken} ETH`);
    console.log(`  - USD: $${option.estimatedCostUsd}`);
    console.log(`  - Time: ~${option.estimatedTimeSeconds}s`);
  });
  
  // Step 2: User selects gas price option
  const selectedOption = gasEstimate.gasPricePresets['standard'];
  
  // Step 3: Check estimate still valid
  if (Date.now() - gasEstimate.generatedAt > gasEstimate.validForMs) {
    console.log('Estimate expired, re-estimating...');
    return swapTokensWithGasReview(); // Recurse
  }
  
  // Step 4: Submit with selected gas price
  const lifecycle = await sdk.router.submitTransaction({
    ...swapParams,
    gasPrice: selectedOption.gasPrice,
    gasUnits: gasEstimate.gasUnits
  });
  
  return lifecycle;
}
*/

// ============================================================================
// PATTERN 5: EVENT SUBSCRIPTIONS WITH EXPLICIT LIFECYCLE
// ============================================================================

/**
 * Best Practice: Track subscription state, not just events
 * 
 * Subscription states:
 * - INACTIVE: Not yet subscribed
 * - SUBSCRIBING: Connection in progress
 * - ACTIVE: Receiving events
 * - PAUSED: Temporarily paused
 * - ENDED: Explicitly ended
 * - RECONNECTING: Lost connection, trying to restore
 */

/*
Example Code:

async function subscribeToSwapEvents() {
  const filter = {
    contractAddress: '0xE592427A0AEce92De3Edee1F18E0157C05861564', // SwapRouter
    eventName: 'Swap',
    indexedParameters: {
      sender: sdk.wallet.getState().address
    },
    fromBlock: 'latest'
  };
  
  let subscriptionId;
  
  try {
    subscriptionId = await sdk.events.subscribe(
      filter,
      (event) => {
        console.log('Swap event received:');
        console.log('- Hash:', event.transactionHash);
        console.log('- Amount in:', event.data.amount0);
        console.log('- Amount out:', event.data.amount1);
        console.log('- Confirmations:', event.confirmations);
        console.log('- Finalized:', event.isFinalized);
        
        // Handle block reorg
        if (event.wasReverted) {
          console.warn('Event was reverted in block reorg!');
          console.log('Was in block:', event.originalBlockNumber);
        }
      }
    );
    
    console.log('Subscribed with ID:', subscriptionId);
    
    // Monitor subscription state
    const subscription = sdk.events.getSubscription(subscriptionId);
    console.log('Initial state:', subscription.state);
    
    // Listen for subscription state changes
    sdk.events.onSubscriptionStateChange((subscriptionId, newState) => {
      console.log(`Subscription ${subscriptionId} state changed to:`, newState);
      
      if (newState === 'RECONNECTING') {
        console.warn('Lost connection to event stream, reconnecting...');
      } else if (newState === 'FAILED') {
        console.error('Event subscription failed permanently');
      }
    });
    
  } catch (error) {
    if (error.code === 'SUBSCRIPTION_FAILED') {
      console.error('Failed to subscribe:', error.message);
    } else if (error.code === 'SUBSCRIPTION_TIMEOUT') {
      console.error('Subscription timeout');
    }
  }
  
  // Clean up subscription when done
  process.on('SIGINT', () => {
    sdk.events.unsubscribe(subscriptionId);
    console.log('Subscription ended');
  });
}
*/

// ============================================================================
// PATTERN 6: CHAIN SWITCHING WITH VALIDATION
// ============================================================================

/**
 * Best Practice: Validate chain compatibility before operations
 * 
 * Different chains have different characteristics:
 * - Block time
 * - Finality requirements
 * - Gas token
 * - Supported features
 */

/*
Example Code:

async function ensureCorrectChain(requiredChainId) {
  const current = sdk.wallet.getState();
  
  if (current.chainId === requiredChainId) {
    console.log('Already on correct chain');
    return;
  }
  
  console.log(`Switching from ${current.chainId} to ${requiredChainId}`);
  
  try {
    await sdk.switchChain(requiredChainId);
    
    // Verify chain switch
    const newState = sdk.wallet.getState();
    console.assert(newState.chainId === requiredChainId);
    console.log('Chain switched successfully');
    
  } catch (error) {
    if (error.code === 'CHAIN_SWITCH_FAILED') {
      console.error('Failed to switch chain:', error.message);
      console.error('Chain may not be supported by wallet');
    }
  }
}

// Validate chain supports operation
async function validateChainSupport(operationName, chainId) {
  const supported = sdk.isOperationSupportedOnChain(operationName, chainId);
  
  if (!supported) {
    throw new Error(`Operation ${operationName} not supported on chain ${chainId}`);
  }
}

// Get chain-specific parameters
async function executeOperationOnChain(operation, chainId) {
  await ensureCorrectChain(chainId);
  
  // Get adjusted parameters for this chain
  const chainSpecificParams = sdk.getChainSpecificParameters(operation, chainId);
  
  console.log('Chain-specific parameters:');
  console.log('- Block time:', chainSpecificParams.blockTimeSeconds, 'seconds');
  console.log('- Finality blocks:', chainSpecificParams.finalityBlocks);
  
  // Confirmation strategy may need adjustment per chain
  const chainStrategy = {
    strategy: 'finality_confirmation',
    blockConfirmations: chainSpecificParams.finalityBlocks,
    timeoutMs: chainSpecificParams.finalityBlocks * chainSpecificParams.blockTimeSeconds * 1000 * 1.5
  };
  
  return executeWithStrategy(operation, chainStrategy);
}
*/

// ============================================================================
// PATTERN 7: ERROR HANDLING WITH RECOVERY SUGGESTIONS
// ============================================================================

/**
 * Best Practice: Handle Web3-specific errors with context-aware recovery
 */

/*
Example Code:

async function executeWithErrorHandling(operation) {
  try {
    return await operation();
  } catch (error) {
    switch (error.code) {
      case 'WALLET_NOT_CONNECTED':
        console.error('Connect a wallet first');
        await sdk.connectWallet();
        return executeWithErrorHandling(operation);
        
      case 'INSUFFICIENT_FUNDS':
        console.error('Insufficient balance');
        const balance = await sdk.token.getBalance();
        console.error(`Balance: ${balance}`);
        console.error('Possible solutions:');
        console.error('- Deposit more funds');
        console.error('- Use a bridge to transfer from another chain');
        console.error(`- Testnet faucet: ${sdk.getNetwork().faucetUrl}`);
        break;
        
      case 'INSUFFICIENT_GAS':
        console.error('Insufficient ETH for gas');
        console.error(`Need: ${error.requiredGas}`);
        const ethBalance = await sdk.getBalance('ETH');
        console.error(`Have: ${ethBalance}`);
        break;
        
      case 'WRONG_CHAIN':
        console.error('Wallet on wrong chain');
        console.error(`Current: ${error.currentChainId}`);
        console.error(`Required: ${error.requiredChainId}`);
        await sdk.switchChain(error.requiredChainId);
        return executeWithErrorHandling(operation);
        
      case 'TRANSACTION_REVERTED':
        console.error('Transaction reverted');
        console.error('Revert reason:', error.revertReason);
        console.error('Possible causes:');
        console.error('- Invalid parameters');
        console.error('- State changed since estimation');
        console.error('- Contract error condition');
        break;
        
      case 'CONFIRMATION_TIMEOUT':
        console.error('Transaction confirmation timeout');
        console.error('Last known state:', error.lastKnownState);
        console.error('Check blockchain explorer:', 
          sdk.getNetwork().explorerUrl + '/tx/' + error.transactionHash);
        break;
        
      case 'GAS_PRICE_TOO_LOW':
        console.error('Gas price too low');
        console.error('Current gas price: ', error.currentGasPrice);
        console.error('Recommended gas price:', error.recommendedGasPrice);
        // Re-estimate and retry with higher gas
        break;
        
      default:
        console.error('Unexpected error:', error);
    }
    
    throw error;
  }
}
*/

// ============================================================================
// PATTERN 8: BATCH OPERATIONS WITH ATOMICITY AWARENESS
// ============================================================================

/**
 * Best Practice: Understand batch operation guarantees
 * 
 * Not all chains support atomic batches.
 * Make explicit choice between sequential and parallel execution.
 */

/*
Example Code:

async function batchSwaps(swaps) {
  const batch = {
    calls: swaps.map((swap, index) => ({
      id: `swap-${index}`,
      to: '0xE592427A0AEce92De3Edee1F18E0157C05861564',
      method: 'exactInputSingle',
      parameters: swap,
      isWrite: true,
      dependsOn: index > 0 ? [`swap-${index - 1}`] : []
    })),
    executionStrategy: 'sequential', // Not atomic on most chains
    atomicity: 'best_effort', // Partial success OK
    timeoutMs: 300000
  };
  
  const result = await sdk.router.executeBatch(batch);
  
  console.log('Batch result:', result.status);
  console.log('Transaction hash:', result.transactionHash);
  console.log('Individual results:');
  
  result.results.forEach((callResult) => {
    if (callResult.status === 'success') {
      console.log(`✓ ${callResult.callId}: ${callResult.returnValue}`);
    } else if (callResult.status === 'failed') {
      console.log(`✗ ${callResult.callId}: ${callResult.error.message}`);
    } else if (callResult.status === 'reverted') {
      console.log(`⊘ ${callResult.callId}: Reverted - ${callResult.error.reason}`);
    }
  });
}
*/

export default {
  patterns: [
    "WALLET_CONNECTION_WITH_STATE_TRACKING",
    "READ_VS_WRITE_OPERATIONS",
    "EXPLICIT_TRANSACTION_LIFECYCLE",
    "GAS_ESTIMATION_SEPARATION",
    "EVENT_SUBSCRIPTIONS_WITH_LIFECYCLE",
    "CHAIN_SWITCHING_WITH_VALIDATION",
    "ERROR_HANDLING_WITH_RECOVERY",
    "BATCH_OPERATIONS_WITH_ATOMICITY_AWARENESS"
  ]
};
