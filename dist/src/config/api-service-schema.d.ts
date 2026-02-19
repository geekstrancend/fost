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
    input: {
        content?: string;
        url?: string;
        format: 'openapi' | 'graphql' | 'abi' | 'wsdl';
        title?: string;
    };
    language: string;
    type: 'web2' | 'web3' | 'hybrid';
    name?: string;
    version?: string;
    options?: {
        includeTests?: boolean;
        includeDocumentation?: boolean;
        customRules?: string[];
        packageManager?: 'npm' | 'yarn' | 'pnpm';
        bundler?: 'webpack' | 'esbuild' | 'rollup';
    };
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
    id: string;
    status: 'queued' | 'processing' | 'completed' | 'failed';
    progress: number;
    output?: {
        downloadUrl: string;
        expiresIn: number;
        fileSize: number;
        files: string[];
    };
    metrics: {
        processingTime: number;
        inputSize: number;
        outputSize: number;
        filesGenerated: number;
    };
    errors?: Array<{
        code: string;
        message: string;
        file?: string;
        line?: number;
    }>;
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
            duration: number;
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
        parallel?: number;
        stopOnError?: boolean;
    };
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
    event: 'generation.started' | 'generation.progress' | 'generation.completed' | 'generation.failed' | 'validation.completed' | 'batch.completed';
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
export interface ListGenerationsResponse extends PaginatedResponse<GetGenerationResponse> {
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
        label: string;
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
    expiresIn?: number;
}
export interface CreateAPIKeyResponse {
    id: string;
    key: string;
    prefix: string;
    name: string;
    createdAt: string;
}
/**
 * Error Response
 */
export interface ErrorResponse {
    error: {
        code: string;
        message: string;
        statusCode: number;
        requestId: string;
        timestamp: string;
        details?: {
            field?: string;
            expected?: any;
            received?: any;
        };
        retryAfter?: number;
    };
}
/**
 * Rate Limit Headers
 */
export interface RateLimitHeaders {
    'x-ratelimit-limit': string;
    'x-ratelimit-remaining': string;
    'x-ratelimit-reset': string;
    'x-ratelimit-retry-after': string;
}
/**
 * API Endpoints Summary
 */
export declare const API_ENDPOINTS: {
    readonly 'POST /v1/generate': "Generate SDK from specification";
    readonly 'GET /v1/generate/{id}': "Get generation status";
    readonly 'GET /v1/generations': "List all generations";
    readonly 'DELETE /v1/generations/{id}': "Delete a generation";
    readonly 'POST /v1/batch/generate': "Batch SDK generation";
    readonly 'GET /v1/batch/{id}': "Get batch status";
    readonly 'POST /v1/validate': "Validate specification";
    readonly 'POST /v1/validate/batch': "Batch validation";
    readonly 'GET /v1/usage': "Get usage report";
    readonly 'GET /v1/billing/usage': "Get billable usage";
    readonly 'GET /v1/invoices': "List invoices";
    readonly 'GET /v1/invoices/{id}': "Get invoice details";
    readonly 'POST /v1/keys': "Create API key";
    readonly 'GET /v1/keys': "List API keys";
    readonly 'DELETE /v1/keys/{id}': "Delete API key";
    readonly 'POST /v1/keys/{id}/rotate': "Rotate API key";
    readonly 'GET /v1/account': "Get account info";
    readonly 'PUT /v1/account': "Update account";
    readonly 'POST /v1/account/email': "Change email";
    readonly 'POST /v1/webhooks': "Create webhook";
    readonly 'GET /v1/webhooks': "List webhooks";
    readonly 'PUT /v1/webhooks/{id}': "Update webhook";
    readonly 'DELETE /v1/webhooks/{id}': "Delete webhook";
    readonly 'POST /v1/webhooks/{id}/test': "Test webhook";
};
/**
 * API Authentication Methods
 */
export declare const AUTH_METHODS: {
    readonly 'API Key': "Header: Authorization: Bearer YOUR_API_KEY";
    readonly 'OAuth 2.0': "For web applications";
    readonly 'JWT Token': "For service-to-service";
};
//# sourceMappingURL=api-service-schema.d.ts.map