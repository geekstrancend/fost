"use strict";
/**
 * Smart Contract ABI Parser (Web3)
 *
 * Deterministically converts Ethereum ABI to NormalizedSpec.
 * Handles complex type mappings and Solidity-specific concepts.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContractABIParser = void 0;
const base_parser_1 = require("../base-parser");
class ContractABIParser extends base_parser_1.BaseParser {
    canParse(input) {
        return input.type === "contract-abi";
    }
    parse(input) {
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
            const authentication = {
                type: "custom", // Wallet signer
                required: true,
                description: "Requires signed transactions via wallet",
            };
            // Networks will be filled in by chain metadata parser
            const networks = [];
            const normalized = {
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
        }
        catch (e) {
            this.addError("PARSE_EXCEPTION", `Unexpected error: ${e.message}`);
            return { success: false, errors: this.errors, warnings: this.warnings };
        }
    }
    extractProductInfo(metadata) {
        const contractName = metadata.name || "SmartContract";
        return {
            name: contractName.toLowerCase(),
            version: metadata.version || "1.0.0",
            apiVersion: "solidity-1.0",
            description: metadata.description || `Smart Contract: ${contractName}`,
            title: contractName,
        };
    }
    extractTypesFromABI(abi) {
        const types = {};
        // Add common Solidity type aliases
        const solidityTypes = {
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
    extractEventTypes(event, types) {
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
            event.inputs.forEach((input) => {
                types[`${eventName}Event`].fields[input.name] = {
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
    extractOperations(abi) {
        const operations = [];
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
    normalizeFunctionToOperation(func) {
        if (!func.name) {
            return null;
        }
        const isConstant = func.stateMutability === "view" || func.stateMutability === "pure";
        const operation = {
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
    extractFunctionParameters(func) {
        const params = [];
        (func.inputs || []).forEach((input, idx) => {
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
    extractFunctionReturnType(func) {
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
    extractErrors(abi) {
        const errors = [
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
    buildSmartContractDefinition(abi, operations, contractName) {
        const contract = {
            name: contractName,
            abi: {},
            constructor: {
                inputs: [],
            },
        };
        abi.forEach((item) => {
            if (item.type === "function") {
                contract.abi[item.name] = this.abiItemToNormalizedFunction(item);
            }
            else if (item.type === "event") {
                contract.abi[item.name] = this.abiItemToNormalizedEvent(item);
            }
            else if (item.type === "constructor") {
                contract.constructor = {
                    inputs: (item.inputs || []).map((input, idx) => ({
                        name: input.name || `param${idx}`,
                        type: this.normalizeSolidityType(input.type),
                        description: input.description || "",
                        required: true,
                        nullable: false,
                        location: "input",
                    })),
                };
            }
        });
        return contract;
    }
    abiItemToNormalizedFunction(item) {
        const outputs = item.outputs || [];
        return {
            name: item.name,
            type: "function",
            stateMutability: item.stateMutability || "nonpayable",
            inputs: (item.inputs || []).map((input, idx) => ({
                name: input.name || `param${idx}`,
                type: this.normalizeSolidityType(input.type),
                description: input.description || "",
                required: true,
                nullable: false,
                location: "input",
            })),
            outputs: outputs.length > 0
                ? outputs.map((output, idx) => ({
                    name: output.name || `output${idx}`,
                    type: this.normalizeSolidityType(output.type),
                }))
                : undefined,
            description: item.description,
        };
    }
    abiItemToNormalizedEvent(item) {
        return {
            name: item.name,
            type: "event",
            inputs: (item.inputs || []).map((input, idx) => ({
                name: input.name || `param${idx}`,
                type: this.normalizeSolidityType(input.type),
                description: input.description || "",
                required: true,
                nullable: false,
                indexed: input.indexed === true,
                location: "input",
            })),
            description: item.description,
        };
    }
    /**
     * Normalize Solidity types to SDK types
     * uint256 -> bigint, address -> Address, etc.
     */
    normalizeSolidityType(solidityType) {
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
        const typeMap = {
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
    /**
     * Provide example values for Solidity types for documentation
     */
    getExampleForSolidityType(solidityType) {
        if (solidityType.includes("[]")) {
            const elementType = solidityType.replace("[]", "");
            return [this.getExampleForSolidityType(elementType)];
        }
        const examples = {
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
}
exports.ContractABIParser = ContractABIParser;
//# sourceMappingURL=contract-abi.js.map