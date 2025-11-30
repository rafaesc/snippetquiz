import { CharacterEmotionsResponse } from '../character/types';

export class PromptTemplates {
    /**
     * Generate a prompt for topic generation based on content and context
     */
    static getTopicGenerationPrompt(
        content: string,
        pageTitle: string,
        existingTopics: string[],
        characterName?: String | null,
        introPrompt?: String | null,
        emotionPrompt?: String | null,
    ): string {
        const existingTopicsStr =
            existingTopics && existingTopics.length > 0
                ? existingTopics.join(', ')
                : 'None';

        let characterContext = '';
        let characterInstructions = '';

        if (introPrompt && emotionPrompt) {
            characterContext = `\n\nCharacter Context:
You are ${introPrompt}. ${emotionPrompt}`;

            characterInstructions = `\n6. As ${characterName}, provide a brief, engaging comment about this content (1-2 sentences)
7. Select the most appropriate emotion from the available emotions that matches your comment
8. Your comment must be in the same language as the content you are analyzing`;
        }

        const prompt = `You are an expert content analyst. Your task is to generate relevant, specific topics based on the provided content.${characterContext}

Page Title: ${pageTitle}

Content to analyze:
${content.substring(0, 2500)}${content.length > 2500 ? '...' : ''}

Existing topics that you can reuse if you need it:
${existingTopicsStr}

Instructions:
1. Generate 1-3 topics that are relevant to the content
2. Topics should be generic
3. First identify reusable topics from existing topics before creating new ones.
4. Topics should be concise (2-5 words each)
5. Focus on key concepts, themes, or subjects discussed in the content${characterInstructions}

Please provide your response as JSON.`;

        return prompt;
    }

    /**
     * Get the JSON schema for topic generation response structure
     */
    static getTopicGenerationJsonSchema(includeCharacter: boolean = false): Record<string, any> {
        const properties: any = {
            topics: {
                type: 'array',
                items: {
                    type: 'string',
                    description: 'A relevant topic',
                },
                minItems: 1,
                maxItems: 6,
            },
        };

        const required = ['topics'];

        if (includeCharacter) {
            properties.comment = {
                type: 'string',
                description: 'Character AI comment about the content',
            };
            required.push('comment');
        }

        return {
            name: 'topic_generation_response',
            schema: {
                type: 'object',
                properties,
                required,
                additionalProperties: false,
            },
        };
    }

    /**
     * Generate a system prompt that includes instructions and context summaries
     */
    static getQuizGenerationSystemPrompt(
        instructions: string,
        summaries: string[],
    ): string {
        let systemPrompt = `You are an expert quiz creator. Follow these custom instructions: ${instructions}`;

        if (summaries && summaries.length > 0) {
            const summariesText = summaries.map((s) => `- ${s}`).join('\n');
            systemPrompt += `\n\nPrevious content summaries for context:\n${summariesText}`;
            systemPrompt +=
                '\n\nConsider the previous summaries for context but focus on new information in the current content chunk.';
        }

        return systemPrompt;
    }

    /**
     * Generate a prompt for quiz question generation with custom instructions and context
     */
    static getQuizGenerationPrompt(
        instructions: string,
        summaries: string[],
        pageTitle: string | null,
        content: string | null,
    ): string {
        const prompt = `You are an expert quiz creator. Generate high-quality multiple-choice questions and a summary based on the provided content.

Page Title: ${pageTitle}

Content to analyze:
${content}

Instructions:
1. Create 2-3 multiple-choice questions based on the content and custom instructions
2. Each question should have 4 options (A, B, C, D)
3. Only one option should be correct
4. Options should be without ambiguous options
5. Questions should test understanding, not just memorization
6. Provide clear explanations for why each option is correct or incorrect
7. Generate a concise summary (1-2 sentences) of the key points in this content chunk

Format your response as JSON with this exact structure:
{
  "questions": [
    {
      "question": "Question text here?",
      "options": [
        {"text": "Option A", "correct": true, "explanation": "Why this is correct"},
        {"text": "Option B", "correct": false, "explanation": "Why this is incorrect"},
        {"text": "Option C", "correct": false, "explanation": "Why this is incorrect"},
        {"text": "Option D", "correct": false, "explanation": "Why this is incorrect"}
      ]
    }
  ],
  "summary": "Concise summary of this content chunk"
}
`;
        return prompt;
    }

    /**
     * Get the JSON schema for quiz generation response structure
     */
    static getQuizGenerationJsonSchema(): Record<string, any> {
        return {
            name: 'quiz_generation_response',
            schema: {
                type: 'object',
                properties: {
                    questions: {
                        type: 'array',
                        items: {
                            type: 'object',
                            properties: {
                                question: {
                                    type: 'string',
                                    description: 'The quiz question text',
                                },
                                options: {
                                    type: 'array',
                                    items: {
                                        type: 'object',
                                        properties: {
                                            text: {
                                                type: 'string',
                                                description: 'The option text',
                                            },
                                            correct: {
                                                type: 'boolean',
                                                description: 'Whether this option is correct',
                                            },
                                            explanation: {
                                                type: 'string',
                                                description:
                                                    'Explanation for why this option is correct or incorrect',
                                            },
                                        },
                                        required: ['text', 'correct', 'explanation'],
                                        additionalProperties: false,
                                    },
                                    minItems: 4,
                                    maxItems: 4,
                                },
                            },
                            required: ['question', 'options'],
                            additionalProperties: false,
                        },
                    },
                    summary: {
                        type: 'string',
                        description: 'Concise summary of the content chunk',
                    },
                },
                required: ['questions', 'summary'],
                additionalProperties: false,
            },
        };
    }
}
