/**
 * ABI Parser - Smart Contract Interface Extraction
 * Specialized for Web3 SDK generation from contract ABIs
 */
export interface ABI {
    type: 'function' | 'event' | 'constructor' | 'fallback' | 'receive';
    name: string;
    inputs: Array<{
        name: string;
        type: string;
        internalType: string;
        components?: any[];
    }>;
    outputs?: Array<{
        name: string;
        type: string;
        internalType: string;
    }>;
    stateMutability?: 'pure' | 'view' | 'nonpayable' | 'payable';
    constant?: boolean;
    payable?: boolean;
}
export interface ExtractedContract {
    name: string;
    functions: ExtractedFunction[];
    events: ExtractedEvent[];
    state: StateVariable[];
}
export interface ExtractedFunction {
    name: string;
    params: Parameter[];
    returns: Parameter[];
    isPayable: boolean;
    isView: boolean;
    isConstant: boolean;
}
export interface ExtractedEvent {
    name: string;
    params: Parameter[];
    indexed: string[];
}
export interface StateVariable {
    name: string;
    type: string;
    visibility: string;
}
export interface Parameter {
    name: string;
    type: string;
    components?: Parameter[];
}
/**
 * Parse a contract ABI and extract method signatures
 */
export declare function parseABI(abi: ABI[]): ExtractedContract;
//# sourceMappingURL=abi-parser.d.ts.map