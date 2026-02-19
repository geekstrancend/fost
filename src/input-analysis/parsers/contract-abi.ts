/**
 * Smart Contract ABI Parser (Web3)
 *
 * Deterministically converts Ethereum ABI to NormalizedSpec.
 * Handles complex type mappings and Solidity-specific concepts.
 */

import {
  InputSpec,
  NormalizedSpec,
  NormalizedProductInfo,
  NormalizedType,
  NormalizedOperation,
  NormalizedParameter,
  NormalizedError,
  NormalizedAuth,
  NormalizedNetwork,
  ParserResult,
} from "../types";
import { BaseParser } from "../base-parser";

export class ContractABIParser extends BaseParser {
  canParse(input: InputSpec): boolean {
    return input.type === "contract-abi";
  }

  parse(input: InputSpec): ParserResult {
    this.resetState();

    try {
      const abi = input.rawContent;

      // Validate ABI structure
      if (!Array.isArray(abi)) {
        this.addError("INVALID_ABI", "ABI must be a JSON array");
        return { success: false, errors: this.errors, warnings: this.warnings };
      }

      if (abi.length === 0) {
        this.addWarning("warning", "EMPTY_ABI", "ABI is empty");
      }

      // Extract contract info from metadata if available
      const product = this.extractProductInfo(input.metadata || {});

      // Extract types from ABI events and function parameters
      const types = this.extractTypesFromABI(abi);

      // Extract operations from functions
      const operations = this.extractOperations(abi);

      // Extract errors from custom error definitions
      const errors = this.extractErrors(abi);

      // Web3: auth is always wallet-based
      const authentication: NormalizedAuth = {
        type: "custom", // Wallet signer
        required: true,
        description: "Requires signed transactions via wallet",
      };

      // Networks will be filled in by chain metadata parser
      const networks: NormalizedNetwork[] = [];

      const normalized: NormalizedSpec = {
        product,
        types,
        operations,
        errors,
        authentication,
        networks,
        source: {
          inputType: input.type,
          sourcePath: input.source,
          parsedAt: new Date().toISOString(),
          parser: "ContractABIParser",
        },
        normalizationNotes: this.warnings,
      };

      return {
        success: this.errors.length === 0,
        normalized,
        errors: this.errors,
        warnings: this.warnings,
      };
    } catch (e) {
      this.addError("PARSE_EXCEPTION", `Unexpected error: ${(e as Error).message}`);
      return { success: false, errors: this.errors, warnings: this.warnings };
    }
  }

  private extractProductInfo(metadata: any): NormalizedProductInfo {
    const contractName = metadata.name || "SmartContract";

    return {
      name: contractName.toLowerCase(),
      version: metadata.version || "1.0.0",
      apiVersion: "solidity-1.0",
      description: metadata.description || `Smart Contract: ${contractName}`,
      title: contractName,
    };
  }

  private extractTypesFromABI(abi: any[]): Record<string, NormalizedType> {
    const types: Record<string, NormalizedType> = {};

    // Add common Solidity type aliases
    const solidityTypes: Record<string, NormalizedType> = {
      Address: {
        name: "Address",
        description: "Ethereum address",
        type: "primitive",
        primitiveType: "string",
        nullable: false,
      },
      BigInt: {
        name: "BigInt",
        description: "Large integer value",
        type: "primitive",
        primitiveType: "bigint",
        nullable: false,
      },
      Bytes32: {
        name: "Bytes32",
        description: "32-byte hash",
        type: "primitive",
        primitiveType: "bytes",
        nullable: false,
      },
    };

    Object.assign(types, solidityTypes);

    // Extract custom types from events
    abi.forEach((item) => {
      if (item.type === "event") {
        this.extractEventTypes(item, types);
      }
    });

    return types;
  }

  private extractEventTypes(event: any, types: Record<string, NormalizedType>): void {
    const eventName = event.name;

    // Create a type for this event
    types[`${eventName}Event`] = {
      name: `${eventName}Event`,
      description: event.description || `Event emitted by ${eventName}`,
      type: "object",
      nullable: false,
      fields: {},
    };

    if (event.inputs) {
      event.inputs.forEach((input: any) => {
        types[`${eventName}Event`].fields![input.name] = {
          name: input.name,
          type: this.normalizeSolidityType(input.type),
          description: input.description || "",
          required: true,
          nullable: false,
          example: this.getExampleForSolidityType(input.type),
        };
      });
    }
  }

  private extractOperations(abi: any[]): NormalizedOperation[] {
    const operations: NormalizedOperation[] = [];

    abi.forEach((item) => {
      if (item.type === "function" || item.type === "fallback" || item.type === "receive") {
        const operation = this.normalizeFunctionToOperation(item);
        if (operation) {
          operations.push(operation);
        }
      }
    });

    return operations;
  }

  private normalizeFunctionToOperation(func: any): NormalizedOperation | null {
    if (!func.name) {
      return null;
    }

    const isConstant = func.stateMutability === "view" || func.stateMutability === "pure";

    const operation: NormalizedOperation = {
      id: func.name,
      name: func.name,
      description: func.description || `${func.stateMutability} function: ${func.name}`,
      method: "function",
      functionName: func.name,
      parameters: this.extractFunctionParameters(func),
      response: {
        type: this.extractFunctionReturnType(func),
        contentType: "application/json",
      },
      errors: ["REVERT", "GAS_ERROR", "INVALID_ADDRESS"],
      authentication: {
        required: !isConstant, // Write operations require signer
        type: "wallet",
      },
      deprecated: false,
      tags: [func.stateMutability || "nonpayable"],
    };

    return operation;
  }

  private extractFunctionParameters(func: any): NormalizedParameter[] {
    const params: NormalizedParameter[] = [];

    (func.inputs || []).forEach((input: any, idx: number) => {
      params.push({
        name: input.name || `param${idx}`,
        type: this.normalizeSolidityType(input.type),
        description: input.description || "",
        required: true,
        nullable: false,
        location: "input",
        example: this.getExampleForSolidityType(input.type),
      });
    });

    return params;
  }

  private extractFunctionReturnType(func: any): string {
    const outputs = func.outputs || [];

    if (outputs.length === 0) {
      return "null";
    }

    if (outputs.length === 1) {
      return this.normalizeSolidityType(outputs[0].type);
    }

    // Multiple returns - create a tuple type name
    return "Tuple";
  }

  private extractErrors(abi: any[]): NormalizedError[] {
    const errors: NormalizedError[] = [
      {
        code: "REVERT",
        httpStatus: 400,
        message: "Transaction reverted",
        description: "Smart contract execution was reverted",
      },
      {
        code: "GAS_ERROR",
        httpStatus: 500,
        message: "Gas estimation failed",
        description: "Unable to estimate or execute due to gas constraints",
      },
      {
        code: "INVALID_ADDRESS",
        httpStatus: 400,
        message: "Invalid address parameter",
        description: "One or more address parameters are invalid",
      },
    ];

    // Extract custom errors if using error definitions
    abi.forEach((item) => {
      if (item.type === "error") {
        errors.push({
          code: item.name,
          message: item.name.replace(/([A-Z])/g, " $1").trim(),
          description: item.description || `Custom error: ${item.name}`,
        });
      }
    });

    return errors;
  }

  // NOTE: These methods are helpers for potential future smart contract parsing
  // Currently some of these are unused as the parse method doesn't decompose into function-level details
  // abiItemToNormalizedFunction and abiItemToNormalizedEvent are left out but getExampleForSolidityType is kept

  private getExampleForSolidityType(solidityType: string): any {
    if (solidityType.includes("[]")) {
      const elementType = solidityType.replace("[]", "");
      return [this.getExampleForSolidityType(elementType)];
    }

    const examples: Record<string, any> = {
      address: "0x1234567890123456789012345678901234567890",
      uint256: "1000000000000000000",
      uint: "1000000000000000000",
      int256: "1000000000000000000",
      bool: true,
      string: "example value",
      bytes: "0x1234",
      bytes32: "0x0000000000000000000000000000000000000000000000000000000000000000",
    };

    return examples[solidityType] || null;
  }

  /**
   * Normalize Solidity types to SDK types
   * uint256 -> bigint, address -> Address, etc.
   */
  private normalizeSolidityType(solidityType: string): string {
    // Array notation
    if (solidityType.endsWith("[]")) {
      const elementType = this.normalizeSolidityType(solidityType.slice(0, -2));
      return `${elementType}[]`;
    }

    // Fixed arrays
    const fixedArrayMatch = solidityType.match(/^(.+)\[(\d+)\]$/);
    if (fixedArrayMatch) {
      const elementType = this.normalizeSolidityType(fixedArrayMatch[1]);
      return `${elementType}[${fixedArrayMatch[2]}]`;
    }

    const typeMap: Record<string, string> = {
      // Integers
      uint: "BigInt",
      uint8: "number",
      uint16: "number",
      uint32: "number",
      uint64: "number",
      uint128: "BigInt",
      uint256: "BigInt",
      int: "BigInt",
      int8: "number",
      int256: "BigInt",

      // Address
      address: "Address",
      addresspayable: "Address",

      // Bytes
      bytes: "Bytes32",
      bytes1: "string",
      bytes32: "Bytes32",
      bytes4: "string",

      // Basic types
      string: "string",
      bool: "boolean",
      true: "boolean",
      false: "boolean",
    };

    return typeMap[solidityType] || solidityType;
  }
}
