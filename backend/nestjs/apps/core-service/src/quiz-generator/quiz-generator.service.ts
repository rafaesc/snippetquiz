import { Injectable, Inject, Logger } from '@nestjs/common';
import { type ClientGrpc } from '@nestjs/microservices';
import {
  Observable,
  from,
  map,
  switchMap,
  tap,
  forkJoin,
  EMPTY,
  of,
  concatMap,
} from 'rxjs';
import { PrismaClient } from 'generated/prisma/postgres';
import { AI_GENERATION_SERVICE } from '../config/services';
import {
  GenerateQuizRequest,
  QuizGenerationProgressCamelCase,
  AiGenerationService,
} from './dto/quiz-generator.dto';
import { CoreQuizGenerationStatus } from './dto/core-quiz-generation.dto';
import { QuizService } from '../quiz/quiz.service';
import { ContentEntryService } from '../content-entry/content-entry.service';

@Injectable()
export class QuizGeneratorService extends PrismaClient {
  private readonly logger = new Logger(QuizGeneratorService.name);
  private aiGenerationService: AiGenerationService;

  constructor(
    @Inject(AI_GENERATION_SERVICE) private client: ClientGrpc,
    private quizService: QuizService,
    private contentEntryService: ContentEntryService,
  ) {
    super();
  }

  onModuleInit() {
    try {
      this.aiGenerationService = this.client.getService<AiGenerationService>(
        'AiGenerationService',
      );
    } catch (error) {
      throw error;
    }
  }

  async getContentEntriesByBankId(
    bankId: number,
    userId: string,
  ): Promise<{ request: GenerateQuizRequest; entriesSkipped: number }> {
    try {
      const contentBank = await this.contentBank.findFirst({
        where: {
          id: BigInt(bankId),
          userId: userId,
        },
      });

      if (!contentBank) {
        throw new Error(
          `Content bank not found or access denied for user ${userId}`,
        );
      }

      this.logger.log(`Content bank ${bankId} validated for user ${userId}`);

      const contentEntries = await this.contentEntry.findMany({
        where: {
          contentBanks: {
            some: {
              contentBankId: BigInt(bankId),
            },
          },
        },
        select: {
          id: true,
          pageTitle: true,
          content: true,
          wordCount: true,
          questionsGenerated: true,
        },
      });

      this.logger.log(
        `Found ${contentEntries.length} content entries for bankId: ${bankId}`,
      );

      if (contentEntries.length === 0) {
        this.logger.warn(`No content entries found for bankId: ${bankId}`);
      }

      const mappedEntries: GenerateQuizRequest['contentEntries'] = [];
      let entriesSkipped = 0;

      for (const entry of contentEntries) {
        if (entry.questionsGenerated) {
          entriesSkipped++;
          //continue;
        }
        mappedEntries.push({
          id: Number(entry.id),
          pageTitle: entry.pageTitle || '',
          content: entry.content || '',
          wordCountAnalyzed: entry.wordCount || 0,
        });
      }

      const instruction = await this.quizGenerationInstruction.findFirst({
        where: {
          userId,
        },
      });

      return {
        request: {
          instructions: instruction?.instruction || '',
          contentEntries: mappedEntries,
        },
        entriesSkipped,
      };
    } catch (error) {
      this.logger.error(
        `Failed to fetch content entries for bankId: ${bankId}`,
        error,
      );
      throw error;
    }
  }

  generateQuizStream(
    bankId: number,
    userId: string,
  ): Observable<CoreQuizGenerationStatus> {
    let processedContentEntries = 0;
    let totalContentEntries = 0;
    let entriesSkipped = 0;
    let totalQuestionsGenerated = 0;
    let totalChunks = 0;
    let currentChunkIndex = -1;
    const processedContentEntryIds = new Set<string>();

    return from(
      this.contentEntryService.calculateTotalChunksForBank(bankId, userId),
    ).pipe(
      switchMap((totalChunksInfo) => {
        totalChunks = totalChunksInfo;
        return from(
          this.getContentEntriesByBankId(bankId, userId).then(
            (response: {
              request: GenerateQuizRequest;
              entriesSkipped: number;
            }) => {
              totalContentEntries = response.request.contentEntries.length;
              entriesSkipped = response.entriesSkipped;
              return response.request;
            },
          ),
        );
      }),
      switchMap(
        (
          request: GenerateQuizRequest,
        ): Observable<QuizGenerationProgressCamelCase> => {
          if (request.contentEntries.length === 0) {
            return of({
              completed: true,
            });
          }
          return this.aiGenerationService.generateQuiz(request);
        },
      ),
      tap((progress) => {
        this.logger.debug(`[TAP] Progress received:`, {
          hasStatus: !!progress.status,
          hasResult: !!progress.result,
          hasCompleted: !!progress.completed,
          progressKeys: Object.keys(progress || {})
        });
        
        if (progress.status) {
          this.logger.debug(`[TAP] Processing status:`, {
            contentEntryId: progress.status.contentEntryId,
            statusKeys: Object.keys(progress.status || {})
          });
          const contentEntryId = progress.status.contentEntryId.toString();
          if (!processedContentEntryIds.has(contentEntryId)) {
            processedContentEntryIds.add(contentEntryId);
            processedContentEntries++;
            this.logger.debug(`[TAP] Added new content entry ${contentEntryId}, total processed: ${processedContentEntries}`);
          }
        }
        if (progress.result) {
          this.logger.debug(`[TAP] Processing result:`, {
            resultKeys: Object.keys(progress.result || {}),
            hasQuestions: !!progress.result.questions,
            questionsType: typeof progress.result.questions,
            questionsLength: progress.result.questions?.length
          });
          currentChunkIndex++;
          this.logger.debug(`[TAP] Incremented chunk index to: ${currentChunkIndex}`);
        }
      }),
      concatMap(
        (
          progress: QuizGenerationProgressCamelCase,
        ): Observable<CoreQuizGenerationStatus> => {
          this.logger.debug(`[CONCATMAP] Processing progress:`, {
            hasResult: !!progress.result,
            hasCompleted: !!progress.completed,
            hasStatus: !!progress.status
          });
          
          if (progress.result) {
            this.logger.debug(`[CONCATMAP] Progress result details:`, {
              resultKeys: Object.keys(progress.result || {}),
              contentEntryId: progress.result.contentEntryId,
              hasQuestions: !!progress.result.questions,
              questionsType: typeof progress.result.questions,
              questionsIsArray: Array.isArray(progress.result.questions)
            });
            
            const contentEntryId = progress.result.contentEntryId;
            const questions = progress.result.questions;
            
            // Critical logging before accessing .length
            this.logger.debug(`[CONCATMAP] About to access questions.length:`, {
              questions,
              questionsType: typeof questions,
              questionsIsArray: Array.isArray(questions),
              questionsIsNull: questions === null,
              questionsIsUndefined: questions === undefined
            });
            
            if (!questions) {
              this.logger.error(`[CONCATMAP] Questions is null/undefined for content entry ${contentEntryId}`);
              return of({
                progress: {
                  bank_id: bankId.toString(),
                  total_content_entries: totalContentEntries,
                  current_content_entry_index: processedContentEntries,
                  questions_generated_so_far: totalQuestionsGenerated,
                  total_content_entries_skipped: entriesSkipped,
                  current_chunk_index: currentChunkIndex,
                  total_chunks: totalChunks,
                  content_entry: {
                    id: progress.result?.contentEntryId?.toString(),
                    name: progress.result?.pageTitle,
                    word_count_analyzed: progress?.result?.wordCountAnalyzed,
                  },
                },
              });
            }
            
            if (!Array.isArray(questions)) {
              this.logger.error(`[CONCATMAP] Questions is not an array for content entry ${contentEntryId}:`, {
                questionsType: typeof questions,
                questions
              });
              return of({
                progress: {
                  bank_id: bankId.toString(),
                  total_content_entries: totalContentEntries,
                  current_content_entry_index: processedContentEntries,
                  questions_generated_so_far: totalQuestionsGenerated,
                  total_content_entries_skipped: entriesSkipped,
                  current_chunk_index: currentChunkIndex,
                  total_chunks: totalChunks,
                  content_entry: {
                    id: progress.result?.contentEntryId?.toString(),
                    name: progress.result?.pageTitle,
                    word_count_analyzed: progress?.result?.wordCountAnalyzed,
                  },
                },
              });
            }
            
            totalQuestionsGenerated += questions.length;
            this.logger.log(
              `Processing ${questions.length} questions for content entry ${contentEntryId}`,
            );
            
            // Log each question before processing
            questions.forEach((question, index) => {
              this.logger.debug(`[CONCATMAP] Question ${index}:`, {
                hasQuestion: !!question,
                questionKeys: Object.keys(question || {}),
                hasOptions: !!question?.options,
                optionsType: typeof question?.options,
                optionsIsArray: Array.isArray(question?.options),
                optionsLength: question?.options?.length
              });
            });

            // Create all questions for this content entry sequentially
            const questionCreationObservables = questions.map((question, questionIndex) => {
              this.logger.debug(`[QUESTION_MAP] Processing question ${questionIndex}:`, {
                question,
                hasOptions: !!question?.options,
                optionsType: typeof question?.options,
                optionsIsArray: Array.isArray(question?.options)
              });
              
              if (!question) {
                this.logger.error(`[QUESTION_MAP] Question ${questionIndex} is null/undefined`);
                return of(null); // Return observable that completes
              }
              
              if (!question.options) {
                this.logger.error(`[QUESTION_MAP] Question ${questionIndex} has no options:`, question);
                return of(null);
              }
              
              if (!Array.isArray(question.options)) {
                this.logger.error(`[QUESTION_MAP] Question ${questionIndex} options is not an array:`, {
                  optionsType: typeof question.options,
                  options: question.options
                });
                return of(null);
              }
              
              return this.quizService
                .createQuestion({
                  userId,
                  contentEntryId,
                  question: question.question,
                  options: question.options.map((option, optionIndex) => {
                    this.logger.debug(`[OPTION_MAP] Processing option ${optionIndex}:`, {
                      option,
                      hasOptionText: !!option?.optionText,
                      hasOptionExplanation: !!option?.optionExplanation,
                      hasIsCorrect: option?.isCorrect !== undefined
                    });
                    
                    if (!option) {
                      this.logger.error(`[OPTION_MAP] Option ${optionIndex} is null/undefined`);
                      return {
                        optionText: '',
                        optionExplanation: '',
                        isCorrect: false,
                      };
                    }
                    
                    return {
                      optionText: option.optionText || '',
                      optionExplanation: option.optionExplanation || '',
                      isCorrect: option.isCorrect || false,
                    };
                  }),
                })
                .pipe(
                  tap((result) => {
                    this.logger.log(
                      `Created question ${result.questionId} for content entry ${contentEntryId}`,
                    );
                  }),
                );
            }).filter(obs => obs !== null); // Filter out null observables

            this.logger.debug(`[CONCATMAP] Created ${questionCreationObservables.length} question observables`);

            // Execute all question creations in parallel, then update content entry
            return forkJoin(questionCreationObservables.length > 0 ? questionCreationObservables : [of(null)]).pipe(
              switchMap(() =>
                this.contentEntryService.updateContentEntry({
                  userId,
                  contentEntryId,
                }),
              ),
              map(() => {
                this.logger.log(
                  `Content entry ${contentEntryId} updated. Progress: ${processedContentEntries}/${totalContentEntries}`,
                );
                return {
                  progress: {
                    bank_id: bankId.toString(),
                    total_content_entries: totalContentEntries,
                    current_content_entry_index: processedContentEntries,
                    questions_generated_so_far: totalQuestionsGenerated,
                    total_content_entries_skipped: entriesSkipped,
                    current_chunk_index: currentChunkIndex,
                    total_chunks: totalChunks,
                    content_entry: {
                      id: progress.result?.contentEntryId?.toString(),
                      name: progress.result?.pageTitle,
                      word_count_analyzed: progress?.result?.wordCountAnalyzed,
                    },
                  },
                };
              }),
            );
          }

          if (progress.completed) {
            this.logger.log(
              `All content entries processed. Creating quiz for bankId: ${bankId}`,
            );

            return this.quizService
              .createQuiz({
                userId,
                bankId,
              })
              .pipe(
                tap({
                  next: (result) => {
                    this.logger.log(
                      `Quiz created successfully Quiz ID: ${result.quizId}`,
                    );
                  },
                  error: (error) => {
                    this.logger.error(
                      `Failed to create quiz: ${error.message}`,
                      error,
                    );
                  },
                }),
                map((result) => {
                  return {
                    completed: {
                      quiz_id: result.quizId,
                    },
                  };
                }),
              );
          }

          this.logger.debug(`[CONCATMAP] Falling back to getQuestionsGenerated`);
          return this.quizService
            .getQuestionsGenerated({
              userId,
              contentBankId: bankId,
            })
            .pipe(
              map((questionsGenerated) => ({
                progress: {
                  bank_id: bankId.toString(),
                  total_content_entries: totalContentEntries,
                  current_content_entry_index: processedContentEntries,
                  questions_generated_so_far: questionsGenerated,
                  total_content_entries_skipped: entriesSkipped,
                  current_chunk_index: currentChunkIndex,
                  total_chunks: totalChunks,
                  content_entry: {
                    id: progress?.status?.contentEntryId?.toString(),
                    name: progress?.status?.pageTitle,
                    word_count_analyzed: progress?.status?.wordCountAnalyzed,
                  },
                },
              })),
            );
        },
      ),
    );
  }
}
