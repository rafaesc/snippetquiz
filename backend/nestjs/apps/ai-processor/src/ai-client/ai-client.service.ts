import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { OpenRouter } from '@openrouter/sdk';
import { envs } from '../config/envs';
import { PromptTemplates } from './prompt-templates';

@Injectable()
export class AiClientService implements OnModuleInit {
    private client: OpenRouter;
    private readonly logger = new Logger(AiClientService.name);
    private readonly model = 'mistralai/mistral-7b-instruct:free';
    private readonly models = [
        'google/gemma-3n-e4b-it:free',
        'meta-llama/llama-3.2-3b-instruct:free',
        'mistralai/mistral-7b-instruct:free',
    ];

    onModuleInit() {
        if (!envs.openRouterApiKey) {
            throw new Error('OPENROUTER_API_KEY environment variable is required');
        }

        this.client = new OpenRouter({
            apiKey: envs.openRouterApiKey,
        });
    }

    /**
     * Generate completion using OpenRouter AI API via OpenAI client
     */
    async generateCompletion(
        messages: any[],
        maxTokens: number = 1000,
        jsonSchema?: Record<string, any>,
    ): Promise<string | null> {
        try {
            // Build the request parameters
            const requestParams: any = {
                model: this.model,
                messages: messages,
                max_tokens: maxTokens,
                temperature: 0.7,
                stream: false,
                extra_body: {
                    models: this.models,
                },
            };

            // Add response_format if jsonSchema is provided
            if (jsonSchema) {
                requestParams.response_format = {
                    type: 'json_schema',
                    json_schema: jsonSchema,
                };
            }

            const completion = await this.client.chat.send(requestParams);

            return completion.choices[0].message.content?.toString() || null;
        } catch (e) {
            this.logger.error(`Error generating completion: ${e}`);
            return null;
        }
    }

    /**
     * Generate topics based on content, page title, and existing topics
     */
    async generateTopics(
        content: string,
        pageTitle: string,
        existingTopics: string[],
    ): Promise<string[]> {
        // Create the prompt using the template
        const prompt = PromptTemplates.getTopicGenerationPrompt(
            content,
            pageTitle,
            existingTopics,
        );

        const messages: any[] = [
            { role: 'user', content: prompt },
        ];

        const jsonSchema = PromptTemplates.getTopicGenerationJsonSchema();

        const response = await this.generateCompletion(
            messages,
            500,
            jsonSchema,
        );

        if (response) {
            // Parse the response to extract topics
            try {
                const cleanedResponse = this.cleanJsonResponse(response);
                if (!cleanedResponse) {
                    // If cleaning failed, try to use raw response as string list
                    throw new Error('Cleaning returned empty');
                }
                const result = JSON.parse(cleanedResponse);

                if (result && Array.isArray(result)) {
                    return result;
                }

                this.logger.warn(`Unexpected JSON structure: ${JSON.stringify(result)}`);
                return [];
            } catch (e) {
                this.logger.warn(`Failed to parse topics as JSON: ${e}. Trying to parse as string list. Response: ${response}`);
                // Fallback: treat as comma or newline separated string
                // Remove potential JSON formatting chars if they exist but parsing failed
                const cleanText = response.replace(/[{}\[\]"]/g, '');
                return cleanText.split(/,|\n/).map(t => t.trim()).filter(t => t.length > 0);
            }
        } else {
            this.logger.warn('Failed to generate topics, returning empty list');
            return [];
        }
    }

    /**
     * Generate quiz questions and summary based on content chunk
     */
    async generateQuizQuestions(
        instructions: string,
        summaries: string[],
        pageTitle: string | null,
        content: string,
    ): Promise<{ questions: any[]; summary: string }> {
        // Create the system and user prompts using the templates
        const systemPrompt = PromptTemplates.getQuizGenerationSystemPrompt(
            instructions,
            summaries,
        );

        const userPrompt = PromptTemplates.getQuizGenerationPrompt(
            instructions,
            summaries,
            pageTitle,
            content,
        );

        const messages: any[] = [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
        ];

        // Get JSON schema from prompt templates
        const jsonSchema = PromptTemplates.getQuizGenerationJsonSchema();

        // First attempt with JSON schema
        let response = await this.generateCompletion(
            messages,
            1500,
            jsonSchema,
        );

        // Retry mechanism - single retry attempt if first attempt fails
        if (!response) {
            this.logger.warn('First attempt failed, retrying once...');
            response = await this.generateCompletion(
                messages,
                1500,
                jsonSchema,
            );
        }

        if (response) {
            // Clean and parse the JSON response
            try {
                const cleanedResponse = this.cleanJsonResponse(response);
                if (!cleanedResponse) {
                    this.logger.error(`No valid JSON block found in response: ${response}`);
                    return { questions: [], summary: '' };
                }

                const result = JSON.parse(cleanedResponse);
                return {
                    questions: result.questions || [],
                    summary: result.summary || '',
                };
            } catch (e) {
                this.logger.error(`Failed to parse JSON response: ${e}`);
                this.logger.debug(`Raw response: ${response}`);

                // Retry with a fresh request if JSON parsing fails
                this.logger.warn('JSON parsing failed, retrying request once...');
                const retryResponse = await this.generateCompletion(
                    messages,
                    1500,
                    jsonSchema,
                );

                if (retryResponse) {
                    try {
                        const cleanedRetryResponse = this.cleanJsonResponse(retryResponse);
                        if (!cleanedRetryResponse) {
                            this.logger.error('No valid JSON block found in retry response');
                            return { questions: [], summary: '' };
                        }

                        const retryResult = JSON.parse(cleanedRetryResponse);
                        return {
                            questions: retryResult.questions || [],
                            summary: retryResult.summary || '',
                        };
                    } catch (retryE) {
                        this.logger.error(`Retry also failed to parse JSON: ${retryE}`);
                        this.logger.debug(`Retry response: ${retryResponse}`);
                    }
                }
                return { questions: [], summary: '' };
            }
        } else {
            this.logger.error(
                'Failed to generate quiz questions after retry, returning empty result',
            );
            return { questions: [], summary: '' };
        }
    }

    /**
     * Clean the AI response to ensure valid JSON format
     */
    private cleanJsonResponse(response: string): string | null {
        if (!response) {
            return null;
        }

        // Remove any markdown code block markers (more robust regex)
        // Matches ```json, ```, or just ``` at start/end of string, ignoring whitespace
        let cleaned = response.replace(/```(?:json)?/g, '');

        // Remove trailing commas before closing brackets/braces
        cleaned = cleaned.replace(/,\s*([}\]])/g, '$1');

        // Remove any leading/trailing whitespace
        cleaned = cleaned.trim();

        // Try to extract JSON block (object or array)
        const jsonBlock = this.extractJsonBlock(cleaned);
        return jsonBlock || cleaned;
    }

    /**
     * Extract the first complete JSON block (object or array) from a string
     */
    private extractJsonBlock(s: string): string | null {
        // Find the first opening brace or bracket
        const firstOpenBrace = s.indexOf('{');
        const firstOpenBracket = s.indexOf('[');

        if (firstOpenBrace === -1 && firstOpenBracket === -1) {
            return null;
        }

        // Determine which comes first to decide if we're looking for an object or array
        let startIndex = -1;
        let openChar = '';
        let closeChar = '';

        if (firstOpenBrace !== -1 && (firstOpenBracket === -1 || firstOpenBrace < firstOpenBracket)) {
            startIndex = firstOpenBrace;
            openChar = '{';
            closeChar = '}';
        } else {
            startIndex = firstOpenBracket;
            openChar = '[';
            closeChar = ']';
        }

        let openCount = 0;
        let endIndex = -1;

        for (let i = startIndex; i < s.length; i++) {
            if (s[i] === openChar) {
                openCount++;
            } else if (s[i] === closeChar) {
                openCount--;
                if (openCount === 0) {
                    endIndex = i;
                    break;
                }
            }
        }

        if (startIndex !== -1 && endIndex !== -1) {
            return s.substring(startIndex, endIndex + 1);
        }

        return null;
    }
}
