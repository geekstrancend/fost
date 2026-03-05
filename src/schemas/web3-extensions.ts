/**
 * WEB3 SDK SCHEMA EXTENSIONS
 * 
 * Extended canonical schema definitions for Web3 (blockchain) SDKs.
 * Respects blockchain async semantics and transaction lifecycle.
 * 
 * Key principles:
 * - Transaction states are explicit, not hidden
 * - Confirmation requirements are deterministic per chain
 * - Gas estimation separates from transaction submission
 * - Read vs write operations have distinct contract
 * - Event subscriptions expose subscription lifecycle
 * - Chain switching is explicit and tracked
 */

import {
  CanonicalOperation,
  OperationParameter,
} from "./canonical.schema";

// ============================================================================
// SECTION 1: TRANSACTION TYPES & STATES
// ============================================================================

/**
 * Explicit transaction states throughout lifecycle.
 * Prevents hiding important states from developers.
 */
export enum TransactionState {
  /** Transaction prepared but not yet submitted */
  PENDING_SUBMISSION = "PENDING_SUBMISSION",

  /** Transaction submitted to mempool */
  SUBMITTED = "SUBMITTED",

  /** Transaction included in block */
  INCLUDED_IN_BLOCK = "INCLUDED_IN_BLOCK",

  /** Transaction has reached finality confirmation threshold */
  FINALIZED = "FINALIZED",

  /** Transaction was dropped from mempool */
  DROPPED = "DROPPED",

  /** Transaction included in block but reverted */
  REVERTED = "REVERTED",

  /** Transaction failed for other reason */
  FAILED = "FAILED",
}

/**
 * Represents the complete lifecycle of a blockchain transaction.
 * Exposes all important states to prevent surprises.
 */
export interface TransactionLifecycle {
  /** Current transaction state */
  state: TransactionState;

  /** Transaction hash (available after SUBMITTED) */
  hash?: string;

  /** Block number (available after INCLUDED_IN_BLOCK) */
  blockNumber?: number;

  /** Block hash */
  blockHash?: string;

  /** Transaction index in block */
  transactionIndex?: number;

  /** Number of confirmations received */
  confirmations: number;

  /** Gas used (available after execution) */
  gasUsed?: string;

  /** Gas price actually paid */
  gasPrice?: string;

  /** Transaction fee (gasUsed * gasPrice) */
  transactionFee?: string;

  /** Nonce of transaction */
  nonce: number;

  /** Transaction creation timestamp */
  createdAt: number;

  /** Transaction submission timestamp */
  submittedAt?: number;

  /** Block inclusion timestamp */
  includedAt?: number;

  /** Finalization timestamp */
  finalizedAt?: number;

  /** Any error message */
  error?: string;

  /** Error code if applicable */
  errorCode?: string;

  /** Revert reason (if transaction reverted) */
  revertReason?: string;

  /** Raw transaction receipt (chain-specific) */
  receipt?: any;
}

/**
 * Configuration for confirming transactions.
 * Explicit about what "confirmation" means per chain.
 */
export interface ConfirmationStrategy {
  /** Type of confirmation strategy */
  strategy:
    | "block_confirmations"
    | "finality_confirmation"
    | "probabilistic"
    | "custom";

  /** Number of blocks to wait for confirmation */
  blockConfirmations?: number;

  /** Finality checkpoint (Solana, Cosmos, etc.) */
  finalityCheckpoint?: string;

  /** For probabilistic: confidence percentage (0-100) */
  confidencePercentage?: number;

  /** Maximum time to wait for confirmation (ms) */
  timeoutMs: number;

  /** Whether to poll for updates */
  polling: {
    enabled: boolean;
    intervalMs: number;
    maxRetries: number;
  };

  /** Fallback if primary strategy times out */
  fallback?: ConfirmationStrategy;
}

/**
 * Information about transaction cost before submission.
 * Separates estimation from execution.
 */
export interface GasEstimate {
  /** Estimated gas units */
  gasUnits: string;

  /** Estimated gas price (in smallest unit of chain) */
  gasPrice: string;

  /** Alternative gas price options */
  gasPricePresets?: Record<
    string,
    {
      speed: "slow" | "standard" | "fast" | "custom";
      gasPrice: string;
      estimatedTimeSeconds: number;
      estimatedCostInNativeToken: string;
    }
  >;

  /** Maximum total cost estimate (gasUnits * gasPrice) */
  maxTotalCostNativeToken: string;

  /** Equivalent cost in USD (if available) */
  estimatedCostUsd?: string;

  /** Whether this estimate is stale (expired) */
  isStale: boolean;

  /** When this estimate was generated (timestamp) */
  generatedAt: number;

  /** How long estimate is valid (ms) */
  validForMs: number;

  /** Additional estimation metadata */
  metadata?: {
    chainId: string;
    blockNumber: number;
    priorityFeePerGas?: string;
    baseFeePerGas?: string;
    mempoolGasPrice?: string;
  };
}

// ============================================================================
// SECTION 2: WALLET & SIGNER INTERFACES
// ============================================================================

/**
 * Explicit wallet connection states.
 * Prevents hidden connection issues.
 */
export enum WalletConnectionState {
  /** Not attempted or user disconnected */
  DISCONNECTED = "DISCONNECTED",

  /** Connection in progress */
  CONNECTING = "CONNECTING",

  /** Connected and ready to sign */
  CONNECTED = "CONNECTED",

  /** Connection lost */
  CONNECTION_LOST = "CONNECTION_LOST",

  /** Failed to connect */
  CONNECTION_FAILED = "CONNECTION_FAILED",

  /** Connected but on wrong chain */
  WRONG_CHAIN = "WRONG_CHAIN",

  /** Connected but account changed */
  ACCOUNT_CHANGED = "ACCOUNT_CHANGED",
}

/**
 * Wallet connection interface.
 * Explicit about signer capability and chain requirements.
 */
export interface WalletConnection {
  /** Current connection state */
  state: WalletConnectionState;

  /** Connected wallet address */
  address?: string;

  /** Currently active chain ID */
  chainId?: string;

  /** All available accounts in wallet */
  accounts?: string[];

  /** Whether wallet is hardware wallet */
  isHardware: boolean;

  /** Whether wallet supports multiple signers (multi-sig) */
  supportsMultipleSigning: boolean;

  /** Supported chains for this wallet */
  supportedChains: string[];

  /** Wallet metadata */
  walletInfo?: {
    name: string;
    icon?: string;
    website?: string;
  };

  /** Connection established timestamp */
  connectedAt?: number;

  /** Last activity timestamp */
  lastActivityAt?: number;
}

/**
 * Signer abstraction that respects async signing.
 * Separates prepare, sign, and submit steps.
 */
export interface Web3Signer {
  /** Unique signer ID */
  id: string;

  /** Signer type */
  type:
    | "eoa" // Externally Owned Account
    | "smart_contract" // Smart contract account
    | "multi_sig" // Multi-signature wallet
    | "hardware" // Hardware wallet
    | "mpc"; // Multi-party computation

  /** Associated address or addresses */
  addresses: string[];

  /** Currently active chain */
  activeChain: string;

  /** Whether signer requires user interaction to sign */
  requiresUserInteraction: boolean;

  /** Whether signer requires hardware device */
  requiresHardware: boolean;

  /** Maximum concurrent signing operations */
  maxConcurrentSigns: number;

  /** Metadata about signer */
  metadata?: Record<string, any>;
}

// ============================================================================
// SECTION 3: READ VS WRITE OPERATION CONTRACTS
// ============================================================================

/**
 * Read operation (state query) - does not change blockchain state.
 * Always returns immediately or with simple polling.
 */
export interface Web3ReadOperation extends CanonicalOperation {
  /** Marks this as a read operation */
  operationType: "read";

  /** Can this be safely called in a loop? */
  isSafeForBatching: boolean;

  /** Whether to call a view/pure function on a smart contract */
  isViewFunction: boolean;

  /** Block number to read state at */
  blockReference?: "latest" | "finalized" | "safe" | number;

  /** Can be retried without side effects */
  idempotent: boolean;

  /** Typical response time in ms */
  expectedLatencyMs: number;

  /** Cache policy for results */
  caching?: {
    ttlMs: number;
    strategy: "revalidate" | "no_store" | "max_age";
  };
}

/**
 * Write operation (state-changing transaction) - changes blockchain state.
 * Requires explicit confirmation, gas estimation, and signer involvement.
 */
export interface Web3WriteOperation extends CanonicalOperation {
  /** Marks this as a write operation */
  operationType: "write";

  /** State variables affected by this operation */
  stateVariablesAffected: string[];

  /** Whether gas can be estimated before submission */
  gasEstimationAvailable: boolean;

  /** Whether gas price can be specified by user */
  userCanSetGasPrice: boolean;

  /** Whether gas units can be specified by user */
  userCanSetGasUnits: boolean;

  /** Whether operation has a payable field (sending value) */
  isPayable: boolean;

  /** If payable, which parameter is the value/amount */
  payableParameter?: string;

  /** Whether operation requires signer to be on specific chain */
  requiresSpecificChain: boolean;

  /** If so, which chain(s) */
  requiredChains?: string[];

  /** Whether this is a multi-step operation (prepare -> sign -> submit) */
  isMultiStep: boolean;

  /** Steps if multi-step */
  steps?: TransactionStep[];

  /** Whether operation can be cancelled after submission */
  cancellable: boolean;

  /** Whether operation can be batched with others */
  batchable: boolean;

  /** Confirmation strategy for this operation */
  confirmationStrategy: ConfirmationStrategy;

  /** Whether operation changes wallet nonce */
  incrementsNonce: boolean;

  /** Can be retried (with unique identifiers) */
  idempotent: boolean;

  /** Typical total time from submission to finalization (ms) */
  expectedFinalityMs: number;
}

/**
 * Multi-step transaction breakdown.
 */
export interface TransactionStep {
  /** Step number */
  step: number;

  /** Step name */
  name: string;

  /** Step description */
  description: string;

  /** What user/SDK does in this step */
  action: "prepare" | "sign" | "submit" | "wait_confirmation" | "finalize";

  /** Whether this step is blocking */
  blocking: boolean;

  /** Estimated time for this step (ms) */
  estimatedTimeMs: number;

  /** What happens if this step fails */
  failureRecovery: string;
}

// ============================================================================
// SECTION 4: CHAIN SWITCHING & NETWORK AWARENESS
// ============================================================================

/**
 * Represents a blockchain network.
 * Explicit about chain characteristics.
 */
export interface BlockchainNetwork {
  /** Unique chain identifier */
  chainId: string;

  /** Display name */
  name: string;

  /** Network environment */
  environment: "mainnet" | "testnet" | "devnet" | "local";

  /** Blockchain type */
  blockchainType: "ethereum" | "solana" | "cosmos" | "bitcoin" | "other";

  /** RPC endpoint(s) */
  rpcEndpoints: string[];

  /** Fallback RPC endpoints if primary fails */
  fallbackRpcEndpoints?: string[];

  /** Block time in seconds */
  blockTimeSeconds: number;

  /** Number of blocks for finality */
  finalityBlocks: number;

  /** Native token symbol */
  nativeTokenSymbol: string;

  /** Decimals for native token */
  nativeTokenDecimals: number;

  /** Chain explorer URL */
  explorerUrl?: string;

  /** Faucet for testnet tokens */
  faucetUrl?: string;

  /** Features supported on this chain */
  supportedFeatures: {
    gasEstimation: boolean;
    accountAbstraction: boolean;
    eip1559?: boolean; // EVM only
    flashbots?: boolean; // EVM only
    flashloans?: boolean; // EVM only
  };

  /** Known issues or limitations */
  limitations?: string[];

  /** Current network status */
  status: "operational" | "degraded" | "offline" | "maintenance";

  /** When network status was last checked */
  statusCheckedAt: number;
}

/**
 * Explicit chain switching operations.
 * Always requires confirmation and validation.
 */
export interface ChainSwitchingContract {
  /** Must explicitly request chain switch from wallet */
  requiresExplicitSwitch: boolean;

  /** Supported chains */
  supportedChains: BlockchainNetwork[];

  /** Currently active chain */
  activeChain: BlockchainNetwork;

  /** Callback when chain changes */
  onChainChange?: (newChain: BlockchainNetwork, oldChain: BlockchainNetwork) => void;

  /** Validate if operation is supported on chain */
  isOperationSupportedOnChain(operationId: string, chainId: string): boolean;

  /** Get operation parameters adjusted for chain */
  getChainSpecificParameters(operationId: string, chainId: string): OperationParameter[];

  /** Max time to wait for chain switch (ms) */
  switchTimeoutMs: number;

  /** Whether to auto-reconnect to last chain on SDK init */
  autoReconnectLastChain: boolean;
}

// ============================================================================
// SECTION 5: EVENT SUBSCRIPTIONS WITH LIFECYCLE
// ============================================================================

/**
 * Event subscription lifecycle states.
 */
export enum SubscriptionState {
  /** Not yet subscribed */
  INACTIVE = "INACTIVE",

  /** Subscription in progress */
  SUBSCRIBING = "SUBSCRIBING",

  /** Active and receiving events */
  ACTIVE = "ACTIVE",

  /** Subscription paused */
  PAUSED = "PAUSED",

  /** Subscription ended */
  ENDED = "ENDED",

  /** Subscription failed */
  FAILED = "FAILED",

  /** Subscription reconnecting after failure */
  RECONNECTING = "RECONNECTING",
}

/**
 * Smart contract event subscription.
 * Explicit about event delivery and subscription management.
 */
export interface SmartContractEventSubscription {
  /** Subscription ID */
  subscriptionId: string;

  /** Event name being subscribed to */
  eventName: string;

  /** Smart contract address */
  contractAddress: string;

  /** Current subscription state */
  state: SubscriptionState;

  /** Event filter conditions */
  filter?: {
    topics?: string[];
    fromBlock?: number | "latest";
    toBlock?: number | "latest";
    indexedParameters?: Record<string, any>;
  };

  /** How events are delivered */
  deliveryMethod: "websocket" | "polling" | "event_log";

  /** For polling: interval between checks (ms) */
  pollingIntervalMs?: number;

  /** Subscription created timestamp */
  subscribedAt: number;

  /** Last event received timestamp */
  lastEventAt?: number;

  /** Subscription will expire at (if applicable) */
  expiresAt?: number;

  /** Total events received */
  eventCount: number;

  /** Any error details */
  error?: {
    code: string;
    message: string;
    recoverable: boolean;
  };
}

/**
 * Event emission details.
 * Includes block confirmation state for blockchain events.
 */
export interface BlockchainEventEmission {
  /** Event ID */
  id: string;

  /** Event name */
  name: string;

  /** Smart contract that emitted event */
  contractAddress: string;

  /** Event data */
  data: Record<string, any>;

  /** Indexed parameters for filtering */
  indexedValues: Record<string, any>;

  /** Block number where event was emitted */
  blockNumber: number;

  /** Block hash */
  blockHash: string;

  /** Transaction hash that generated event */
  transactionHash: string;

  /** Transaction index in block */
  transactionIndex: number;

  /** Log index in transaction */
  logIndex: number;

  /** Timestamp when block was mined */
  timestamp: number;

  /** Number of confirmations on this event */
  confirmations: number;

  /** Whether event has reached finality */
  isFinalized: boolean;

  /** Whether event was reverted (in reorg) */
  wasReverted: boolean;

  /** Original block number if reverted and reorg happened */
  originalBlockNumber?: number;
}

// ============================================================================
// SECTION 6: BATCH OPERATIONS
// ============================================================================

/**
 * Batch of contract calls to be executed together.
 * Respects blockchain atomicity guarantees (or lack thereof).
 */
export interface ContractCallBatch {
  /** Batch ID */
  id: string;

  /** Individual calls in batch */
  calls: {
    /** Unique call ID within batch */
    id: string;

    /** Smart contract address */
    to: string;

    /** Function signature or method ID */
    method: string;

    /** Function parameters */
    parameters: any;

    /** Whether this is a state-changing call (write) */
    isWrite: boolean;

    /** Gas limit for this call (if write) */
    gasLimit?: string;

    /** Order dependency on other calls */
    dependsOn?: string[];
  }[];

  /** Execution strategy */
  executionStrategy: "sequential" | "parallel" | "atomicIfSupported";

  /** Whether all calls must succeed or partial OK */
  atomicity: "all_or_nothing" | "best_effort";

  /** Timeout for entire batch (ms) */
  timeoutMs: number;

  /** Gas limit for entire batch */
  totalGasLimit?: string;
}

/**
 * Result of batch execution.
 */
export interface ContractCallBatchResult {
  /** Batch ID */
  batchId: string;

  /** Overall batch status */
  status: "success" | "partial" | "failed";

  /** Results per call */
  results: {
    /** Call ID */
    callId: string;

    /** Call status */
    status: "success" | "failed" | "reverted";

    /** Returned data */
    returnValue?: any;

    /** Error if failed */
    error?: {
      code: string;
      message: string;
      reason?: string;
    };

    /** Gas used for this call (if write) */
    gasUsed?: string;
  }[];

  /** Transaction hash (if state-changing batch) */
  transactionHash?: string;

  /** Block number (if state-changing batch) */
  blockNumber?: number;

  /** Total gas used across batch */
  totalGasUsed?: string;

  /** Total time taken (ms) */
  executionTimeMs: number;
}

// ============================================================================
// SECTION 7: SIGNING SEPARATION
// ============================================================================

/**
 * Explicit separation of transaction preparation from signing.
 * Prevents loss of visibility into signing process.
 */
export interface TransactionPreparation {
  /** Unique preparation ID */
  id: string;

  /** The unprepared, unsigned transaction */
  transaction: {
    /** Target smart contract or address */
    to: string;

    /** Value being sent (if any) */
    value?: string;

    /** Raw transaction data */
    data: string;

    /** Gas limit */
    gasLimit?: string;

    /** Gas price or maxFeePerGas */
    gasPrice?: string;

    /** Additional fields (chainId, nonce, etc.) */
    metadata?: Record<string, any>;
  };

  /** Estimated gas for this transaction */
  gasEstimate: GasEstimate;

  /** Recommended signers for this transaction */
  recommendedSigners: Web3Signer[];

  /** Whether transaction requires specific chain */
  requiredChainId?: string;

  /** Timestamp when prepared */
  preparedAt: number;

  /** How long preparation is valid (ms) */
  validForMs: number;

  /** Whether to show signing request to user before signing */
  requiresUserApproval: boolean;

  /** Context for user approval (what will happen) */
  approvalContext?: {
    summary: string;
    risks?: string[];
    estimatedImpact?: string;
  };
}

/**
 * Explicit signing request.
 * Tracks signing attempt and result.
 */
export interface SigningRequest {
  /** Unique request ID */
  id: string;

  /** What we're signing */
  messageOrTransaction: TransactionPreparation | string;

  /** Type of signing */
  signingType: "transaction" | "message";

  /** Which signer should sign */
  requestedSigner: Web3Signer;

  /** Current request state */
  state:
    | "pending"
    | "awaiting_user"
    | "signing"
    | "signed"
    | "rejected"
    | "failed"
    | "timeout";

  /** When request was made */
  requestedAt: number;

  /** When user responded (approved/rejected) */
  respondedAt?: number;

  /** When signing actually occurred */
  signedAt?: number;

  /** Signature if successful */
  signature?: string;

  /** Error if failed */
  error?: {
    code: string;
    message: string;
    recoverable: boolean;
  };

  /** Timeout for this request (ms) */
  timeoutMs: number;
}

// ============================================================================
// SECTION 8: ERROR DEFINITIONS
// ============================================================================

/**
 * Web3-specific error types.
 * Explicit about recovery paths.
 */
export enum Web3ErrorCode {
  // Connection errors
  WALLET_NOT_CONNECTED = "WALLET_NOT_CONNECTED",
  WALLET_CONNECTION_FAILED = "WALLET_CONNECTION_FAILED",
  WRONG_CHAIN = "WRONG_CHAIN",
  CHAIN_SWITCH_FAILED = "CHAIN_SWITCH_FAILED",
  RPC_ENDPOINT_FAILED = "RPC_ENDPOINT_FAILED",

  // Signing errors
  SIGNING_REJECTED = "SIGNING_REJECTED",
  SIGNING_FAILED = "SIGNING_FAILED",
  SIGNING_TIMEOUT = "SIGNING_TIMEOUT",
  INSUFFICIENT_PERMISSIONS = "INSUFFICIENT_PERMISSIONS",

  // Transaction errors
  INSUFFICIENT_FUNDS = "INSUFFICIENT_FUNDS",
  INSUFFICIENT_GAS = "INSUFFICIENT_GAS",
  TRANSACTION_FAILED = "TRANSACTION_FAILED",
  TRANSACTION_REVERTED = "TRANSACTION_REVERTED",
  NONCE_CONFLICT = "NONCE_CONFLICT",
  TRANSACTION_DROPPED = "TRANSACTION_DROPPED",

  // Gas errors
  GAS_ESTIMATION_FAILED = "GAS_ESTIMATION_FAILED",
  GAS_PRICE_TOO_LOW = "GAS_PRICE_TOO_LOW",

  // Contract errors
  CONTRACT_NOT_FOUND = "CONTRACT_NOT_FOUND",
  FUNCTION_NOT_FOUND = "FUNCTION_NOT_FOUND",
  INVALID_PARAMETERS = "INVALID_PARAMETERS",

  // Event subscription errors
  SUBSCRIPTION_FAILED = "SUBSCRIPTION_FAILED",
  SUBSCRIPTION_TIMEOUT = "SUBSCRIPTION_TIMEOUT",

  // Confirmation errors
  CONFIRMATION_TIMEOUT = "CONFIRMATION_TIMEOUT",
  BLOCK_REORG = "BLOCK_REORG",

  // General errors
  NETWORK_ERROR = "NETWORK_ERROR",
  UNKNOWN_ERROR = "UNKNOWN_ERROR",
}