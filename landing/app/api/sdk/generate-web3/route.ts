import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth';
import { storeSDK } from '@/lib/sdk-storage';
import { updateUserData, getUserById } from '@/lib/user-storage';

interface Web3GenerateRequest {
  chainId: number;
  contractAddress: string;
  contractName: string;
  abiJson: string;
  targetLanguages: string[];
}

// In-memory storage for Web3 SDKs
const web3SDKs: Map<string, any> = new Map();

export async function POST(request: NextRequest) {
  try {
    // Authenticate request
    const auth = await authenticateRequest(request);
    if (!auth || !auth.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: Web3GenerateRequest = await request.json();
    const { chainId, contractAddress, contractName, abiJson, targetLanguages } = body;

    // Validate inputs
    if (!contractAddress || !contractName || !targetLanguages || targetLanguages.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check user credits (1 credit per SDK)
    const user = getUserById(auth.user.id);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const creditsNeeded = 1;
    if ((user.credits || 0) < creditsNeeded) {
      return NextResponse.json(
        { error: 'Insufficient credits. Please upgrade your plan.' },
        { status: 402 }
      );
    }

    const sdkId = `web3_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const files: { [key: string]: string } = {};

    // Generate Web3 SDK for each language
    for (const lang of targetLanguages) {
      switch (lang) {
        case 'typescript':
          files[`${contractName}.ts`] = generateTypeScriptWeb3SDK(contractName, chainId, contractAddress, abiJson);
          files['types.ts'] = generateWeb3Types();
          break;
        case 'python':
          files[`${contractName}.py`] = generatePythonWeb3SDK(contractName, chainId, contractAddress);
          break;
        case 'go':
          files[`${contractName}.go`] = generateGoWeb3SDK(contractName, chainId, contractAddress);
          break;
        case 'java':
          files[`${contractName}.java`] = generateJavaWeb3SDK(contractName, chainId, contractAddress);
          break;
      }
    }

    // Add configuration file
    files['web3.config.json'] = JSON.stringify(
      {
        chainId,
        contractAddress,
        contractName,
        supportedLanguages: targetLanguages,
        features: [
          'SmartContractABI',
          'WalletIntegration',
          'GasEstimation',
          'EventSubscriptions',
          'MultiChainSupport',
        ],
      },
      null,
      2
    );

    // Store metadata
    web3SDKs.set(sdkId, {
      id: sdkId,
      contractName,
      chainId,
      contractAddress,
      languages: targetLanguages,
      createdAt: new Date(),
      fileCount: Object.keys(files).length,
    });

    // Store SDK files
    storeSDK(sdkId, files, contractName);

    // Deduct credits
    updateUserData(auth.user.id, {
      credits: user.credits - creditsNeeded,
    });

    // Track SDK generation
    try {
      await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/user/stats`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'sdk-generated',
          isWeb3: true,
        }),
      });
    } catch (e) {
      console.log('Stats tracking failed (non-critical):', e);
    }

    return NextResponse.json({
      id: sdkId,
      downloadUrl: `/api/sdk/download?sdkId=${sdkId}`,
      files: Object.keys(files),
      contractName,
      chainId,
      contractAddress,
      creditsRemaining: user.credits - creditsNeeded,
      message: 'Web3 SDK generated successfully',
    });
  } catch (error) {
    console.error('Web3 SDK generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate Web3 SDK' },
      { status: 500 }
    );
  }
}

function generateTypeScriptWeb3SDK(
  contractName: string,
  chainId: number,
  contractAddress: string,
  abiJson: string
): string {
  return `
/**
 * Auto-generated Web3 SDK for ${contractName}
 * Contract Address: ${contractAddress}
 * Chain ID: ${chainId}
 */

import { ethers } from 'ethers';
import { ContractABI } from './types';

export class ${contractName} {
  private contract: ethers.Contract;
  private provider: ethers.Provider;
  private signer?: ethers.Signer;

  constructor(
    contractAddress: string,
    abiJson: string,
    provider: ethers.Provider,
    signer?: ethers.Signer
  ) {
    this.provider = provider;
    this.signer = signer;
    const abi = JSON.parse(abiJson);
    this.contract = new ethers.Contract(contractAddress, abi, signer || provider);
  }

  // Wallet Integration
  async connectWallet(provider: any) {
    const ethersProvider = new ethers.BrowserProvider(provider);
    const signer = await ethersProvider.getSigner();
    this.signer = signer;
    this.contract = this.contract.connect(signer);
  }

  // Gas Estimation
  async estimateGas(functionName: string, ...args: any[]): Promise<bigint> {
    if (!this.signer) throw new Error('Signer required for gas estimation');
    const gasLimit = await this.contract[functionName].estimateGas(...args);
    return gasLimit;
  }

  // Event Subscriptions
  on(eventName: string, callback: (...args: any[]) => void) {
    this.contract.on(eventName, callback);
  }

  off(eventName: string) {
    this.contract.off(eventName);
  }

  // Read Functions
  async call(functionName: string, ...args: any[]): Promise<any> {
    return this.contract[functionName](...args);
  }

  // Write Functions
  async send(functionName: string, ...args: any[]): Promise<any> {
    if (!this.signer) throw new Error('Signer required for write operations');
    return this.contract[functionName](...args);
  }
}

export default ${contractName};
`;
}

function generateWeb3Types(): string {
  return `
/**
 * Web3 SDK Types
 */

export interface ContractABI {
  name: string;
  type: 'function' | 'constructor' | 'event' | 'fallback';
  inputs: AbiInput[];
  outputs?: AbiOutput[];
  stateMutability?: string;
}

export interface AbiInput {
  name: string;
  type: string;
  internalType?: string;
  components?: AbiInput[];
}

export interface AbiOutput {
  name: string;
  type: string;
  internalType?: string;
  components?: AbiOutput[];
}

export interface TransactionResponse {
  hash: string;
  to: string;
  from: string;
  gasLimit: bigint;
  gasPrice: bigint;
  data: string;
  value: bigint;
}

export interface EventLog {
  address: string;
  topics: string[];
  data: string;
  blockNumber: number;
  transactionHash: string;
  logIndex: number;
}
`;
}

function generatePythonWeb3SDK(
  contractName: string,
  chainId: number,
  contractAddress: string
): string {
  return `"""
Auto-generated Web3 SDK for ${contractName}
Contract Address: ${contractAddress}
Chain ID: ${chainId}
"""

from web3 import Web3
from eth_typing import Address
from typing import Any, Dict, List, Optional

class ${contractName}:
    def __init__(self, contract_address: str, abi_json: str, provider_url: str):
        self.w3 = Web3(Web3.HTTPProvider(provider_url))
        self.contract_address = Web3.to_checksum_address(contract_address)
        self.contract = self.w3.eth.contract(address=self.contract_address, abi=abi_json)
        self.account = None

    def connect_wallet(self, private_key: str):
        """Connect wallet for transaction signing"""
        self.account = self.w3.eth.account.from_key(private_key)

    def estimate_gas(self, function_name: str, *args: Any, **kwargs: Any) -> int:
        """Estimate gas for contract function call"""
        if not self.account:
            raise Exception("Wallet not connected")
        function = getattr(self.contract.functions, function_name)
        return function(*args).estimate_gas({"from": self.account.address})

    def call(self, function_name: str, *args: Any, **kwargs: Any) -> Any:
        """Call read-only contract function"""
        function = getattr(self.contract.functions, function_name)
        return function(*args).call()

    def send(self, function_name: str, *args: Any, **kwargs: Any) -> str:
        """Send transaction to contract function"""
        if not self.account:
            raise Exception("Wallet not connected")
        function = getattr(self.contract.functions, function_name)
        tx = function(*args).build_transaction({
            "from": self.account.address,
            "nonce": self.w3.eth.get_transaction_count(self.account.address),
        })
        signed_tx = self.account.sign_transaction(tx)
        tx_hash = self.w3.eth.send_raw_transaction(signed_tx.rawTransaction)
        return tx_hash.hex()

    def on(self, event_name: str, callback: callable):
        """Subscribe to contract events"""
        event = getattr(self.contract.events, event_name)
        event_filter = event.create_filter(from_block="latest")
        return event_filter
`;
}

function generateGoWeb3SDK(
  contractName: string,
  chainId: number,
  contractAddress: string
): string {
  return `package ${contractName.toLowerCase()}

import (
  "context"
  "strings"
  "github.com/ethereum/go-ethereum/common"
  "github.com/ethereum/go-ethereum/ethclient"
  "github.com/ethereum/go-ethereum/accounts/abi"
  "math/big"
)

type ${contractName} struct {
  address  common.Address
  client   *ethclient.Client
  abi      abi.ABI
  chainID  *big.Int
}

// New${contractName} creates a new instance of the contract
func New${contractName}(addressStr string, client *ethclient.Client, abiJSON string) (*${contractName}, error) {
  address := common.HexToAddress(addressStr)
  
  parsedABI, err := abi.JSON(strings.NewReader(abiJSON))
  if err != nil {
    return nil, err
  }

  chainID, err := client.ChainID(context.Background())
  if err != nil {
    return nil, err
  }

  return &${contractName}{
    address: address,
    client:  client,
    abi:     parsedABI,
    chainID: chainID,
  }, nil
}

// Call executes a read-only contract function
func (c *${contractName}) Call(ctx context.Context, method string, args ...interface{}) (interface{}, error) {
  // Implementation
  return nil, nil
}

// Send executes a state-changing contract function
func (c *${contractName}) Send(ctx context.Context, method string, args ...interface{}) (string, error) {
  // Implementation
  return "", nil
}

// EstimateGas estimates gas for a contract function call
func (c *${contractName}) EstimateGas(ctx context.Context, method string, args ...interface{}) (uint64, error) {
  // Implementation
  return 0, nil
}
`;
}

function generateJavaWeb3SDK(
  contractName: string,
  chainId: number,
  contractAddress: string
): string {
  return `package generated.web3;

import org.web3j.abi.ContractEncoder;
import org.web3j.crypto.Credentials;
import org.web3j.protocol.Web3j;
import org.web3j.tx.Contract;
import java.math.BigInteger;

public class ${contractName} extends Contract {
    private static final String CONTRACT_ADDRESS = "${contractAddress}";
    private static final BigInteger CHAIN_ID = BigInteger.valueOf(${chainId});

    private ${contractName}(String contractAddress, Web3j web3j, Credentials credentials) {
        super(contractAddress, web3j, credentials);
    }

    public static ${contractName} load(
            String contractAddress, 
            Web3j web3j, 
            Credentials credentials) {
        return new ${contractName}(contractAddress, web3j, credentials);
    }

    // Gas Estimation
    public BigInteger estimateGas(String functionName) throws Exception {
        // Implementation
        return BigInteger.ZERO;
    }

    // Read Functions
    public Object call(String functionName, Object... args) throws Exception {
        // Implementation
        return null;
    }

    // Write Functions
    public String send(String functionName, Object... args) throws Exception {
        // Implementation
        return "";
    }

    // Event Subscription
    public void subscribe(String eventName, EventCallback callback) {
        // Implementation
    }

    public interface EventCallback {
        void onEvent(Object... args);
    }
}
`;
}
