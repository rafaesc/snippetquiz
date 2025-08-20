import { Injectable, Inject, Logger } from '@nestjs/common';
import { type ClientGrpc } from '@nestjs/microservices';
import {
  Observable,
  finalize,
  from,
  map,
  switchMap,
  tap,
  throwError,
  concatMap,
  forkJoin,
  EMPTY,
  takeWhile,
  of,
} from 'rxjs';
import { ContentEntry, PrismaClient } from 'generated/prisma/postgres';
import { QUIZ_GENERATION_SERVICE } from '../config/services';
import {
  GenerateQuizRequest,
  QuizGenerationService,
} from './dto/quiz-generator.dto';
import {
  QuizGenerationProgressDto,
  QuizObservableService,
} from '../quiz/quiz.observable.service';

@Injectable()
export class QuizGeneratorService extends PrismaClient {
  private readonly logger = new Logger(QuizGeneratorService.name);
  private quizGenerationService: QuizGenerationService;

  constructor(
    @Inject(QUIZ_GENERATION_SERVICE) private client: ClientGrpc,
    private quizObservableService: QuizObservableService,
  ) {
    super();
    this.logger.log('QuizGeneratorService initialized');
  }

  onModuleInit() {
    this.logger.log('Initializing gRPC client connection');
    try {
      this.quizGenerationService =
        this.client.getService<QuizGenerationService>('QuizGenerationService');
      this.logger.log(
        'QuizGenerationService gRPC client successfully initialized',
      );
    } catch (error) {
      this.logger.error(
        'Failed to initialize QuizGenerationService gRPC client',
        error,
      );
      throw error;
    }
  }

  async getContentEntriesByBankId(
    bankId: number,
  ): Promise<GenerateQuizRequest> {
    this.logger.log(`Starting to fetch content entries for bankId: ${bankId}`);

    try {
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
        },
      });

      this.logger.log(
        `Found ${contentEntries.length} content entries for bankId: ${bankId}`,
      );

      if (contentEntries.length === 0) {
        this.logger.warn(`No content entries found for bankId: ${bankId}`);
      }

      const mappedEntries = contentEntries.map((entry) => {
        const mappedEntry = {
          id: Number(entry.id),
          pageTitle: entry.pageTitle || 'demo',
          content: entry.content || 'demo',
          wordCountAnalyzed: entry.wordCount || 0,
        };

        this.logger.debug(
          `Mapped entry: ID=${mappedEntry.id}, Title="${mappedEntry.pageTitle}", Content length=${mappedEntry.content.length}`,
        );
        return mappedEntry;
      });

      this.logger.log(
        `Successfully mapped ${mappedEntries.length} content entries`,
      );
      if (mappedEntries.length === 0) {
        this.logger.warn(
          `Cannot generate quiz: no content entries found for bankId: ${bankId}`,
        );
        throw new Error(`No content entries found for content bank ${bankId}`);
      }

      const request: GenerateQuizRequest = {
        contentEntries: mappedEntries,
      };

      this.logger.log(
        `Prepared quiz generation request with ${JSON.stringify(request.contentEntries)} content entries`,
      );

      return request;
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
  ): Observable<QuizGenerationProgressDto> {
    let processedContentEntries = 0;
    let totalContentEntries = 0;
    let allContentEntriesProcessed = false;
    let questionsGeneratedSoFar = 0;

    return from(
      this.getContentEntriesByBankId(bankId).then(
        (request: GenerateQuizRequest) => {
          totalContentEntries = request.contentEntries.length;
          return request;
        },
      ),
    ).pipe(
      switchMap((request: GenerateQuizRequest) =>
        this.quizGenerationService.generateQuiz(request),
      ),
      tap((progress) => {
        if (progress.result) {
          processedContentEntries++;
        }
      }),
      switchMap((progress): Observable<QuizGenerationProgressDto> => {
        if (progress.result) {
          const contentEntryId = progress.result.contentEntryId;
          const questions = progress.result.questions;

          this.logger.log(
            `Processing ${questions.length} questions for content entry ${contentEntryId}`,
          );

          // Create all questions for this content entry sequentially
          const questionCreationObservables = questions.map((question) =>
            this.quizObservableService
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
              this.quizObservableService.updateContentEntry({
                userId,
                contentEntryId,
              }),
            ),
            switchMap(() => {
              this.logger.log(
                `Content entry ${contentEntryId} updated. Progress: ${processedContentEntries}/${totalContentEntries}`,
              );

              // Create quiz immediately when all content entries are processed
              if (processedContentEntries === totalContentEntries) {
                allContentEntriesProcessed = true;
                this.logger.log(
                  `All content entries processed. Creating quiz for bankId: ${bankId}`,
                );

                return this.quizObservableService
                  .createQuiz({
                    userId,
                    bankId,
                  })
                  .pipe(
                    tap({
                      next: (result) => {
                        this.logger.log(
                          `Quiz created successfully: ${result.message}, Quiz ID: ${result.quizId}`,
                        );
                      },
                      error: (error) => {
                        this.logger.error(
                          `Failed to create quiz: ${error.message}`,
                          error,
                        );
                      },
                    }),
                    switchMap(() => {
                      // Get progress information and convert to proto format
                      this.logger.log(
                        `Generating quiz progress for content entry ${contentEntryId}`,
                      );
                      return this.quizObservableService.generateQuizProgress({
                        contentEntryId: contentEntryId,
                        userId: userId,
                      });
                    }),
                  );
              }
              return EMPTY;
            }),
          );
        }

        return this.quizObservableService
          .getQuestionsGenerated({
            userId,
            contentBankId: bankId,
          })
          .pipe(
            map((questionsGenerated) => ({
              event: 'content_entry_progress',
              bank_id: bankId.toString(),
              total_content_entries: totalContentEntries,
              current_content_entry_index: processedContentEntries,
              content_entry: {
                id: progress?.status?.contentEntryId?.toString(),
                name: progress?.status?.pageTitle,
                word_count_analyzed: progress?.status?.wordCountAnalyzed,
              },
              summary: {
                questions_generated_so_far: questionsGenerated,
              },
            })),
          );
      }),
    );
  }
}
