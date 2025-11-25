import { Injectable, Logger } from '@nestjs/common';
import { QuizCreatedEvent } from './events/quiz-created.event';
import { AIQuestionGeneratedEvent, ContentEntryDto } from './events/ai-question-generated.event';
import { EventProcessorService } from '../event-processor/event-processor.service';
import { PrismaService } from '../utils/prisma.service';
import { EventBusService } from '../../../commons/event-bus/event-bus.service';
import { AiClientService } from '../ai-client/ai-client.service';

@Injectable()
export class QuizService {
    private readonly logger = new Logger(QuizService.name);
    private readonly chunkSize = 2500; // Configurable chunk size
    private readonly delayBetweenChunks = 20000; // 20 seconds delay between chunks

    constructor(
        private readonly prisma: PrismaService,
        private readonly aiClientService: AiClientService,
        private readonly eventProcessorService: EventProcessorService,
        private readonly eventBusService: EventBusService,
    ) { }

    async processQuizCreated(event: QuizCreatedEvent) {
        this.logger.log(`Processing quiz created: ${event.aggregateId}`);

        // Idempotency check
        if (await this.eventProcessorService.isEventProcessed(event.eventId)) {
            this.logger.log(`Event ${event.eventId} already processed. Skipping.`);
            return;
        }

        try {
            const userId = event.userId;
            const quizId = event.aggregateId;
            const bankId = event.contentBankId;
            const instructions = event.instructions;
            const contentEntryIds = event.newContentEntries;
            const entriesSkipped = event.entriesSkipped;

            this.logger.log(
                `📋 Received CREATE QUIZ event Quiz ID: ${quizId}, User ID: ${userId}, Bank ID: ${bankId}, Content Entries Count: ${contentEntryIds.length}`,
            );

            // Fetch content entries from DB
            const contentEntries: Array<{
                id: string;
                content: string | null;
                pageTitle: string | null;
                wordCount: number | null;
            }> = [];

            if (contentEntryIds.length > 0) {
                try {
                    const entries = await this.prisma.contentEntry.findMany({
                        where: {
                            id: { in: contentEntryIds },
                        },
                        select: {
                            id: true,
                            content: true,
                            pageTitle: true,
                            wordCount: true,
                        },
                    });

                    for (const entry of entries) {
                        contentEntries.push({
                            id: entry.id,
                            content: entry.content,
                            pageTitle: entry.pageTitle,
                            wordCount: entry.wordCount,
                        });
                    }

                    this.logger.log(`✅ Fetched ${contentEntries.length} content entries from DB`);
                } catch (error) {
                    this.logger.error(`❌ Error fetching content entries from DB: ${error.message}`);
                    throw error;
                }
            }

            // Calculate total chunks
            let totalChunks = 0;
            for (const entry of contentEntries) {
                if (entry.content) {
                    const chunks = Math.ceil(entry.content.length / this.chunkSize);
                    totalChunks += chunks;
                }
            }

            this.logger.log(
                `📊 Total chunks to process: ${totalChunks} (chunk size: ${this.chunkSize}) Quiz ID: ${quizId}`,
            );

            // Check if content entries is empty
            if (contentEntries.length === 0) {
                this.logger.log(`📭 No content entries to process for Quiz ID: ${quizId}`);

                // Send empty event
                const emptyEvent = new AIQuestionGeneratedEvent(
                    quizId,
                    userId,
                    0,
                    entriesSkipped,
                    0,
                    0,
                    null as any,
                    0,
                    0,
                    bankId,
                );

                await this.eventBusService.publish(emptyEvent);
                this.logger.log(`📤 Sent empty content entries event for Quiz ID: ${quizId}`);

                // Mark event as processed
                await this.eventProcessorService.saveEventProcessed(event);
                return;
            }

            // Process each content entry and each chunk
            let currentChunkIndex = 0;
            let totalQuestionsGenerated = 0;

            for (let entryIndex = 0; entryIndex < contentEntries.length; entryIndex++) {
                const entry = contentEntries[entryIndex];
                const { id: entryId, pageTitle, content } = entry;

                if (!content) {
                    this.logger.log(
                        `📄 Entry ${entryIndex + 1} (ID: ${entryId}): '${pageTitle}' - No content`,
                    );
                    continue;
                }

                // Calculate number of chunks for this entry
                const entryChunks = Math.ceil(content.length / this.chunkSize);
                this.logger.log(
                    `  📄 Entry ${entryIndex + 1} (ID: ${entryId}): '${pageTitle}' - ${content.length} chars -> ${entryChunks} chunks`,
                );

                // Initialize summaries list for this content entry
                let summaries: string[] = [];

                // Process each chunk of this content entry
                for (let chunkIndex = 0; chunkIndex < entryChunks; chunkIndex++) {
                    const startPos = chunkIndex * this.chunkSize;
                    const endPos = Math.min(startPos + this.chunkSize, content.length);
                    const chunkContent = content.substring(startPos, endPos);

                    // Generate questions using AI
                    let chunkQuestions: any[] = [];
                    try {
                        const result = await this.aiClientService.generateQuizQuestions(
                            instructions,
                            summaries,
                            pageTitle,
                            chunkContent,
                        );

                        // Convert AI response to the expected format
                        chunkQuestions = result.questions.map((q: any) => ({
                            question: q.question || '',
                            type: q.type || 'MULTIPLE_CHOICE',
                            options: (q.options || []).map((opt: any) => ({
                                optionText: opt.text || '',
                                optionExplanation: opt.explanation || '',
                                isCorrect: opt.correct || false,
                            })),
                        }));

                        // Update summaries for next chunks
                        if (result.summary) {
                            summaries = [result.summary];
                        }

                        this.logger.log(
                            `Generated ${chunkQuestions.length} questions from chunk ${chunkIndex + 1}`,
                        );
                    } catch (error) {
                        this.logger.error(
                            `Error generating questions for chunk ${chunkIndex + 1}: ${error.message}`,
                        );
                        // Fallback to empty questions list if AI generation fails
                        chunkQuestions = [];
                    }

                    // Create content entry for this chunk
                    const chunkContentEntry: ContentEntryDto = {
                        id: entryId,
                        pageTitle: pageTitle,
                        wordCountAnalyzed: chunkContent.split(/\s+/).length,
                        questions: chunkQuestions,
                    };

                    // Increment total questions generated
                    totalQuestionsGenerated += chunkQuestions.length;

                    // Publish question generated event
                    const questionEvent = new AIQuestionGeneratedEvent(
                        quizId,
                        userId,
                        contentEntries.length,
                        entriesSkipped,
                        entryIndex,
                        totalQuestionsGenerated,
                        chunkContentEntry,
                        totalChunks,
                        currentChunkIndex,
                        bankId,
                    );

                    await this.eventBusService.publish(questionEvent);

                    // Increment the global chunk index
                    currentChunkIndex++;
                    this.logger.log(`📈 Total questions generated so far: ${totalQuestionsGenerated}`);

                    // 20 second delay between chunks (to avoid rate limiting)
                    if (currentChunkIndex < totalChunks) {
                        await this.delay(this.delayBetweenChunks);
                    }
                }
            }

            this.logger.log(`🎯 Final total questions generated: ${totalQuestionsGenerated}`);

            // Mark event as processed
            await this.eventProcessorService.saveEventProcessed(event);

        } catch (error) {
            this.logger.error(`Error processing quiz created: ${error.message}`, error.stack);
            throw error;
        }
    }

    private delay(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
}
