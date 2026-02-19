/**
 * INPUT ANALYSIS LAYER - EXAMPLES
 *
 * Demonstrates normalization of real-world API specs and smart contracts.
 * Shows deterministic parsing with no hallucination.
 */

import { InputSpec } from "./types";
import { normalizeInput } from "./normalizer";

// ============================================================================
// EXAMPLE 1: OpenAPI/REST Spec (Stripe-like Payment API)
// ============================================================================

export const EXAMPLE_OPENAPI_SPEC: InputSpec = {
  type: "openapi-3.0",
  format: "json",
  source: "https://api.example.com/openapi.json",
  rawContent: {
    openapi: "3.0.0",
    info: {
      title: "Payment API",
      version: "1.0.0",
      description: "Simple payment processing API",
      contact: {
        name: "API Support",
        email: "support@example.com",
      },
      license: {
        name: "MIT",
      },
    },
    servers: [
      {
        url: "https://api.example.com/v1",
        description: "Production",
      },
      {
        url: "https://sandbox.example.com/v1",
        description: "Sandbox",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        PaymentIntent: {
          type: "object",
          description: "A payment intent object",
          properties: {
            id: {
              type: "string",
              description: "Unique payment intent ID",
              example: "pi_1234567890",
            },
            amount: {
              type: "integer",
              description: "Amount in cents",
              minimum: 1,
              example: 5000,
            },
            currency: {
              type: "string",
              description: "ISO 4217 currency code",
              pattern: "^[a-z]{3}$",
              example: "usd",
            },
            status: {
              type: "string",
              enum: ["pending", "succeeded", "failed", "canceled"],
              example: "succeeded",
            },
            customer_id: {
              type: "string",
              description: "Associated customer",
              nullable: true,
              example: "cus_123456",
            },
            description: {
              type: "string",
              maxLength: 1000,
              nullable: true,
            },
            created_at: {
              type: "string",
              format: "date-time",
              example: "2024-01-14T10:00:00Z",
            },
          },
          required: ["id", "amount", "currency", "status", "created_at"],
          additionalProperties: false,
        },

        CreatePaymentRequest: {
          type: "object",
          description: "Request to create a payment intent",
          properties: {
            amount: {
              type: "integer",
              description: "Amount in cents",
              minimum: 1,
              example: 5000,
            },
            currency: {
              type: "string",
              pattern: "^[a-z]{3}$",
              example: "usd",
            },
            payment_method: {
              type: "string",
              description: "Token or card ID",
              example: "pm_123456",
            },
            description: {
              type: "string",
              maxLength: 1000,
              nullable: true,
            },
          },
          required: ["amount", "currency", "payment_method"],
        },

        Error: {
          type: "object",
          properties: {
            code: {
              type: "string",
              example: "INVALID_REQUEST",
            },
            message: {
              type: "string",
            },
          },
          required: ["code", "message"],
        },
      },
    },
    paths: {
      "/payments": {
        post: {
          operationId: "createPayment",
          summary: "Create a payment intent",
          description: "Create a new payment intent to process a payment",
          tags: ["payments"],
          security: [
            {
              bearerAuth: [],
            },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/CreatePaymentRequest",
                },
              },
            },
          },
          responses: {
            "201": {
              description: "Payment intent created",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/PaymentIntent",
                  },
                },
              },
            },
            "400": {
              description: "Bad request",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/Error",
                  },
                },
              },
            },
            "401": {
              description: "Unauthorized",
            },
            "429": {
              description: "Rate limited",
            },
          },
        },

        get: {
          operationId: "listPayments",
          summary: "List payment intents",
          description: "List all payment intents for your account",
          tags: ["payments"],
          security: [
            {
              bearerAuth: [],
            },
          ],
          parameters: [
            {
              name: "limit",
              in: "query",
              description: "Number of results to return",
              required: false,
              schema: {
                type: "integer",
                default: 10,
                minimum: 1,
                maximum: 100,
              },
            },
            {
              name: "cursor",
              in: "query",
              description: "Pagination cursor",
              required: false,
              schema: {
                type: "string",
              },
            },
          ],
          responses: {
            "200": {
              description: "List of payment intents",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      data: {
                        type: "array",
                        items: {
                          $ref: "#/components/schemas/PaymentIntent",
                        },
                      },
                      has_more: {
                        type: "boolean",
                      },
                      next_cursor: {
                        type: "string",
                        nullable: true,
                      },
                    },
                  },
                },
              },
            },
            "401": {
              description: "Unauthorized",
            },
          },
        },
      },

      "/payments/{payment_id}": {
        get: {
          operationId: "getPayment",
          summary: "Get a payment intent",
          tags: ["payments"],
          security: [
            {
              bearerAuth: [],
            },
          ],
          parameters: [
            {
              name: "payment_id",
              in: "path",
              required: true,
              description: "Payment intent ID",
              schema: {
                type: "string",
              },
            },
          ],
          responses: {
            "200": {
              description: "Payment intent details",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/PaymentIntent",
                  },
                },
              },
            },
            "404": {
              description: "Payment not found",
            },
          },
        },
      },
    },
  },
};

/**
 * Expected normalized output for EXAMPLE_OPENAPI_SPEC:
 *
 * product: {
 *   name: "payment-api",
 *   version: "1.0.0",
 *   apiVersion: "3.0.0",
 *   description: "Simple payment processing API"
 * }
 *
 * types: {
 *   PaymentIntent: {
 *     name: "PaymentIntent",
 *     type: "object",
 *     fields: {
 *       id: { type: "string", required: true },
 *       amount: { type: "integer", required: true },
 *       currency: { type: "string", required: true },
 *       status: { type: "enum", enum: ["pending", "succeeded", "failed", "canceled"] },
 *       ...
 *     }
 *   },
 *   CreatePaymentRequest: {...},
 *   Error: {...}
 * }
 *
 * operations: [
 *   {
 *     id: "createPayment",
 *     name: "Create a payment intent",
 *     method: "POST",
 *     path: "/payments",
 *     parameters: [{ name: "amount", type: "integer", location: "body", required: true }],
 *     response: { type: "PaymentIntent", statusCode: 201 },
 *     errors: ["BAD_REQUEST", "UNAUTHORIZED", "RATE_LIMITED"],
 *     authentication: { required: true, type: "bearer" }
 *   },
 *   {
 *     id: "listPayments",
 *     name: "List payment intents",
 *     method: "GET",
 *     path: "/payments",
 *     parameters: [
 *       { name: "limit", type: "integer", location: "query", required: false },
 *       { name: "cursor", type: "string", location: "query", required: false }
 *     ],
 *     response: { type: "object" },
 *     errors: ["UNAUTHORIZED"]
 *   },
 *   {
 *     id: "getPayment",
 *     name: "Get a payment intent",
 *     method: "GET",
 *     path: "/payments/{payment_id}",
 *     parameters: [{ name: "payment_id", type: "string", location: "path", required: true }],
 *     response: { type: "PaymentIntent", statusCode: 200 },
 *     errors: ["NOT_FOUND"]
 *   }
 * ]
 *
 * authentication: {
 *   type: "bearer",
 *   required: true
 * }
 */

// ============================================================================
// EXAMPLE 2: Smart Contract ABI (Uniswap V3 Router)
// ============================================================================

export const EXAMPLE_CONTRACT_ABI: InputSpec = {
  type: "contract-abi",
  format: "json",
  source: "uniswap-v3-router-contract",
  metadata: {
    name: "UniswapV3Router",
    version: "1.0.0",
    description: "Uniswap V3 Swap Router",
  },
  rawContent: [
    {
      type: "constructor",
      inputs: [
        {
          name: "factory",
          type: "address",
          description: "The factory contract",
        },
        {
          name: "positionManager",
          type: "address",
        },
        {
          name: "weth9",
          type: "address",
        },
      ],
    },
    {
      type: "function",
      name: "exactInputSingle",
      stateMutability: "payable",
      inputs: [
        {
          name: "params",
          type: "tuple",
          components: [
            {
              name: "tokenIn",
              type: "address",
              description: "Input token address",
            },
            {
              name: "tokenOut",
              type: "address",
              description: "Output token address",
            },
            {
              name: "fee",
              type: "uint24",
              description: "Fee tier (100, 500, 3000, 10000)",
            },
            {
              name: "recipient",
              type: "address",
              description: "Recipient of output tokens",
            },
            {
              name: "amountIn",
              type: "uint256",
              description: "Amount of input tokens",
            },
            {
              name: "amountOutMinimum",
              type: "uint256",
              description: "Minimum output amount (slippage protection)",
            },
            {
              name: "sqrtPriceLimitX96",
              type: "uint160",
              description: "Price limit for execution",
            },
          ],
        },
      ],
      outputs: [
        {
          name: "amountOut",
          type: "uint256",
          description: "Amount of output tokens received",
        },
      ],
      description: "Execute a swap with exact input",
    },
    {
      type: "function",
      name: "exactOutputSingle",
      stateMutability: "payable",
      inputs: [
        {
          name: "params",
          type: "tuple",
          components: [
            {
              name: "tokenIn",
              type: "address",
            },
            {
              name: "tokenOut",
              type: "address",
            },
            {
              name: "fee",
              type: "uint24",
            },
            {
              name: "recipient",
              type: "address",
            },
            {
              name: "amountOut",
              type: "uint256",
              description: "Exact output amount desired",
            },
            {
              name: "amountInMaximum",
              type: "uint256",
              description: "Maximum input amount (slippage protection)",
            },
            {
              name: "sqrtPriceLimitX96",
              type: "uint160",
            },
          ],
        },
      ],
      outputs: [
        {
          name: "amountIn",
          type: "uint256",
        },
      ],
      description: "Execute a swap with exact output",
    },
    {
      type: "function",
      name: "estimateGas",
      stateMutability: "view",
      inputs: [
        {
          name: "tokenIn",
          type: "address",
        },
        {
          name: "tokenOut",
          type: "address",
        },
        {
          name: "amountIn",
          type: "uint256",
        },
      ],
      outputs: [
        {
          name: "gasEstimate",
          type: "uint256",
        },
      ],
      description: "Estimate gas for a swap",
    },
    {
      type: "event",
      name: "Swap",
      inputs: [
        {
          name: "sender",
          type: "address",
          indexed: true,
          description: "Address that initiated swap",
        },
        {
          name: "amount0",
          type: "int256",
          indexed: false,
          description: "Change in token0 amount",
        },
        {
          name: "amount1",
          type: "int256",
          indexed: false,
          description: "Change in token1 amount",
        },
        {
          name: "sqrtPriceX96",
          type: "uint160",
          indexed: false,
          description: "Price after swap",
        },
        {
          name: "tick",
          type: "int24",
          indexed: false,
          description: "Current tick",
        },
      ],
      description: "Emitted when a swap occurs",
    },
    {
      type: "error",
      name: "InsufficientBalance",
      inputs: [
        {
          name: "have",
          type: "uint256",
        },
        {
          name: "want",
          type: "uint256",
        },
      ],
    },
    {
      type: "error",
      name: "TooMuchSlippage",
      inputs: [],
    },
  ],
};

/**
 * Expected normalized output for EXAMPLE_CONTRACT_ABI:
 *
 * product: {
 *   name: "uniswapv3router",
 *   version: "1.0.0",
 *   description: "Uniswap V3 Swap Router"
 * }
 *
 * operations: [
 *   {
 *     id: "exactInputSingle",
 *     name: "exactInputSingle",
 *     method: "function",
 *     functionName: "exactInputSingle",
 *     parameters: [
 *       {
 *         name: "params",
 *         type: "tuple",
 *         location: "input",
 *         required: true
 *       }
 *     ],
 *     response: { type: "BigInt" },
 *     errors: ["REVERT", "GAS_ERROR"],
 *     authentication: { required: true, type: "wallet" },
 *     tags: ["payable"]
 *   },
 *   {
 *     id: "estimateGas",
 *     name: "estimateGas",
 *     method: "function",
 *     functionName: "estimateGas",
 *     parameters: [...],
 *     response: { type: "BigInt" },
 *     errors: ["REVERT"],
 *     authentication: { required: false, type: "none" },
 *     tags: ["view"]
 *   }
 * ]
 *
 * errors: [
 *   { code: "REVERT", message: "Transaction reverted" },
 *   { code: "InsufficientBalance", message: "Insufficient balance" },
 *   { code: "TooMuchSlippage", message: "Too much slippage" }
 * ]
 *
 * authentication: {
 *   type: "custom",
 *   required: true,
 *   description: "Requires signed transactions via wallet"
 * }
 */

// ============================================================================
// EXAMPLE 3: Test Normalization
// ============================================================================

/**
 * Run normalization examples
 */
export function runExamples(): void {
  console.log("=== INPUT ANALYSIS LAYER - EXAMPLES ===\n");

  // Example 1: OpenAPI
  console.log("--- EXAMPLE 1: OpenAPI REST Spec ---");
  const openApiResult = normalizeInput(EXAMPLE_OPENAPI_SPEC);

  if (openApiResult.success) {
    console.log("✓ OpenAPI normalization succeeded");
    console.log(`  - Product: ${openApiResult.spec?.product.name}`);
    console.log(`  - Types: ${Object.keys(openApiResult.spec?.types || {}).length}`);
    console.log(`  - Operations: ${openApiResult.spec?.operations.length}`);
    console.log(`  - Errors: ${openApiResult.spec?.errors.length}`);
  } else {
    console.log(`✗ OpenAPI normalization failed: ${openApiResult.error}`);
    if (openApiResult.validationErrors) {
      openApiResult.validationErrors.forEach((e) => {
        console.log(`  - ${e.code}: ${e.message}`);
      });
    }
  }

  if (openApiResult.warnings.length > 0) {
    console.log(`  Warnings: ${openApiResult.warnings.length}`);
  }

  console.log();

  // Example 2: Contract ABI
  console.log("--- EXAMPLE 2: Smart Contract ABI ---");
  const abiResult = normalizeInput(EXAMPLE_CONTRACT_ABI);

  if (abiResult.success) {
    console.log("✓ ABI normalization succeeded");
    console.log(`  - Product: ${abiResult.spec?.product.name}`);
    console.log(`  - Operations: ${abiResult.spec?.operations.length}`);
    console.log(`  - Errors: ${abiResult.spec?.errors.length}`);
    console.log(`  - Authentication: ${abiResult.spec?.authentication.type}`);
  } else {
    console.log(`✗ ABI normalization failed: ${abiResult.error}`);
    if (abiResult.validationErrors) {
      abiResult.validationErrors.forEach((e) => {
        console.log(`  - ${e.code}: ${e.message}`);
      });
    }
  }

  if (abiResult.warnings.length > 0) {
    console.log(`  Warnings: ${abiResult.warnings.length}`);
  }
}
