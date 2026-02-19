/**
 * Testing Layer for Generated SDKs
 * Mock API tests for Web2, simulated chain calls for Web3
 * Behavior verification and regression testing
 */
import { SDKMethod } from "./types";
export interface TestSuite {
    name: string;
    description: string;
    tests: TestCase[];
    setup?: () => Promise<void>;
    teardown?: () => Promise<void>;
}
export interface TestCase {
    name: string;
    category: "unit" | "integration" | "behavior" | "regression";
    description: string;
    setup?: () => Promise<void>;
    execute: () => Promise<void>;
    assertions: Assertion[];
    expectedResult?: unknown;
    shouldFail?: boolean;
}
export interface Assertion {
    condition: boolean;
    message: string;
    severity: "error" | "warning";
}
export interface MockResponse {
    statusCode: number;
    headers: Record<string, string>;
    body: unknown;
    delay: number;
}
export interface MockRequest {
    method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
    path: string;
    headers: Record<string, string>;
    body?: unknown;
}
export interface Web3Transaction {
    to?: string;
    from: string;
    data: string;
    value?: string;
    gasLimit?: string;
    gasPrice?: string;
}
export interface Web3TransactionResult {
    hash: string;
    blockNumber: number;
    status: "pending" | "confirmed" | "failed";
    gasUsed: string;
    confirmations: number;
}
export interface SimulationState {
    balances: Map<string, string>;
    allowances: Map<string, {
        owner: string;
        spender: string;
        amount: string;
    }>;
    contractState: Map<string, unknown>;
}
declare class MockAPITester {
    private methods;
    private mockResponses;
    private requestHistory;
    constructor(_baseURL: string, methods: SDKMethod[]);
    generateTestSuite(): TestSuite;
    private createSuccessTest;
    private createErrorTest;
    private createParameterValidationTest;
    private createTimeoutTest;
    private simulateRequest;
    private getMockResponse;
    private generateInvalidParameters;
    private initializeMockResponses;
    private generateMockData;
    private setupMockServer;
    private teardownMockServer;
    getRequestHistory(): MockRequest[];
    clearHistory(): void;
}
declare class Web3ChainSimulator {
    private methods;
    private state;
    private transactionLog;
    constructor(_chainId: number, methods: SDKMethod[]);
    generateTestSuite(): TestSuite;
    private createReadOperationTest;
    private createWriteOperationTest;
    private createTransactionFailureTest;
    private createGasEstimationTest;
    private simulateReadCall;
    private simulateWriteCall;
    private simulateFailedTransaction;
    private estimateGas;
    private generateMockContractData;
    private initializeState;
    private setupSimulation;
    private teardownSimulation;
    getTransactionLog(): Web3TransactionResult[];
    getState(): SimulationState;
    resetState(): void;
}
declare class RegressionTestSuite {
    private previousVersion;
    private currentVersion;
    constructor(previousVersion: SDKMethod[], currentVersion: SDKMethod[]);
    generateTestSuite(): TestSuite;
    private createBackwardCompatibilityTest;
    private createBehaviorPreservationTest;
    private createRemovedMethodTest;
    private createNewMethodTest;
    private checkSignatureCompatibility;
    private checkBehaviorPreservation;
}
export { MockAPITester, Web3ChainSimulator, RegressionTestSuite, };
//# sourceMappingURL=testing.d.ts.map