/**
 * Validation and Testing Layer for Generated SDKs
 * Validates schema compliance, detects hallucinated methods, and tests SDK behavior
 * Catches breaking changes during regeneration
 */

import { SDKDesignPlan, SDKMethod } from "./types";

// ============================================================================
// VALIDATION TYPES
// ============================================================================

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  metadata: ValidationMetadata;
}

export interface ValidationError {
  code: string;
  message: string;
  severity: "critical" | "error";
  location?: string;
  suggestion?: string;
}

export interface ValidationWarning {
  code: string;
  message: string;
  severity: "warning" | "info";
  location?: string;
}

export interface ValidationMetadata {
  timestamp: string;
  duration: number;
  schemaVersion: string;
  validatorsRun: string[];
}

export interface SchemaComplianceReport {
  schemaValid: boolean;
  methodsCompliant: Map<string, MethodCompliance>;
  parametersValid: boolean;
  typesValid: boolean;
  errors: ValidationError[];
}

export interface MethodCompliance {
  name: string;
  valid: boolean;
  requiredFieldsPresent: boolean;
  parameterTypesValid: boolean;
  returnTypeValid: boolean;
  documentationComplete: boolean;
  issues: string[];
}

export interface HallucinationReport {
  hallucinated: boolean;
  detectedMethods: string[];
  suspiciousMethods: string[];
  confidence: Map<string, number>;
  analysis: string;
}

export interface LintingResult {
  passed: boolean;
  violations: LintViolation[];
  categoryBreakdown: Map<string, number>;
}

export interface LintViolation {
  rule: string;
  severity: "error" | "warning" | "info";
  message: string;
  location: string;
  autoFixable: boolean;
  suggestion?: string;
}

export interface TestResult {
  passed: boolean;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  skippedTests: number;
  testCases: TestCase[];
  coverage: {
    methods: number;
    parameters: number;
    errorCases: number;
  };
}

export interface TestCase {
  name: string;
  passed: boolean;
  duration: number;
  error?: string;
  output?: unknown;
}

export interface BreakingChangeReport {
  breaking: boolean;
  changedMethods: MethodChange[];
  removedMethods: string[];
  modifiedParameters: ParameterChange[];
  deprecatedFeatures: string[];
  severity: "critical" | "major" | "minor" | "patch";
}

export interface MethodChange {
  name: string;
  type: "modified" | "removed" | "signature_changed";
  previousSignature?: string;
  newSignature?: string;
  impact: "high" | "medium" | "low";
}

export interface ParameterChange {
  methodName: string;
  parameterName: string;
  change: "removed" | "type_changed" | "made_required";
  oldType?: string;
  newType?: string;
  impact: "breaking" | "non_breaking";
}

export interface MockAPIConfig {
  baseURL: string;
  methods: Map<string, MockMethodConfig>;
  responseDelay: number;
  errorSimulation: boolean;
}

export interface MockMethodConfig {
  endpoint: string;
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  requestSchema: unknown;
  responseSchema: unknown;
  errorCases: MockErrorCase[];
}

export interface MockErrorCase {
  statusCode: number;
  errorCode: string;
  message: string;
  probability: number;
}

export interface Web3SimulatorConfig {
  chainId: number;
  rpcUrl: string;
  contractAddress: string;
  methods: Map<string, Web3MethodConfig>;
  gasEstimates: Map<string, number>;
}

export interface Web3MethodConfig {
  signature: string;
  inputs: Web3Input[];
  outputs: Web3Output[];
  isPayable: boolean;
  isReadOnly: boolean;
  gasEstimate: number;
}

export interface Web3Input {
  name: string;
  type: string;
  indexed?: boolean;
}

export interface Web3Output {
  name: string;
  type: string;
}

class SchemaValidator {
  private designPlan: SDKDesignPlan;
  private methods: Map<string, SDKMethod>;

  constructor(designPlan: SDKDesignPlan, methods: SDKMethod[]) {
    this.designPlan = designPlan;
    this.methods = new Map(methods.map(m => [m.name, m]));
  }

  validate(): SchemaComplianceReport {
    const methodsCompliant = new Map<string, MethodCompliance>();
    const errors: ValidationError[] = [];

    // Validate design plan basic structure
    if (!this.designPlan.product?.name) {
      errors.push({
        code: "MISSING_SDK_NAME",
        message: "SDK design plan must have a product name",
        severity: "critical",
      });
    }

    // Validate each method
    this.methods.forEach((method) => {
      const compliance = this.validateMethod(method);
      methodsCompliant.set(method.name, compliance);

      if (!compliance.valid) {
        compliance.issues.forEach((issue) => {
          errors.push({
            code: `METHOD_INVALID_${method.name.toUpperCase()}`,
            message: issue,
            severity: "error",
            location: `methods.${method.name}`,
          });
        });
      }
    });

    // Validate type definitions
    const typesValid = this.validateTypes();
    if (!typesValid) {
      errors.push({
        code: "INVALID_TYPES",
        message: "Type definitions do not match method signatures",
        severity: "error",
      });
    }

    return {
      schemaValid: errors.length === 0,
      methodsCompliant,
      parametersValid: this.validateParameters(),
      typesValid,
      errors,
    };
  }

  private validateMethod(method: SDKMethod): MethodCompliance {
    const issues: string[] = [];

    if (!method.name) {
      issues.push("Method must have a name");
    }

    if (!method.description) {
      issues.push("Method must have a description");
    }

    const requiredFieldsPresent = !!(
      method.name && method.description && method.category
    );
    const parameterTypesValid = this.validateParameterTypes(method);
    const returnTypeValid = method.returns?.type ? true : false;
    const documentationComplete = !!(method.description && method.description.length > 20);

    return {
      name: method.name,
      valid: issues.length === 0 && parameterTypesValid && returnTypeValid,
      requiredFieldsPresent,
      parameterTypesValid,
      returnTypeValid,
      documentationComplete,
      issues,
    };
  }

  private validateParameterTypes(method: SDKMethod): boolean {
    if (!method.parameters) return true;

    return method.parameters.every((param) => {
      if (!param.name || !param.type) return false;
      return this.isValidType(param.type);
    });
  }

  private validateParameters(): boolean {
    for (const method of this.methods.values()) {
      if (!method.parameters) continue;

      for (const param of method.parameters) {
        if (!param.name || !param.type) {
          return false;
        }

        if (param.required === undefined) {
          return false;
        }
      }
    }

    return true;
  }

  private validateTypes(): boolean {
    for (const method of this.methods.values()) {
      if (!method.returns?.type) {
        return false;
      }

      if (!this.isValidType(method.returns.type)) {
        return false;
      }
    }

    return true;
  }

  private isValidType(type: string): boolean {
    const primitiveTypes = [
      "string",
      "number",
      "boolean",
      "object",
      "array",
      "null",
      "any",
    ];
    const basicType = type.split("[")[0].split("{")[0];
    return primitiveTypes.includes(basicType) || this.isObjectType(basicType);
  }

  private isObjectType(type: string): boolean {
    return type.startsWith("T") || type.includes("Response") || type.includes("Model");
  }
}

class HallucinationDetector {
  private designPlan: SDKDesignPlan;
  private methods: Map<string, SDKMethod>;
  private knownPatterns: Map<string, string[]>;

  constructor(designPlan: SDKDesignPlan, methods: SDKMethod[]) {
    this.designPlan = designPlan;
    this.methods = new Map(methods.map(m => [m.name, m]));
    this.knownPatterns = this.initializePatterns();
  }

  detect(): HallucinationReport {
    const detectedMethods: string[] = [];
    const suspiciousMethods: string[] = [];
    const confidence = new Map<string, number>();

    for (const [methodName, method] of this.methods) {
      const hallucScore = this.calculateHallucinationScore(method);
      confidence.set(methodName, hallucScore);

      if (hallucScore > 0.8) {
        detectedMethods.push(methodName);
      } else if (hallucScore > 0.5) {
        suspiciousMethods.push(methodName);
      }
    }

    return {
      hallucinated: detectedMethods.length > 0,
      detectedMethods,
      suspiciousMethods,
      confidence,
      analysis: this.generateAnalysis(detectedMethods, suspiciousMethods),
    };
  }

  private calculateHallucinationScore(method: SDKMethod): number {
    let score = 0;

    // Check for unrealistic method names
    if (this.hasUnrealisticName(method.name)) {
      score += 0.3;
    }

    // Check for suspicious patterns in description
    if (this.hasSuspiciousDescription(method.description)) {
      score += 0.2;
    }

    // Check for inconsistent parameters
    if (this.hasInconsistentParameters(method)) {
      score += 0.2;
    }

    // Check for non-existent endpoints
    if (this.isNonExistentEndpoint(method)) {
      score += 0.3;
    }

    return Math.min(score, 1);
  }

  private hasUnrealisticName(name: string): boolean {
    const unrealisticPatterns = [
      /magically/i,
      /auto.*fix/i,
      /perfect.*solution/i,
      /instant.*results/i,
      /guaranteed/i,
      /unlimited/i,
      /free.*premium/i,
    ];

    return unrealisticPatterns.some((pattern) => pattern.test(name));
  }

  private hasSuspiciousDescription(description?: string): boolean {
    if (!description) return true;

    const suspiciousPatterns = [
      /undefined/i,
      /unknown/i,
      /placeholder/i,
      /TODO/,
      /FIXME/,
      /\?\?\?/,
    ];

    return suspiciousPatterns.some((pattern) => pattern.test(description));
  }

  private hasInconsistentParameters(method: SDKMethod): boolean {
    if (!method.parameters || method.parameters.length === 0) {
      return method.name.includes("get") || method.name.includes("fetch");
    }

    const allRequired = method.parameters.every((p) => p.required);
    const allOptional = method.parameters.every((p) => !p.required);

    if (!allRequired && !allOptional) {
      const optionalFirst = method.parameters.findIndex((p) => !p.required);
      const requiredAfter = method.parameters
        .slice(optionalFirst)
        .some((p) => p.required);

      return requiredAfter;
    }

    return false;
  }

  private isNonExistentEndpoint(method: SDKMethod): boolean {
    const knownEndpoints = this.knownPatterns.get(this.designPlan.product?.name) || [];
    return !knownEndpoints.includes(method.name);
  }

  private initializePatterns(): Map<string, string[]> {
    const patterns = new Map<string, string[]>();

    patterns.set("github", [
      "getUser",
      "listRepos",
      "createIssue",
      "updateIssue",
      "searchCode",
      "getCommit",
    ]);

    patterns.set("stripe", [
      "createPayment",
      "retrievePayment",
      "listCharges",
      "createCustomer",
      "updateCustomer",
    ]);

    patterns.set("uniswap", [
      "getPrice",
      "swap",
      "addLiquidity",
      "removeLiquidity",
      "getBalance",
      "approvToken",
    ]);

    return patterns;
  }

  private generateAnalysis(detected: string[], suspicious: string[]): string {
    if (detected.length === 0 && suspicious.length === 0) {
      return "No hallucinated methods detected.";
    }

    let analysis = "";

    if (detected.length > 0) {
      analysis += `Detected ${detected.length} hallucinated method(s): ${detected.join(", ")}. `;
    }

    if (suspicious.length > 0) {
      analysis += `${suspicious.length} method(s) require manual review: ${suspicious.join(", ")}.`;
    }

    return analysis;
  }
}

class LintingEngine {
  private methods: Map<string, SDKMethod>;
  private rules: LintRule[];

  constructor(methods: SDKMethod[]) {
    this.methods = new Map(methods.map(m => [m.name, m]));
    this.rules = this.initializeRules();
  }

  lint(): LintingResult {
    const violations: LintViolation[] = [];

    for (const rule of this.rules) {
      const ruleViolations = rule.check(this.methods);
      violations.push(...ruleViolations);
    }

    const categoryBreakdown = new Map<string, number>();
    violations.forEach((v) => {
      categoryBreakdown.set(v.rule, (categoryBreakdown.get(v.rule) || 0) + 1);
    });

    return {
      passed: violations.filter((v) => v.severity === "error").length === 0,
      violations,
      categoryBreakdown,
    };
  }

  private initializeRules(): LintRule[] {
    return [
      new MethodNamingRule(),
      new ParameterConsistencyRule(),
      new DocumentationRule(),
      new ErrorHandlingRule(),
      new TypeConsistencyRule(),
      new DeprecationRule(),
    ];
  }
}

interface LintRule {
  check(methods: Map<string, SDKMethod>): LintViolation[];
}

class MethodNamingRule implements LintRule {
  check(methods: Map<string, SDKMethod>): LintViolation[] {
    const violations: LintViolation[] = [];

    methods.forEach((method) => {
      if (!/^[a-z][a-zA-Z0-9]*$/.test(method.name)) {
        violations.push({
          rule: "method_naming",
          severity: "error",
          message: `Method name '${method.name}' does not follow camelCase convention`,
          location: `methods.${method.name}`,
          autoFixable: true,
          suggestion: `Use camelCase: ${method.name.replace(/[-_]/g, "")}`,
        });
      }

      if (method.name.length > 50) {
        violations.push({
          rule: "method_naming",
          severity: "warning",
          message: `Method name '${method.name}' is too long (${method.name.length} chars)`,
          location: `methods.${method.name}`,
          autoFixable: false,
        });
      }
    });

    return violations;
  }
}

class ParameterConsistencyRule implements LintRule {
  check(methods: Map<string, SDKMethod>): LintViolation[] {
    const violations: LintViolation[] = [];

    methods.forEach((method) => {
      if (!method.parameters || method.parameters.length === 0) return;

      const requiredParams = method.parameters.filter((p) => p.required);
      const optionalParams = method.parameters.filter((p) => !p.required);

      if (requiredParams.length > 0 && optionalParams.length > 0) {
        const lastRequired = method.parameters.lastIndexOf(
          method.parameters.find((p) => p.required)!
        );
        const firstOptional = method.parameters.findIndex((p) => !p.required);

        if (lastRequired > firstOptional) {
          violations.push({
            rule: "parameter_consistency",
            severity: "error",
            message: `Method '${method.name}' has required parameters after optional parameters`,
            location: `methods.${method.name}.parameters`,
            autoFixable: false,
            suggestion: "Place all required parameters before optional ones",
          });
        }
      }
    });

    return violations;
  }
}

class DocumentationRule implements LintRule {
  check(methods: Map<string, SDKMethod>): LintViolation[] {
    const violations: LintViolation[] = [];

    methods.forEach((method) => {
      if (!method.description || method.description.trim().length === 0) {
        violations.push({
          rule: "documentation",
          severity: "error",
          message: `Method '${method.name}' is missing documentation`,
          location: `methods.${method.name}`,
          autoFixable: false,
        });
      }

      if (method.description && method.description.length < 10) {
        violations.push({
          rule: "documentation",
          severity: "warning",
          message: `Method '${method.name}' has incomplete documentation`,
          location: `methods.${method.name}`,
          autoFixable: false,
        });
      }
    });

    return violations;
  }
}

class ErrorHandlingRule implements LintRule {
  check(methods: Map<string, SDKMethod>): LintViolation[] {
    const violations: LintViolation[] = [];

    methods.forEach((method) => {
      if (!method.throws || method.throws.length === 0) {
        violations.push({
          rule: "error_handling",
          severity: "warning",
          message: `Method '${method.name}' does not document possible errors`,
          location: `methods.${method.name}`,
          autoFixable: false,
        });
      }
    });

    return violations;
  }
}

class TypeConsistencyRule implements LintRule {
  check(methods: Map<string, SDKMethod>): LintViolation[] {
    const violations: LintViolation[] = [];

    methods.forEach((method) => {
      if (!method.returns?.type) {
        violations.push({
          rule: "type_consistency",
          severity: "error",
          message: `Method '${method.name}' has no return type`,
          location: `methods.${method.name}`,
          autoFixable: false,
        });
      }

      if (method.parameters) {
        method.parameters.forEach((param) => {
          if (!param.type) {
            violations.push({
              rule: "type_consistency",
              severity: "error",
              message: `Parameter '${param.name}' in method '${method.name}' has no type`,
              location: `methods.${method.name}.parameters.${param.name}`,
              autoFixable: false,
            });
          }
        });
      }
    });

    return violations;
  }
}

class DeprecationRule implements LintRule {
  check(methods: Map<string, SDKMethod>): LintViolation[] {
    const violations: LintViolation[] = [];

    methods.forEach((method) => {
      if (method.generationHints?.deprecated) {
        violations.push({
          rule: "deprecation",
          severity: "warning",
          message: `Method '${method.name}' is deprecated`,
          location: `methods.${method.name}`,
          autoFixable: false,
          suggestion: "Consider using an alternative method.",
        });
      }
    });

    return violations;
  }
}

class BreakingChangeDetector {
  private previousMethods: Map<string, SDKMethod>;
  private currentMethods: Map<string, SDKMethod>;

  constructor(
    previousMethods: SDKMethod[],
    currentMethods: SDKMethod[]
  ) {
    this.previousMethods = new Map(previousMethods.map(m => [m.name, m]));
    this.currentMethods = new Map(currentMethods.map(m => [m.name, m]));
  }

  detect(): BreakingChangeReport {
    const changedMethods: MethodChange[] = [];
    const removedMethods: string[] = [];
    const modifiedParameters: ParameterChange[] = [];
    const deprecatedFeatures: string[] = [];

    // Detect removed methods
    this.previousMethods.forEach((_prevMethod, name) => {
      if (!this.currentMethods.has(name)) {
        removedMethods.push(name);
        changedMethods.push({
          name,
          type: "removed",
          impact: "high",
        });
      }
    });

    // Detect modified methods and parameter changes
    this.previousMethods.forEach((prevMethod, name) => {
      const currMethod = this.currentMethods.get(name);
      if (!currMethod) return;

      if (this.methodSignatureChanged(prevMethod, currMethod)) {
        changedMethods.push({
          name,
          type: "signature_changed",
          previousSignature: this.getSignature(prevMethod),
          newSignature: this.getSignature(currMethod),
          impact: "high",
        });
      }

      const paramChanges = this.detectParameterChanges(prevMethod, currMethod);
      modifiedParameters.push(...paramChanges);
    });

    // Detect deprecated features
    this.currentMethods.forEach((method) => {
      if (method.generationHints?.deprecated) {
        deprecatedFeatures.push(method.name);
      }
    });

    const breaking =
      removedMethods.length > 0 ||
      changedMethods.filter((c) => c.impact === "high").length > 0 ||
      modifiedParameters.filter((p) => p.impact === "breaking").length > 0;

    const severity = this.calculateSeverity(
      removedMethods,
      changedMethods,
      modifiedParameters
    );

    return {
      breaking,
      changedMethods,
      removedMethods,
      modifiedParameters,
      deprecatedFeatures,
      severity,
    };
  }

  private methodSignatureChanged(
    prev: SDKMethod,
    curr: SDKMethod
  ): boolean {
    const prevParams = (prev.parameters || []).length;
    const currParams = (curr.parameters || []).length;
    return prevParams !== currParams || prev.returns?.type !== curr.returns?.type;
  }

  private detectParameterChanges(
    prevMethod: SDKMethod,
    currMethod: SDKMethod
  ): ParameterChange[] {
    const changes: ParameterChange[] = [];
    const prevParams = new Map((prevMethod.parameters || []).map(p => [p.name, p]));
    const currParams = new Map((currMethod.parameters || []).map(p => [p.name, p]));

    prevParams.forEach((prevParam, name) => {
      const currParam = currParams.get(name);

      if (!currParam) {
        changes.push({
          methodName: prevMethod.name,
          parameterName: name,
          change: "removed",
          impact: "breaking",
        });
      } else if (prevParam.type !== currParam.type) {
        changes.push({
          methodName: prevMethod.name,
          parameterName: name,
          change: "type_changed",
          oldType: prevParam.type,
          newType: currParam.type,
          impact: "breaking",
        });
      } else if (!prevParam.required && currParam.required) {
        changes.push({
          methodName: prevMethod.name,
          parameterName: name,
          change: "made_required",
          impact: "breaking",
        });
      }
    });

    return changes;
  }

  private getSignature(method: SDKMethod): string {
    const params = method.parameters
      ? method.parameters.map((p) => `${p.name}: ${p.type}`).join(", ")
      : "";
    return `${method.name}(${params}): ${method.returns?.type || 'any'}`;
  }

  private calculateSeverity(
    removedMethods: string[],
    changedMethods: MethodChange[],
    modifiedParameters: ParameterChange[]
  ): "critical" | "major" | "minor" | "patch" {
    if (removedMethods.length > 2) return "critical";
    if (removedMethods.length > 0) return "major";
    if (changedMethods.length > 3) return "major";
    if (modifiedParameters.filter((p) => p.impact === "breaking").length > 2)
      return "major";
    if (modifiedParameters.some((p) => p.impact === "breaking")) return "minor";
    return "patch";
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export {
  SchemaValidator,
  HallucinationDetector,
  LintingEngine,
  BreakingChangeDetector,
};
