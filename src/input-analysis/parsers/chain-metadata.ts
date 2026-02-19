/**
 * Chain Metadata Parser (Web3)
 *
 * Converts blockchain network metadata into NormalizedSpec network configurations.
 * Used for configuring multi-chain SDK support.
 */

import {
  InputSpec,
  NormalizedSpec,
  NormalizedNetwork,
  ParserResult,
  NormalizedChainMetadata,
} from "../types";
import { BaseParser } from "../base-parser";

export class ChainMetadataParser extends BaseParser {
  canParse(input: InputSpec): boolean {
    return input.type === "chain-metadata";
  }

  parse(input: InputSpec): ParserResult {
    this.resetState();

    try {
      const metadata = input.rawContent;

      // Validate structure
      if (typeof metadata !== "object" || !metadata) {
        this.addError("INVALID_METADATA", "Chain metadata must be a JSON object");
        return { success: false, errors: this.errors, warnings: this.warnings };
      }

      // Extract network configurations
      const networks = this.extractNetworks(metadata);

      if (networks.length === 0) {
        this.addError("NO_NETWORKS", "No valid networks found in chain metadata");
        return { success: false, errors: this.errors, warnings: this.warnings };
      }

      // Build a minimal NormalizedSpec for chains
      const normalized: NormalizedSpec = {
        product: {
          name: "chain-metadata",
          version: "1.0.0",
          apiVersion: "1.0",
          description: "Blockchain network metadata",
        },
        types: {},
        operations: [],
        errors: [],
        authentication: { type: "none", required: false },
        networks,
        source: {
          inputType: input.type,
          sourcePath: input.source,
          parsedAt: new Date().toISOString(),
          parser: "ChainMetadataParser",
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

  private extractNetworks(metadata: any): NormalizedNetwork[] {
    const networks: NormalizedNetwork[] = [];

    // Handle both single chain and multiple chains
    const chains: any[] = Array.isArray(metadata.chains)
      ? metadata.chains
      : metadata.chain
        ? [metadata.chain]
        : [];

    if (chains.length === 0 && metadata.chainId) {
      // Single chain as object
      chains.push(metadata);
    }

    chains.forEach((chain, idx) => {
      if (!chain || typeof chain !== "object") {
        this.addWarning("warning", "INVALID_CHAIN", `Chain at index ${idx} is invalid`);
        return;
      }

      const network = this.normalizeChain(chain);
      if (network) {
        networks.push(network);
      }
    });

    return networks;
  }

  private normalizeChain(chain: any): NormalizedNetwork | null {
    // Validate required fields
    if (!chain.id && !chain.chainId) {
      this.addWarning("warning", "MISSING_CHAIN_ID", "Chain missing id or chainId");
      return null;
    }

    if (!chain.rpcEndpoints && !chain.rpcUrl && !chain.endpoint) {
      this.addWarning("warning", "MISSING_RPC", `Chain ${chain.id || chain.chainId} missing RPC endpoint`);
      return null;
    }

    const id = chain.id || chain.chainId?.toString();
    const name = chain.name || `Chain ${id}`;
    const rpcUrl =
      Array.isArray(chain.rpcEndpoints)
        ? chain.rpcEndpoints[0]
        : chain.rpcUrl || chain.endpoint;

    const network: NormalizedNetwork = {
      id: id.toString().toLowerCase(),
      name,
      type: "rpc",
      url: rpcUrl,
      chainId: chain.chainId ? chain.chainId.toString() : id.toString(),
      environment: this.classifyEnvironment(name, chain.environment),
    };

    return network;
  }

  private classifyEnvironment(
    name: string,
    explicit?: string
  ): "production" | "staging" | "test" {
    if (explicit) {
      const lower = explicit.toLowerCase();
      if (lower.includes("test")) return "test";
      if (lower.includes("staging") || lower.includes("stage")) return "staging";
      return "production";
    }

    const lower = name.toLowerCase();

    if (lower.includes("testnet") || lower.includes("test") || lower.includes("sepolia") || lower.includes("goerli")) {
      return "test";
    }

    if (lower.includes("staging")) {
      return "staging";
    }

    return "production";
  }
}

// ============================================================================
// PREDEFINED CHAIN CONFIGURATIONS
// ============================================================================

/**
 * Predefined metadata for common blockchains
 * Use these as templates when building multi-chain SDKs
 */

export const ETHEREUM_MAINNET: NormalizedChainMetadata = {
  id: "ethereum",
  name: "Ethereum Mainnet",
  type: "evm",
  chainId: "1",
  rpcEndpoints: ["https://eth.llamarpc.com", "https://eth-mainnet.alchemyapi.io/v2"],
  blockTime: 12000,
  finality: 15,
  nativeToken: "ETH",
  explorer: "https://etherscan.io",
};

export const ETHEREUM_SEPOLIA: NormalizedChainMetadata = {
  id: "ethereum-sepolia",
  name: "Ethereum Sepolia Testnet",
  type: "evm",
  chainId: "11155111",
  rpcEndpoints: ["https://sepolia.infura.io/v3"],
  blockTime: 12000,
  finality: 15,
  nativeToken: "ETH",
  explorer: "https://sepolia.etherscan.io",
};

export const POLYGON_MAINNET: NormalizedChainMetadata = {
  id: "polygon",
  name: "Polygon Mainnet",
  type: "evm",
  chainId: "137",
  rpcEndpoints: ["https://polygon.llamarpc.com", "https://polygon-rpc.com"],
  blockTime: 2000,
  finality: 256,
  nativeToken: "MATIC",
  explorer: "https://polygonscan.com",
};

export const ARBITRUM_ONE: NormalizedChainMetadata = {
  id: "arbitrum",
  name: "Arbitrum One",
  type: "evm",
  chainId: "42161",
  rpcEndpoints: ["https://arb1.arbitrum.io/rpc"],
  blockTime: 250,
  finality: 1,
  nativeToken: "ARB",
  explorer: "https://arbiscan.io",
};

export const OPTIMISM_MAINNET: NormalizedChainMetadata = {
  id: "optimism",
  name: "Optimism Mainnet",
  type: "evm",
  chainId: "10",
  rpcEndpoints: ["https://mainnet.optimism.io"],
  blockTime: 2000,
  finality: 1,
  nativeToken: "OP",
  explorer: "https://optimistic.etherscan.io",
};

export const SOLANA_MAINNET: NormalizedChainMetadata = {
  id: "solana",
  name: "Solana Mainnet",
  type: "solana",
  chainId: "5eykt4UsFv2P6ysrq7IvVTgs5kfrqQ",
  rpcEndpoints: ["https://api.mainnet-beta.solana.com", "https://solana.llamarpc.com"],
  blockTime: 400,
  finality: 32,
  nativeToken: "SOL",
  explorer: "https://solscan.io",
};

export const SOLANA_DEVNET: NormalizedChainMetadata = {
  id: "solana-devnet",
  name: "Solana Devnet",
  type: "solana",
  chainId: "EtWTRABZaoDmUwtDrhAvbtFroJAzsCvVf5KoNGRNvQ",
  rpcEndpoints: ["https://api.devnet.solana.com"],
  blockTime: 400,
  finality: 32,
  nativeToken: "SOL",
  explorer: "https://solscan.io/?cluster=devnet",
};

export const PREDEFINED_CHAINS: Record<string, NormalizedChainMetadata> = {
  "ethereum": ETHEREUM_MAINNET,
  "ethereum-sepolia": ETHEREUM_SEPOLIA,
  "polygon": POLYGON_MAINNET,
  "arbitrum": ARBITRUM_ONE,
  "optimism": OPTIMISM_MAINNET,
  "solana": SOLANA_MAINNET,
  "solana-devnet": SOLANA_DEVNET,
};
