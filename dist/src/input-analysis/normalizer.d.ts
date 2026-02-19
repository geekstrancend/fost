/**
 * Input Normalizer Registry & Pipeline
 *
 * Coordinates multiple parsers, handles validation, and produces canonical specs.
 */
import { InputSpec, NormalizedSpec, ValidationError } from "./types";
import { BaseParser } from "./base-parser";
export declare class InputNormalizer {
    private parsers;
    private readonly builtInTypes;
    constructor();
    /**
     * Register a custom parser
     */
    registerParser(parser: BaseParser): void;
    /**
     * Normalize raw input to canonical intermediate representation
     * Main entry point for the input analysis layer
     */
    normalize(input: InputSpec): NormalizationResult;
    /**
     * Validate that a NormalizedSpec is internally consistent
     * Does NOT validate against Canonical Schema - that happens in canonicalization layer
     */
    private validateNormalizedSpec;
    /**
     * Resolve a type name, handling arrays and references
     */
    private resolveType;
}
export interface NormalizationResult {
    success: boolean;
    spec?: NormalizedSpec;
    error?: string;
    parseErrors?: Array<{
        code: string;
        message: string;
        location?: string;
    }>;
    validationErrors?: ValidationError[];
    warnings: Array<{
        level: "info" | "warning" | "error";
        code: string;
        message: string;
        location?: string;
    }>;
}
/**
 * Get or create the global normalizer instance
 */
export declare function getNormalizer(): InputNormalizer;
/**
 * Convenience function to normalize input
 */
export declare function normalizeInput(input: InputSpec): NormalizationResult;
//# sourceMappingURL=normalizer.d.ts.map