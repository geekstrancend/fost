/**
 * FOST CLI - Command Line Interface for SDK Generation
 * Handles command parsing, execution, and output formatting
 */
export declare class CLIApplication {
    private readonly args;
    private readonly logger;
    private readonly progress;
    private readonly api;
    constructor(argv?: string[]);
    /**
     * Main CLI entry point
     * Does not include try-catch; errors are handled globally by bootstrap
     */
    run(): Promise<void>;
    /**
     * Handle generate command
     */
    private handleGenerate;
    /**
     * Handle validate command
     */
    private handleValidate;
    /**
     * Handle test command
     */
    private handleTest;
    /**
     * Handle lint command
     */
    private handleLint;
    /**
     * Handle config command
     */
    private handleConfig;
    /**
     * Handle completion command
     */
    private handleCompletion;
    /**
     * Handle version command
     */
    private handleVersion;
    /**
     * Handle help command
     */
    private handleHelp;
}
//# sourceMappingURL=index.d.ts.map