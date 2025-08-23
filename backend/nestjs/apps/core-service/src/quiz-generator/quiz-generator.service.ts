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

      this.logger.log(
        `Content bank ${bankId} validated for user ${userId}`,
      );

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

      return {
        request: {
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
    ).pipe(
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
        if (progress.result) {
          processedContentEntries++;
        }
      }),
      concatMap(
        (
          progress: QuizGenerationProgressCamelCase,
        ): Observable<CoreQuizGenerationStatus> => {
          if (progress.result) {
            const contentEntryId = progress.result.contentEntryId;
            const questions = progress.result.questions;

            this.logger.log(
              `Processing ${questions.length} questions for content entry ${contentEntryId}`,
            );

            // Create all questions for this content entry sequentially
            const questionCreationObservables = questions.map((question) =>
              this.quizService
                .createQuestion({
                  userId,
                  contentEntryId,
                  question: question.question,
                  options: question.options.map((option) => ({
                    optionText: option.optionText,
                    optionExplanation: option.optionExplanation,
                    isCorrect: option.isCorrect,
                  })),
                })
                .pipe(
                  tap((result) => {
                    this.logger.log(
                      `Created question ${result.questionId} for content entry ${contentEntryId}`,
                    );
                  }),
                ),
            );

            // Execute all question creations in parallel, then update content entry
            return forkJoin(questionCreationObservables).pipe(
              switchMap(() =>
                this.contentEntryService.updateContentEntry({
                  userId,
                  contentEntryId,
                }),
              ),
              switchMap(() => {
                this.logger.log(
                  `Content entry ${contentEntryId} updated. Progress: ${processedContentEntries}/${totalContentEntries}`,
                );
                return EMPTY;
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
