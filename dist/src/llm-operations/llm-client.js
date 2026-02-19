"use strict";
// LLM Client - Handles API calls to LLM services
Object.defineProperty(exports, "__esModule", { value: true });
exports.LLMClient = void 0;
/**
 * LLM Client - Handles calls to LLM APIs
 */
class LLMClient {
    constructor(config) {
        this.config = config;
    }
    /**
     * Call LLM with prompt
     */
    async call(options) {
        const { prompt, input } = options;
        // Build user message from template
        const userMessage = this.buildUserMessage(prompt.userPromptTemplate, input);
        // Call appropriate provider
        switch (this.config.modelProvider) {
            case 'openai':
                return await this.callOpenAI(prompt, userMessage);
            case 'anthropic':
                return await this.callAnthropic(prompt, userMessage);
            default:
                throw new Error(`Unknown provider: ${this.config.modelProvider}`);
        }
    }
    /**
     * Build user message from template
     */
    buildUserMessage(template, input) {
        let message = template;
        for (const [key, value] of Object.entries(input)) {
            const placeholder = `\${${key}}`;
            const valueStr = typeof value === 'string' ? value : JSON.stringify(value, null, 2);
            message = message.replace(new RegExp(placeholder, 'g'), valueStr);
        }
        return message;
    }
    /**
     * Call OpenAI API (stub)
     */
    async callOpenAI(prompt, _userMessage) {
        // This would be implemented with actual OpenAI SDK
        // For now, return stub
        if (this.config.enableLogging) {
            console.log(`[LLM] OpenAI call to ${prompt.model}`);
        }
        throw new Error('OpenAI integration not yet implemented');
    }
    /**
     * Call Anthropic API (stub)
     */
    async callAnthropic(prompt, _userMessage) {
        // This would be implemented with actual Anthropic SDK
        // For now, return stub
        if (this.config.enableLogging) {
            console.log(`[LLM] Anthropic call to ${prompt.model}`);
        }
        throw new Error('Anthropic integration not yet implemented');
    }
}
exports.LLMClient = LLMClient;
//# sourceMappingURL=llm-client.js.map