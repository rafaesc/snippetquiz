import { Injectable, Inject, Logger } from '@nestjs/common';
import { type ClientGrpc } from '@nestjs/microservices';
import { Observable, finalize, from, map, switchMap, tap, throwError, concatMap, forkJoin, EMPTY } from 'rxjs';
import { PrismaClient } from 'generated/prisma/postgres';
import { QUIZ_GENERATION_SERVICE } from '../config/services';
import {
  ContentEntry,
  GenerateQuizRequest,
  QuizGenerationProgress,
  QuizGenerationProgressCamelCase,
  QuizGenerationService,
  mapQuizGenerationProgress,
} from './dto/quiz-generator.dto';
import { QuizObservableService } from '../quiz/quiz.observable.service';

@Injectable()
export class QuizGeneratorService extends PrismaClient {
  private readonly logger = new Logger(QuizGeneratorService.name);
  private quizGenerationService: QuizGenerationService;

  constructor(
    @Inject(QUIZ_GENERATION_SERVICE) private client: ClientGrpc,
    private quizObservableService: QuizObservableService
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

  async getContentEntriesByBankId(bankId: number): Promise<ContentEntry[]> {
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
        };

        this.logger.debug(
          `Mapped entry: ID=${mappedEntry.id}, Title="${mappedEntry.pageTitle}", Content length=${mappedEntry.content.length}`,
        );
        return mappedEntry;
      });

      this.logger.log(
        `Successfully mapped ${mappedEntries.length} content entries`,
      );
      return mappedEntries;
    } catch (error) {
      this.logger.error(
        `Failed to fetch content entries for bankId: ${bankId}`,
        error,
      );
      throw error;
    }
  }

  generateQuizStream(bankId: number, userId: string): Observable<QuizGenerationProgress> {
    let allContentEntriesProcessed = false;
    let processedContentEntries = 0;
    let totalContentEntries = 0;

    return from(this.getContentEntriesByBankId(bankId)).pipe(
      switchMap((contentEntries) => {
        if (contentEntries.length === 0) {
          this.logger.warn(
            `Cannot generate quiz: no content entries found for bankId: ${bankId}`,
          );
          return throwError(
            () =>
              new Error(`No content entries found for content bank ${bankId}`),
          );
        }

        totalContentEntries = contentEntries.length;

        const request: GenerateQuizRequest = {
          contentEntries: contentEntries,
        };

        this.logger.log(
          `Prepared quiz generation request with ${JSON.stringify(request.contentEntries)} content entries`,
        );

        return this.quizGenerationService.generateQuiz(request).pipe(
          switchMap((progress: QuizGenerationProgressCamelCase): Observable<QuizGenerationProgress> => {
            if (progress.result) {
              const contentEntryId = progress.result.contentEntryId;
              const questions = progress.result.questions;

              this.logger.log(
                `Processing ${questions.length} questions for content entry ${contentEntryId}`,
              );

              // Create all questions for this content entry sequentially
              const questionCreationObservables = questions.map((question) =>
                this.quizObservableService.createQuestion({
                  userId,
                  contentEntryId,
                  question: question.question,
                  options: question.options.map((option) => ({
                    optionText: option.optionText,
                    optionExplanation: option.optionExplanation,
                    isCorrect: option.isCorrect,
                  })),
                }).pipe(
                  tap((result) => {
                    this.logger.log(
                      `Created question ${result.questionId} for content entry ${contentEntryId}`,
                    );
                  })
                )
              );

              // Execute all question creations in parallel, then update content entry
              return forkJoin(questionCreationObservables).pipe(
                switchMap(() => {
                  this.logger.log(
                    `All questions created for content entry ${contentEntryId}, updating content entry`,
                  );
                  
                  return this.quizObservableService.updateContentEntry({
                    userId,
                    contentEntryId,
                  });
                }),
                tap(() => {
                  processedContentEntries++;
                  this.logger.log(
                    `Content entry ${contentEntryId} updated. Progress: ${processedContentEntries}/${totalContentEntries}`,
                  );
                  
                  // Create quiz immediately when all content entries are processed
                  if (processedContentEntries === totalContentEntries) {
                    allContentEntriesProcessed = true;
                    this.logger.log(
                      `All content entries processed. Creating quiz for bankId: ${bankId}`,
                    );
                    
                    this.quizObservableService.createQuiz({
                      userId,
                      bankId,
                    }).subscribe({
                      next: (result) => {
                        this.logger.log(
                          `Quiz created successfully: ${result.message}, Quiz ID: ${result.quizId}`,
                        );
                      },
                      error: (error) => {
                        this.logger.error(
                          `Failed to create quiz for bankId ${bankId}:`,
                          error,
                        );
                      },
                    });
                  }
                }),
                map(() => mapQuizGenerationProgress(progress))
              );
            }
            
            return from([mapQuizGenerationProgress(progress)]);
          })
        );
      })
    );
  }
}
