"use strict";
/**
 * FOST API Service Schema
 * Defines REST API endpoints, requests, and responses
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AUTH_METHODS = exports.API_ENDPOINTS = void 0;
/**
 * API Endpoints Summary
 */
exports.API_ENDPOINTS = {
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
};
/**
 * API Authentication Methods
 */
exports.AUTH_METHODS = {
    'API Key': 'Header: Authorization: Bearer YOUR_API_KEY',
    'OAuth 2.0': 'For web applications',
    'JWT Token': 'For service-to-service',
};
//# sourceMappingURL=api-service-schema.js.map