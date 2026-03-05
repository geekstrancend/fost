/**
 * CANONICAL SDK SCHEMA
 * 
 * Language-agnostic, deterministic representation of any SDK.
 * Acts as the single source of truth for code generation, documentation, and testing.
 * 
 * Key principles:
 * - All information needed for code generation is present
 * - No interpretation needed; everything explicit
 * - Web2 and Web3 concepts unified but distinguished
 * - Fields are never optional when they affect SDK behavior
 */

// ============================================================================
// ROOT: ProductCanonicalSchema
// ============================================================================

export interface ProductCanonicalSchema {
  /** Product metadata */
  product: ProductMetadata;

  /** Product classification */
  classification: ProductClassification;

  /** All types available in the SDK */
  types: Record<string, CanonicalType>;

  /** All operations/methods available in the SDK */
  operations: CanonicalOperation[];

  /** Error definitions */
  errors: CanonicalError[];

  /** Authentication/authorization model */
  auth: AuthModel;

  /** Network/environment/chain configurations */
  networks: CanonicalNetwork[];

  /** Rate limiting and constraints */
  constraints: Constraints;

  /** Web3-specific configuration */
  web3?: Web3Config;

  /** Events (subscriptions, webhooks, smart contract events) */
  events?: CanonicalEvent[];

  /** SDK conventions and preferences */
  conventions: SDKConventions;

  /** Documentation metadata */
  documentation: DocumentationMetadata;
}

// ============================================================================
// SECTION 1: PRODUCT METADATA
// ============================================================================

export interface ProductMetadata {
  /** SDK name: e.g., "stripe", "uniswap", "opensea" */
  name: string;

  /** Semantic version */
  version: string;

  /** One-line description */
  description: string;

  /** Longer description for generated README */
  longDescription?: string;

  /** Contact/support URL */
  contactUrl?: string;

  /** License identifier (MIT, Apache-2.0, etc.) */
  license?: string;

  /** Product home page */
  homepage?: string;

  /** Repository URL */
  repositoryUrl?: string;

  /** API version this SDK targets */
  apiVersion: string;

  /** Release date */
  releaseDate: string;

  /** Tags for categorization */
  tags: string[];
}

export interface ProductClassification {
  /** "web2" | "web3" | "hybrid" */
  type: "web2" | "web3" | "hybrid";

  /** For Web2: primary protocol (rest | graphql | grpc | custom) */
  protocol?: "rest" | "graphql" | "grpc" | "custom";

  /** For Web3: primary blockchain (ethereum | solana | cosmos | etc.) */
  primaryChain?: string;

  /** Complexity indicator for SDK design decisions */
  complexity: "simple" | "moderate" | "complex";

  /** Is this a domain-specific SDK? (payment, trading, nft, etc.) */
  domain?: string;

  /** Indicates if product supports multiple chains/networks */
  multiNetwork: boolean;
}

// ============================================================================
// SECTION 2: TYPES
// ============================================================================

export interface CanonicalType {
  /** Fully qualified type name: "User" or "wallet.Account" */
  name: string;

  /** Human-readable description */
  description: string;

  /** Type category */
  category: "object" | "enum" | "union" | "primitive" | "array" | "map";

  /** For primitives: "string" | "number" | "boolean" | "bytes" | "bigint" | "timestamp" */
  primitiveType?: string;

  /** For enums: list of valid values */
  enumValues?: string[];

  /** For objects: field definitions */
  fields?: Record<string, CanonicalField>;

  /** For unions: which types are allowed */
  unionTypes?: string[];

  /** For arrays: element type reference */
  elementType?: string;

  /** For maps: value type reference */
  valueType?: string;

  /** Whether null/undefined is allowed */
  nullable: boolean;

  /** Example value(s) for documentation and testing */
  examples?: any[];

  /** URL to spec or documentation */
  specUrl?: string;

  /** Deprecation notice */
  deprecated?: string;
}

export interface CanonicalField {
  /** Field name */
  name: string;

  /** Type reference: points to a key in types record or built-in type */
  type: string;

  /** Field description */
  description: string;

  /** Is this field required in requests? */
  required: boolean;

  /** Is null/undefined allowed? */
  nullable: boolean;

  /** Default value if not provided */
  defaultValue?: any;

  /** Example value */
  example?: any;

  /** Validation constraints */
  validation?: FieldValidation;

  /** Deprecation notice */
  deprecated?: string;
}

export interface FieldValidation {
  /** For strings: regex pattern */
  pattern?: string;

  /** For numbers: minimum value */
  minValue?: number;

  /** For numbers: maximum value */
  maxValue?: number;

  /** For strings: minimum length */
  minLength?: number;

  /** For strings: maximum length */
  maxLength?: number;

  /** List of allowed values (alternative to enum type) */
  allowedValues?: any[];

  /** Custom validation rule description */
  custom?: string;
}

// ============================================================================
// SECTION 3: OPERATIONS (Methods/Endpoints)
// ============================================================================

export interface CanonicalOperation {
  /** Unique operation ID: "listUsers", "transferTokens", "getBalance" */
  id: string;

  /** HTTP method (Web2) or operation type (Web3) */
  httpMethod?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

  /** For Web2: REST path pattern, e.g., "/users/{userId}" */
  path?: string;

  /** Human-readable operation name */
  name: string;

  /** Description of what this operation does */
  description: string;

  /** Longer description for documentation */
  longDescription?: string;

  /** Operation category: "read" | "write" | "admin" | "webhook" */
  category: "read" | "write" | "admin" | "webhook";

  /** Input parameters */
  parameters: OperationParameter[];

  /** Response type reference */
  responseType: string;

  /** For paginated responses: pagination info */
  pagination?: PaginationConfig;

  /** Errors this operation can throw */
  errorCodes: string[];

  /** Authentication requirement */
  auth: OperationAuth;

  /** Async behavior */
  async: AsyncConfig;

  /** Rate limiting */
  rateLimit?: RateLimitConfig;

  /** Retry behavior */
  retry?: RetryConfig;

  /** For Web2: timeout in milliseconds */
  timeoutMs?: number;

  /** For Web3: gas estimation */
  gasEstimation?: GasEstimation;

  /** For Web3: state-changing transaction */
  isTransaction?: boolean;

  /** For Web3: reads state from blockchain */
  isRead?: boolean;

  /** For Web3: required networks/chains */
  supportedNetworks?: string[];

  /** Webhook or event subscription */
  isWebhook?: boolean;

  /** Examples of usage */
  examples?: OperationExample[];

  /** Deprecation notice */
  deprecated?: string;

  /** URL to API documentation */
  specUrl?: string;
}

export interface OperationParameter {
  /** Parameter name */
  name: string;

  /** Parameter description */
  description: string;

  /** Type reference */
  type: string;

  /** Is this parameter required? */
  required: boolean;

  /** Parameter location */
  location: "query" | "path" | "body" | "header" | "input";

  /** Default value if not provided */
  defaultValue?: any;

  /** Example value */
  example?: any;

  /** For Web2: whether this goes in URL, query string, or body */
  serialization?: "form" | "json" | "multipart";

  /** Validation constraints */
  validation?: FieldValidation;
}

export interface OperationAuth {
  /** Is authentication required for this operation? */
  required: boolean;

  /** Auth type: "api_key" | "oauth" | "jwt" | "signature" | "wallet" | "none" */
  type: "api_key" | "oauth" | "jwt" | "signature" | "wallet" | "none";

  /** For API keys: which header/query param */
  apiKeyLocation?: "header" | "query";

  /** For API keys: header/param name */
  apiKeyName?: string;

  /** For OAuth: required scopes */
  oauthScopes?: string[];

  /** For signatures: which fields to sign */
  signatureFields?: string[];

  /** For wallet operations: signer type */
  signerType?: "eoa" | "smart_contract" | "hardware_wallet";
}

export interface AsyncConfig {
  /** "synchronous" | "asynchronous" | "both" */
  model: "synchronous" | "asynchronous" | "both";

  /** For async: how to check result (polling, callback, webhook) */
  completionModel?: "polling" | "callback" | "webhook" | "stream";

  /** If polling: check interval in ms */
  pollingIntervalMs?: number;

  /** If polling: max wait time in ms */
  pollingTimeoutMs?: number;

  /** Status type reference (for polling/callback) */
  statusType?: string;

  /** Whether operation returns a promise/future/async function */
  returnsPromise: boolean;
}

export interface RateLimitConfig {
  /** Requests per period */
  requestsPerPeriod: number;

  /** Period in seconds */
  periodSeconds: number;

  /** Whether this is per-user, per-key, or global */
  scope: "per_user" | "per_api_key" | "global";

  /** HTTP headers indicating rate limit status */
  rateLimitHeaders?: {
    remaining?: string;
    reset?: string;
    limit?: string;
  };
}

export interface RetryConfig {
  /** Should this operation be retried on failure? */
  enabled: boolean;

  /** Maximum retry attempts */
  maxAttempts: number;

  /** Initial backoff in ms */
  backoffMs: number;

  /** Backoff multiplier (exponential backoff) */
  backoffMultiplier: number;

  /** Error codes that should trigger retry */
  retryableErrorCodes: string[];

  /** Max total wait time across all retries */
  maxTotalWaitMs?: number;
}

export interface GasEstimation {
  /** Can gas be estimated before transaction? */
  estimationAvailable: boolean;

  /** Operation to call for estimation (e.g., "estimateGas") */
  estimationMethod?: string;

  /** Typical gas cost (for documentation) */
  typicalGas?: string;

  /** Whether gas is included in transaction signing */
  gasIncludedInSign: boolean;
}

export interface PaginationConfig {
  /** Pagination strategy: "offset" | "cursor" | "keyset" | "page_number" */
  strategy: "offset" | "cursor" | "keyset" | "page_number";

  /** Parameter name for offset/page number */
  limitParam?: string;

  /** Default page size */
  defaultPageSize: number;

  /** Maximum page size */
  maxPageSize: number;

  /** Parameter name for cursor/offset */
  offsetParam?: string;

  /** Response field containing cursor/next_page info */
  cursorField?: string;

  /** Response field containing items list */
  itemsField?: string;

  /** Type reference for pagination cursor type */
  cursorType?: string;
}

export interface OperationExample {
  /** Example title */
  title: string;

  /** Example description */
  description?: string;

  /** Input parameters example */
  input: Record<string, any>;

  /** Expected output example */
  output: Record<string, any>;

  /** Programming language hint: "typescript" | "python" | "go" etc. */
  language?: string;
}

// ============================================================================
// SECTION 4: ERRORS
// ============================================================================

export interface CanonicalError {
  /** Error code: "NOT_FOUND", "UNAUTHORIZED", "INSUFFICIENT_FUNDS" */
  code: string;

  /** HTTP status code (Web2) or error number (Web3) */
  httpStatus?: number;

  /** Error message template */
  message: string;

  /** Detailed explanation */
  description: string;

  /** Error category for handling */
  category: "client_error" | "server_error" | "timeout" | "network" | "validation" | "auth" | "rate_limit" | "business_logic";

  /** Should this error be retried? */
  retryable: boolean;

  /** What should user do to recover? */
  recoveryAction?: string;

  /** Example of when this error occurs */
  example?: string;

  /** URL to documentation about this error */
  docUrl?: string;

  /** Is this error deprecated? */
  deprecated?: string;
}

// ============================================================================
// SECTION 5: AUTHENTICATION
// ============================================================================

export interface AuthModel {
  /** Primary auth type */
  type: "api_key" | "oauth2" | "jwt" | "signature" | "wallet" | "none";

  /** Is authentication required for SDK? */
  required: boolean;

  /** Description of auth flow */
  description: string;

  /** For API key: where to find it */
  apiKeyLocation?: string;

  /** For OAuth: endpoints */
  oauth?: {
    authorizeUrl: string;
    tokenUrl: string;
    revokeUrl?: string;
    scopes: Record<string, string>;
  };

  /** For JWT: issuer, audience, etc. */
  jwt?: {
    issuer?: string;
    audience?: string;
    keySetUrl?: string;
  };

  /** For signatures: signing algorithm */
  signature?: {
    algorithm: string;
    keyFormat: string;
  };

  /** For wallet: supported wallet types */
  wallet?: {
    supportedWallets: string[];
    chainRequired: boolean;
    multipleSigners: boolean;
  };
}

// ============================================================================
// SECTION 6: NETWORKS (Environments, Chains)
// ============================================================================

export interface CanonicalNetwork {
  /** Network identifier: "mainnet", "testnet", "ethereum", "solana" */
  id: string;

  /** Display name: "Ethereum Mainnet", "Solana Devnet" */
  name: string;

  /** Description */
  description: string;

  /** Environment classification */
  environment: "production" | "staging" | "development" | "test";

  /** API base URL (Web2) or RPC endpoint (Web3) */
  endpoint: string;

  /** Chain ID (Web3) */
  chainId?: string;

  /** Network type: "ethereum" | "solana" | "cosmos" etc. */
  networkType?: string;

  /** Is this network currently active? */
  active: boolean;

  /** Operations supported on this network */
  supportedOperations?: string[];

  /** Faucet URL for testnet */
  faucetUrl?: string;

  /** Block explorer URL */
  explorerUrl?: string;

  /** Network status URL */
  statusUrl?: string;
}

// ============================================================================
// SECTION 7: CONSTRAINTS & LIMITS
// ============================================================================

export interface Constraints {
  /** Global rate limit */
  globalRateLimit?: {
    requestsPerSecond: number;
    burstAllowed: number;
  };

  /** Request timeout in ms */
  requestTimeoutMs: number;

  /** Maximum request body size in bytes */
  maxRequestBodyBytes?: number;

  /** Maximum response body size in bytes */
  maxResponseBodyBytes?: number;

  /** Batch operation limits */
  batchLimits?: {
    maxBatchSize: number;
    maxConcurrentBatches: number;
  };

  /** Pagination limits */
  paginationLimits?: {
    maxPageSize: number;
    maxTotalRecords: number;
  };

  /** Field length limits */
  fieldLimits?: Record<string, { minLength?: number; maxLength?: number }>;
}

// ============================================================================
// SECTION 8: WEB3 CONFIGURATION
// ============================================================================

export interface Web3Config {
  /** Supported blockchains */
  chains: Web3Chain[];

  /** Transaction confirmation requirements */
  transactionConfirmation: {
    blockConfirmations: number;
    timeoutMs: number;
  };

  /** Gas settings */
  gas: {
    estimationAvailable: boolean;
    presetGasPrices?: Record<string, string>; // "slow" | "standard" | "fast"
    customGasPrice: boolean;
  };

  /** Wallet integration */
  walletIntegration: {
    injectedProviderName: string; // "ethereum", "solana", etc.
    supportedWallets: string[];
    autoConnect: boolean;
  };

  /** Token standards supported */
  tokenStandards?: string[]; // "ERC20", "ERC721", "SPL", etc.

  /** Smart contract ABIs/interfaces */
  smartContracts?: SmartContractDefinition[];

  /** Event listening/subscription */
  events?: {
    subscriptionMethod: "websocket" | "polling" | "event_log";
    maxConcurrentSubscriptions: number;
  };

  /** Multi-sig support */
  multiSig?: {
    supported: boolean;
    requiredSignatures: number;
    maxSigners: number;
  };
}

export interface Web3Chain {
  /** Chain ID */
  id: string;

  /** Display name */
  name: string;

  /** Chain type */
  type: "evm" | "solana" | "cosmos" | "other";

  /** Native token symbol */
  nativeToken: string;

  /** Decimals for native token */
  decimals: number;

  /** RPC endpoints */
  rpcEndpoints: string[];

  /** Block time in seconds */
  blockTimeSeconds: number;

  /** Finality time in blocks */
  finalityBlocks: number;
}

export interface SmartContractDefinition {
  /** Contract name */
  name: string;

  /** Contract address(es) by network */
  addresses: Record<string, string>;

  /** Contract ABI (JSON stringified) */
  abi: string;

  /** Constructor parameters for deployment */
  constructor?: {
    parameters: OperationParameter[];
  };

  /** Contract functions exposed by SDK */
  functions: Record<string, CanonicalOperation>;

  /** Contract events */
  events?: Record<string, SmartContractEvent>;
}

export interface SmartContractEvent {
  /** Event name */
  name: string;

  /** Event description */
  description: string;

  /** Event parameters */
  parameters: OperationParameter[];

  /** Indexed parameters (for filtering) */
  indexedParameters: string[];
}

// ============================================================================
// SECTION 9: EVENTS (Subscriptions, Webhooks, Smart Contract Events)
// ============================================================================

export interface CanonicalEvent {
  /** Event ID */
  id: string;

  /** Event name */
  name: string;

  /** Event description */
  description: string;

  /** Event type: "webhook" | "websocket" | "smart_contract" | "polling" */
  type: "webhook" | "websocket" | "smart_contract" | "polling";

  /** Event payload type reference */
  payloadType: string;

  /** When is this event triggered? */
  triggerCondition: string;

  /** For webhooks: retry policy */
  webhookRetry?: {
    maxAttempts: number;
    backoffMs: number;
    backoffMultiplier: number;
  };

  /** Supported networks for this event */
  supportedNetworks: string[];

  /** Example payload */
  example?: any;
}

// ============================================================================
// SECTION 10: SDK CONVENTIONS
// ============================================================================

export interface SDKConventions {
  /** How errors are named */
  errorNaming: "PascalCase" | "snake_case" | "SCREAMING_SNAKE_CASE";

  /** How methods are named */
  methodNaming: "camelCase" | "snake_case" | "PascalCase";

  /** How should pagination be handled by default? */
  paginationDefault: "offset" | "cursor" | "auto";

  /** Should SDK automatically retry failed requests? */
  autoRetry: boolean;

  /** Should SDK log requests/responses? */
  enableLogging: boolean;

  /** Default timeout behavior */
  timeoutBehavior: "throw" | "return_partial" | "retry";

  /** How to handle batch operations */
  batchBehavior: "sequential" | "parallel";

  /** Response wrapper pattern */
  responseWrapper?: {
    type: "envelope" | "none";
    dataField?: string;
    errorField?: string;
    statusField?: string;
  };

  /** Versioning strategy for SDK methods */
  versioningStrategy: "none" | "suffix" | "header";

  /** Type naming convention */
  typeNaming: "PascalCase" | "snake_case";

  /** Should SDK expose low-level methods? */
  exposeLowLevel: boolean;

  /** SDK client constructor pattern */
  clientConstructor: "class" | "factory" | "functional";
}

// ============================================================================
// SECTION 11: DOCUMENTATION METADATA
// ============================================================================

export interface DocumentationMetadata {
  /** Base URL for all docs links */
  docsBaseUrl: string;

  /** Whether to include code examples */
  includeExamples: boolean;

  /** Languages for code examples */
  exampleLanguages: string[];

  /** README template location */
  readmeTemplate?: string;

  /** Tutorial topics to generate */
  tutorials?: string[];

  /** Frequently asked questions */
  faqs?: FAQ[];

  /** Glossary terms */
  glossary?: Record<string, string>;

  /** Changelog URL or details */
  changelog?: {
    url?: string;
    generateFromSpec: boolean;
  };

  /** Legal/compliance info */
  legal?: {
    termsUrl?: string;
    privacyUrl?: string;
    copyrightNotice?: string;
  };
}

export interface FAQ {
  /** Question */
  question: string;

  /** Answer */
  answer: string;

  /** Related operation IDs */
  relatedOperations?: string[];
}

// ============================================================================
// TYPE VALIDATION & HELPERS
// ============================================================================

/**
 * Validates that all referenced types exist in the types record
 * Call during schema ingestion to catch errors early
 */
export function validateSchemaReferences(schema: ProductCanonicalSchema): string[] {
  const errors: string[] = [];
  const validTypes = new Set(Object.keys(schema.types));
  const builtInTypes = new Set([
    "string",
    "number",
    "boolean",
    "bytes",
    "bigint",
    "timestamp",
    "null",
    "any",
  ]);

  // Check all type references are valid
  schema.operations.forEach((op) => {
    if (!validTypes.has(op.responseType) && !builtInTypes.has(op.responseType)) {
      errors.push(`Operation ${op.id}: responseType "${op.responseType}" not found`);
    }

    op.parameters.forEach((param) => {
      if (!validTypes.has(param.type) && !builtInTypes.has(param.type)) {
        errors.push(
          `Operation ${op.id}: parameter "${param.name}" type "${param.type}" not found`
        );
      }
    });

    op.errorCodes.forEach((code) => {
      if (!schema.errors.some((e) => e.code === code)) {
        errors.push(`Operation ${op.id}: error code "${code}" not defined`);
      }
    });
  });

  // Check nested type references
  Object.entries(schema.types).forEach(([typeName, type]) => {
    if (type.category === "object" && type.fields) {
      Object.entries(type.fields).forEach(([fieldName, field]) => {
        if (!validTypes.has(field.type) && !builtInTypes.has(field.type)) {
          errors.push(
            `Type ${typeName}: field "${fieldName}" type "${field.type}" not found`
          );
        }
      });
    }

    if (type.category === "array" && type.elementType) {
      if (!validTypes.has(type.elementType) && !builtInTypes.has(type.elementType)) {
        errors.push(`Type ${typeName}: elementType "${type.elementType}" not found`);
      }
    }

    if (type.category === "union" && type.unionTypes) {
      type.unionTypes.forEach((t) => {
        if (!validTypes.has(t) && !builtInTypes.has(t)) {
          errors.push(`Type ${typeName}: union type "${t}" not found`);
        }
      });
    }
  });

  return errors;
}