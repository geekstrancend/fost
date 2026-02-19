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
export function parseABI(abi: ABI[]): ExtractedContract {
  const functions: ExtractedFunction[] = [];
  const events: ExtractedEvent[] = [];

  for (const item of abi) {
    if (item.type === 'function') {
      functions.push(parseFunction(item));
    } else if (item.type === 'event') {
      events.push(parseEvent(item));
    }
  }

  return {
    name: 'SmartContract',
    functions,
    events,
    state: [],
  };
}

/**
 * Parse a function from ABI
 */
function parseFunction(abi: ABI): ExtractedFunction {
  return {
    name: abi.name || 'unnamed',
    params: (abi.inputs || []).map(input => ({
      name: input.name,
      type: normalizeType(input.type),
    })),
    returns: (abi.outputs || []).map(output => ({
      name: output.name,
      type: normalizeType(output.type),
    })),
    isPayable: abi.stateMutability === 'payable',
    isView: abi.stateMutability === 'view' || abi.stateMutability === 'pure',
    isConstant: abi.constant || false,
  };
}

/**
 * Parse an event from ABI
 */
function parseEvent(abi: ABI): ExtractedEvent {
  return {
    name: abi.name || 'unnamed',
    params: (abi.inputs || []).map(input => ({
      name: input.name,
      type: normalizeType(input.type),
    })),
    indexed: (abi.inputs || [])
      .filter((_, i) => abi.inputs![i].internalType?.includes('indexed'))
      .map((_, i) => abi.inputs![i].name),
  };
}

/**
 * Normalize Solidity type to TypeScript type
 */
function normalizeType(solidityType: string): string {
  // Handle arrays
  if (solidityType.endsWith('[]')) {
    const baseType = solidityType.slice(0, -2);
    return `${normalizeType(baseType)}[]`;
  }

  // Handle sized arrays (e.g., bytes32[10])
  const arrayMatch = solidityType.match(/^(.+)\[(\d+)\]$/);
  if (arrayMatch) {
    const baseType = normalizeType(arrayMatch[1]);
    return `${baseType}[${arrayMatch[2]}]`;
  }

  // Basic type mappings
  const typeMap: Record<string, string> = {
    'address': 'string',
    'uint': 'BigInt',
    'uint8': 'number',
    'uint16': 'number',
    'uint32': 'number',
    'uint64': 'number',
    'uint256': 'BigInt',
    'int': 'BigInt',
    'int8': 'number',
    'int16': 'number',
    'int32': 'number',
    'int64': 'number',
    'int256': 'BigInt',
    'bool': 'boolean',
    'string': 'string',
    'bytes': 'string',
    'bytes32': 'string',
  };

  // Check for uint/int with size (e.g., uint256)
  if (solidityType.match(/^u?int\d+$/)) {
    return typeMap[solidityType] || 'BigInt';
  }

  return typeMap[solidityType] || 'any';
}
