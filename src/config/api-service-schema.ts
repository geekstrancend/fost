/**
 * FOST API Service Schema
 * Defines REST API endpoints, requests, and responses
 */

/**
 * Base API Response
 */
export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, any>;
  };
  meta?: {
    timestamp: string;
    requestId: string;
    version: string;
  };
}

/**
 * Paginated Response
 */
export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

/**
 * SDK Generation Request
 * POST /api/v1/generate
 */
export interface GenerateSDKRequest {
  // Input specification
  input: {
    content?: string; // Raw OpenAPI/GraphQL/ABI content
    url?: string; // URL to spec
    format: 'openapi' | 'graphql' | 'abi' | 'wsdl';
    title?: string;
  };

  // Generation options
  language: string;
  type: 'web2' | 'web3' | 'hybrid';
  name?: string;
  version?: string;

  // Advanced options
  options?: {
    includeTests?: boolean;
    includeDocumentation?: boolean;
    customRules?: string[];
    packageManager?: 'npm' | 'yarn' | 'pnpm';
    bundler?: 'webpack' | 'esbuild' | 'rollup';
  };

  // Delivery
  delivery?: {
    format: 'zip' | 'tar' | 'stream';
    includeSourceMap?: boolean;
    minify?: boolean;
  };
}

/**
 * SDK Generation Response
 */
export interface GenerateSDKResponse {
  id: string; // Generation ID
  status: 'queued' | 'processing' | 'completed' | 'failed';
  progress: number; // 0-100

  // Output
  output?: {
    downloadUrl: string;
    expiresIn: number; // seconds
    fileSize: number; // bytes
    files: string[]; // List of generated files
  };

  // Metadata
  metrics: {
    processingTime: number; // milliseconds
    inputSize: number; // bytes
    outputSize: number; // bytes
    filesGenerated: number;
  };

  // Errors
  errors?: Array<{
    code: string;
    message: string;
    file?: string;
    line?: number;
  }>;

  // Links
  links: {
    download?: string;
    webhook?: string;
    status?: string;
  };
}

/**
 * Validation Request
 * POST /api/v1/validate
 */
export interface ValidateRequest {
  input: {
    content?: string;
    url?: string;
    format: 'openapi' | 'graphql' | 'abi' | 'wsdl';
  };
  type: 'web2' | 'web3';
  strict?: boolean;
}

/**
 * Validation Response
 */
export interface ValidateResponse {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  suggestions: string[];

  metadata: {
    spec: {
      title?: string;
      version?: string;
      paths?: number;
      schemas?: number;
      methods?: number;
    };
    processing: {
      duration: number; // ms
      parsedAt: string;
    };
  };
}

export interface ValidationError {
  code: string;
  message: string;
  path?: string;
  severity: 'error' | 'critical';
  suggestion?: string;
}

export interface ValidationWarning {
  code: string;
  message: string;
  path?: string;
  suggestion?: string;
}

/**
 * Batch Generation Request
 * POST /api/v1/batch/generate
 */
export interface BatchGenerateRequest {
  specifications: Array<{
    id?: string;
    input: GenerateSDKRequest['input'];
    language: string;
    type: string;
  }>;

  options?: {
    parallel?: number; // max parallel generations
    stopOnError?: boolean;
  };

  // Webhook for completion
  webhook?: {
    url: string;
    events: ('start' | 'progress' | 'complete' | 'error')[];
  };
}

/**
 * Batch Generation Response
 */
export interface BatchGenerateResponse {
  batchId: string;
  totalJobs: number;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  progress: {
    completed: number;
    failed: number;
    remaining: number;
  };
  jobs: Array<{
    id: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    response?: GenerateSDKResponse;
    error?: string;
  }>;
}

/**
 * Webhook Event Payload
 */
export interface WebhookPayload {
  event:
    | 'generation.started'
    | 'generation.progress'
    | 'generation.completed'
    | 'generation.failed'
    | 'validation.completed'
    | 'batch.completed';

  data: {
    id: string;
    timestamp: string;
    status: string;
    progress?: number;
    result?: any;
    error?: {
      code: string;
      message: string;
    };
  };

  meta: {
    requestId: string;
    webhookId: string;
  };
}

/**
 * Get Generation Status
 * GET /api/v1/generations/{id}
 */
export interface GetGenerationResponse {
  id: string;
  status: 'completed' | 'processing' | 'failed';
  createdAt: string;
  completedAt?: string;

  input: {
    format: string;
    language: string;
    type: string;
  };

  output?: GenerateSDKResponse['output'];

  metrics: {
    processingTime: number;
    inputSize: number;
    outputSize: number;
  };
}

/**
 * List Generations
 * GET /api/v1/generations
 */
export interface ListGenerationsRequest {
  page?: number;
  pageSize?: number;
  status?: string;
  language?: string;
  sortBy?: 'createdAt' | 'name' | 'size';
  sortOrder?: 'asc' | 'desc';
}

export interface ListGenerationsResponse
  extends PaginatedResponse<GetGenerationResponse> {
  // Empty interface for type safety - extends PaginatedResponse
}

/**
 * Usage Report
 * GET /api/v1/usage
 */
export interface UsageReportRequest {
  period?: 'day' | 'week' | 'month';
  startDate?: string;
  endDate?: string;
  groupBy?: 'day' | 'week' | 'month' | 'language' | 'type';
}

export interface UsageReportResponse {
  period: {
    start: string;
    end: string;
  };

  summary: {
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    totalProcessingTime: number;
    averageProcessingTime: number;
    totalDataGenerated: number;
  };

  breakdown: Array<{
    label: string; // date, language, etc
    requests: number;
    success: number;
    failed: number;
    dataGenerated: number;
    cost: number;
  }>;

  billing: {
    billableRequests: number;
    freeRequests: number;
    cost: number;
  };
}

/**
 * API Key Management
 * POST /api/v1/keys
 */
export interface CreateAPIKeyRequest {
  name: string;
  description?: string;
  permissions: string[];
  rateLimit?: number;
  monthlyLimit?: number;
  allowedOrigins?: string[];
  ipWhitelist?: string[];
  expiresIn?: number; // days
}

export interface CreateAPIKeyResponse {
  id: string;
  key: string; // Only returned once
  prefix: string;
  name: string;
  createdAt: string;
}

/**
 * Error Response
 */
export interface ErrorResponse {
  error: {
    code: string; // e.g., 'INVALID_INPUT', 'RATE_LIMIT_EXCEEDED'
    message: string;
    statusCode: number;
    requestId: string;
    timestamp: string;

    // Additional context
    details?: {
      field?: string;
      expected?: any;
      received?: any;
    };

    // Retry information
    retryAfter?: number; // seconds
  };
}

/**
 * Rate Limit Headers
 */
export interface RateLimitHeaders {
  'x-ratelimit-limit': string; // max requests
  'x-ratelimit-remaining': string; // remaining requests
  'x-ratelimit-reset': string; // unix timestamp
  'x-ratelimit-retry-after': string; // seconds
}

/**
 * API Endpoints Summary
 */
export const API_ENDPOINTS = {
  // SDK Generation
  'POST /v1/generate': 'Generate SDK from specification',
  'GET /v1/generate/{id}': 'Get generation status',
  'GET /v1/generations': 'List all generations',
  'DELETE /v1/generations/{id}': 'Delete a generation',

  // Batch Operations
  'POST /v1/batch/generate': 'Batch SDK generation',
  'GET /v1/batch/{id}': 'Get batch status',

  // Validation
  'POST /v1/validate': 'Validate specification',
  'POST /v1/validate/batch': 'Batch validation',

  // Usage & Billing
  'GET /v1/usage': 'Get usage report',
  'GET /v1/billing/usage': 'Get billable usage',
  'GET /v1/invoices': 'List invoices',
  'GET /v1/invoices/{id}': 'Get invoice details',

  // API Keys
  'POST /v1/keys': 'Create API key',
  'GET /v1/keys': 'List API keys',
  'DELETE /v1/keys/{id}': 'Delete API key',
  'POST /v1/keys/{id}/rotate': 'Rotate API key',

  // Account
  'GET /v1/account': 'Get account info',
  'PUT /v1/account': 'Update account',
  'POST /v1/account/email': 'Change email',

  // Webhooks
  'POST /v1/webhooks': 'Create webhook',
  'GET /v1/webhooks': 'List webhooks',
  'PUT /v1/webhooks/{id}': 'Update webhook',
  'DELETE /v1/webhooks/{id}': 'Delete webhook',
  'POST /v1/webhooks/{id}/test': 'Test webhook',
} as const;

/**
 * API Authentication Methods
 */
export const AUTH_METHODS = {
  'API Key': 'Header: Authorization: Bearer YOUR_API_KEY',
  'OAuth 2.0': 'For web applications',
  'JWT Token': 'For service-to-service',
} as const;
