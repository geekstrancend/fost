/**
 * Smart Contract ABI Parser (Web3)
 *
 * Deterministically converts Ethereum ABI to NormalizedSpec.
 * Handles complex type mappings and Solidity-specific concepts.
 */
import { InputSpec, ParserResult } from "../types";
import { BaseParser } from "../base-parser";
export declare class ContractABIParser extends BaseParser {
    canParse(input: InputSpec): boolean;
    parse(input: InputSpec): ParserResult;
    private extractProductInfo;
    private extractTypesFromABI;
    private extractEventTypes;
    private extractOperations;
    private normalizeFunctionToOperation;
    private extractFunctionParameters;
    private extractFunctionReturnType;
    private extractErrors;
    private getExampleForSolidityType;
    /**
     * Normalize Solidity types to SDK types
     * uint256 -> bigint, address -> Address, etc.
     */
    private normalizeSolidityType;
}
//# sourceMappingURL=contract-abi.d.ts.map