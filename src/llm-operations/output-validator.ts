// Output Validator - Multi-layer validation to catch hallucinations and errors

export interface ValidationError {
  type: 'SCHEMA' | 'SYNTAX' | 'SEMANTIC' | 'CONSISTENCY';
  message: string;
  path?: string;
  suggestion?: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
  output?: any;
  confidence: number; // 0-1, how confident we are in the output
}

/**
 * Output Validator - Multi-layer validation
 * 1. Schema validation (structure)
 * 2. Syntax validation (correctness)
 * 3. Semantic validation (meaning)
 * 4. Consistency validation (alignment with context)
 */
export class OutputValidator {
  /**
   * Validate output against schema
   */
  validate(output: any, schema: any): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];

    try {
      // Layer 1: Parse and structure validation
      if (typeof output === 'string') {
        try {
          output = JSON.parse(output);
        } catch (e) {
          errors.push({
            type: 'SCHEMA',
            message: 'Output is not valid JSON',
            suggestion: 'Check that output is properly formatted JSON',
          });
          return { valid: false, errors, warnings, confidence: 0 };
        }
      }

      // Layer 2: Schema validation
      const schemaErrors = this.validateSchema(output, schema);
      errors.push(...schemaErrors);

      if (errors.length > 0) {
        return { valid: false, errors, warnings, confidence: 0 };
      }

      // Layer 3: Semantic validation
      const semanticWarnings = this.validateSemantic(output);
      warnings.push(...semanticWarnings);

      // If we got here, output is structurally valid
      const confidence = warnings.length === 0 ? 1.0 : 0.8 - warnings.length * 0.1;

      return {
        valid: true,
        errors: [],
        warnings,
        output,
        confidence: Math.max(confidence, 0.1),
      };
    } catch (error: any) {
      errors.push({
        type: 'SCHEMA',
        message: `Validation error: ${error.message}`,
      });

      return { valid: false, errors, warnings, confidence: 0 };
    }
  }

  /**
   * Validate against JSON Schema
   */
  private validateSchema(output: any, schema: any): ValidationError[] {
    const errors: ValidationError[] = [];

    if (!schema) {
      return errors; // No schema provided
    }

    // Check required properties
    if (schema.required && Array.isArray(schema.required)) {
      for (const required of schema.required) {
        if (!(required in output)) {
          errors.push({
            type: 'SCHEMA',
            message: `Missing required property: ${required}`,
            path: required,
            suggestion: `Add property "${required}" to output`,
          });
        }
      }
    }

    // Check property types
    if (schema.properties) {
      for (const [key, propSchema] of Object.entries(schema.properties)) {
        if (key in output) {
          const value = (output as any)[key];
          const propErr = this.validateProperty(value, propSchema as any, key);
          errors.push(...propErr);
        }
      }
    }

    return errors;
  }

  /**
   * Validate individual property
   */
  private validateProperty(value: any, schema: any, path: string): ValidationError[] {
    const errors: ValidationError[] = [];

    if (!schema) return errors;

    // Type checking
    const expectedType = schema.type;
    if (expectedType) {
      const actualType = typeof value;
      const typeMatch = this.typeMatches(actualType, value, expectedType);

      if (!typeMatch) {
        errors.push({
          type: 'SCHEMA',
          message: `Property ${path} has wrong type: expected ${expectedType}, got ${actualType}`,
          path,
          suggestion: `Convert ${path} to ${expectedType}`,
        });
      }
    }

    // Pattern matching (regex)
    if (schema.pattern && typeof value === 'string') {
      const regex = new RegExp(schema.pattern);
      if (!regex.test(value)) {
        errors.push({
          type: 'SCHEMA',
          message: `Property ${path} does not match pattern: ${schema.pattern}`,
          path,
        });
      }
    }

    // Enum validation
    if (schema.enum && !schema.enum.includes(value)) {
      errors.push({
        type: 'SCHEMA',
        message: `Property ${path} has invalid value: must be one of ${schema.enum.join(', ')}`,
        path,
      });
    }

    return errors;
  }

  /**
   * Check if actual type matches expected type
   */
  private typeMatches(_actualType: string, value: any, expectedType: string): boolean {
    switch (expectedType) {
      case 'string':
        return typeof value === 'string';
      case 'number':
        return typeof value === 'number' && !isNaN(value);
      case 'integer':
        return Number.isInteger(value);
      case 'boolean':
        return typeof value === 'boolean';
      case 'array':
        return Array.isArray(value);
      case 'object':
        return value !== null && typeof value === 'object' && !Array.isArray(value);
      case 'null':
        return value === null;
      default:
        return true; // Unknown type, assume valid
    }
  }

  /**
   * Semantic validation - Check for obvious errors
   */
  private validateSemantic(output: any): ValidationError[] {
    const warnings: ValidationError[] = [];

    // Check for common hallucination patterns
    if (typeof output === 'object' && output !== null) {
      // Flag any properties that look suspicious
      for (const [key, value] of Object.entries(output)) {
        // Check for undefined or null values
        if (value === undefined) {
          warnings.push({
            type: 'SEMANTIC',
            message: `Property ${key} is undefined`,
            path: key,
          });
        }

        // Check for placeholder values
        if (typeof value === 'string') {
          if (value.toLowerCase().includes('todo') || 
              value.toLowerCase().includes('placeholder') ||
              value === '...' ||
              value === 'undefined') {
            warnings.push({
              type: 'SEMANTIC',
              message: `Property ${key} contains placeholder or incomplete value: "${value}"`,
              path: key,
            });
          }
        }

        // Check for suspicious patterns in code
        if (key === 'code' && typeof value === 'string') {
          if (!value.trim()) {
            warnings.push({
              type: 'SEMANTIC',
              message: 'Code property is empty',
              path: key,
            });
          }
        }
      }
    }

    return warnings;
  }

  /**
   * Check for hallucinations - properties not in source
   */
  detectHallucinations(output: any, sourceSchema: any): string[] {
    const hallucinations: string[] = [];

    if (!sourceSchema || !sourceSchema.properties) {
      return hallucinations;
    }

    if (output.properties && typeof output.properties === 'object') {
      const sourceProps = Object.keys(sourceSchema.properties);
      const generatedProps = Object.keys(output.properties);

      for (const prop of generatedProps) {
        if (!sourceProps.includes(prop)) {
          hallucinations.push(prop);
        }
      }
    }

    return hallucinations;
  }

  /**
   * Calculate output quality score
   */
  scoreOutput(result: ValidationResult): number {
    if (!result.valid) {
      return 0;
    }

    // Deduct points for warnings
    let score = 1.0;
    score -= result.warnings.length * 0.1;
    score = Math.max(score, 0.1); // Minimum 0.1

    return score;
  }
}

/**
 * Specialized validators for specific output types
 */

export class TypeScriptValidator {
  /**
   * Validate TypeScript interface definition
   */
  static validateInterface(code: string): ValidationError[] {
    const errors: ValidationError[] = [];

    // Basic checks
    if (!code.includes('interface ')) {
      errors.push({
        type: 'SYNTAX',
        message: 'Code does not contain interface definition',
        suggestion: 'Code should start with "interface Name { ... }"',
      });
    }

    if (!code.includes('{') || !code.includes('}')) {
      errors.push({
        type: 'SYNTAX',
        message: 'Interface is missing braces',
        suggestion: 'Add { } around interface properties',
      });
    }

    // Check for unmatched braces
    const openBraces = (code.match(/{/g) || []).length;
    const closeBraces = (code.match(/}/g) || []).length;
    if (openBraces !== closeBraces) {
      errors.push({
        type: 'SYNTAX',
        message: `Unmatched braces: ${openBraces} open, ${closeBraces} close`,
        suggestion: 'Check that all braces are properly matched',
      });
    }

    // Check for syntax errors
    if (code.includes(';;') || code.includes(',,') || code.includes('::')) {
      errors.push({
        type: 'SYNTAX',
        message: 'Code contains duplicate operators',
        suggestion: 'Remove duplicate operators',
      });
    }

    return errors;
  }

  /**
   * Validate TypeScript method signature
   */
  static validateMethod(code: string): ValidationError[] {
    const errors: ValidationError[] = [];

    // Check basic structure
    if (!code.includes('(') || !code.includes(')')) {
      errors.push({
        type: 'SYNTAX',
        message: 'Method is missing parameter list',
      });
    }

    // Check for return type
    if (!code.includes(':') && !code.includes('void')) {
      errors.push({
        type: 'SEMANTIC',
        message: 'Method may be missing return type',
        suggestion: 'Add explicit return type (e.g., : string)',
      });
    }

    return errors;
  }
}

export class JSONValidator {
  /**
   * Validate JSON structure
   */
  static validateJSON(text: string): ValidationError[] {
    const errors: ValidationError[] = [];

    try {
      JSON.parse(text);
    } catch (error: any) {
      errors.push({
        type: 'SYNTAX',
        message: `Invalid JSON: ${error.message}`,
        suggestion: 'Fix JSON syntax errors',
      });
    }

    return errors;
  }
}
