import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { ContentEntry, PrismaClient } from 'generated/prisma/postgres';
import {
  Observable,
  from,
  switchMap,
  map,
  throwError,
  tap,
  EMPTY,
  of,
} from 'rxjs';

interface CreateQuizParams {
  userId: string;
  bankId: number;
}

interface CreateQuestionParams {
  userId: string;
  contentEntryId: number;
  question: string;
  options: {
    optionText: string;
    optionExplanation: string;
    isCorrect: boolean;
  }[];
}

interface UpdateContentEntryParams {
  userId: string;
  contentEntryId: number;
}

// New DTOs for Quiz Generation Progress
interface ContentEntryDto {
  id?: string;
  name?: string;
  word_count_analyzed?: number;
}

interface SummaryDto {
  questions_generated_so_far: number;
}

export interface QuizGenerationProgressDto {
  event: string; // "content_entry_progress" or "content_entry_completed"
  bank_id: string;
  total_content_entries: number;
  current_content_entry_index: number;
  content_entry: ContentEntryDto;
  summary: SummaryDto;
}

export interface GenerateProgressParams {
  contentEntryId: number;
  userId: string;
}

@Injectable()
export class QuizObservableService extends PrismaClient {
  private readonly logger = new Logger(QuizObservableService.name);

  constructor() {
    super();
  }

  /**
   * Create a quiz entity using the user_id and bank id, validate if the bank id has the same user id.
   * Create the QuizQuestions and QuizQuestionOption using the list of Question and Options of all the entries of the content Bank.
   * And finally update the Quiz entity contentEntriesCount and questionsCount
   */
  createQuiz(
    params: CreateQuizParams,
  ): Observable<{ message: string; quizId: number }> {
    const { userId, bankId } = params;

    return from(
      this.contentBank.findFirst({
        where: {
          id: BigInt(bankId),
          userId,
        },
        include: {
          contentEntries: {
            include: {
              contentEntry: {
                include: {
                  questions: {
                    include: {
                      options: true,
                    },
                  },
                },
              },
            },
          },
        },
      }),
    ).pipe(
      switchMap((contentBank) => {
        if (!contentBank) {
          this.logger.error(
            `[createQuiz] Content bank not found for bankId: ${bankId}, userId: ${userId}`,
          );
          return throwError(
            () =>
              new NotFoundException(
                'Content bank not found or you do not have permission to access it',
              ),
          );
        }

        // Create the quiz
        return from(
          this.quiz.create({
            data: {
              userId,
              bankId: BigInt(bankId),
              bankName: contentBank.name,
              contentEntriesCount: 0,
              questionsCount: 0,
              questionsCompleted: 0,
            },
          }),
        ).pipe(
          switchMap((quiz) => {
            // Collect all questions from all content entries
            const allQuestions = contentBank.contentEntries.flatMap(
              (entry) => entry.contentEntry.questions,
            );

            if (allQuestions.length === 0) {
              return from(
                this.quiz.update({
                  where: { id: quiz.id },
                  data: {
                    contentEntriesCount: contentBank.contentEntries.length,
                    questionsCount: 0,
                  },
                }),
              ).pipe(
                map(() => ({
                  message: 'Quiz created successfully with no questions',
                  quizId: Number(quiz.id),
                })),
              );
            }

            // Create quiz questions and options
            const createQuizQuestions = allQuestions.map(
              async (question, index) => {
                const quizQuestion = await this.quizQuestion.create({
                  data: {
                    question: question.question,
                    type: question.type,
                    contentEntryType: 'text', // Default value
                    contentEntrySourceUrl: null,
                    contentEntryId: question.contentEntryId,
                    quizId: quiz.id,
                  },
                });

                // Create quiz question options
                await Promise.all(
                  question.options.map(async (option, optionIndex) => {
                    return this.quizQuestionOption.create({
                      data: {
                        quizQuestionId: quizQuestion.id,
                        optionText: option.optionText,
                        optionExplanation: option.optionExplanation,
                        isCorrect: option.isCorrect,
                      },
                    });
                  }),
                );

                return quizQuestion;
              },
            );

            return from(Promise.all(createQuizQuestions)).pipe(
              switchMap((createdQuestions) => {
                // Update quiz with counts
                return from(
                  this.quiz.update({
                    where: { id: quiz.id },
                    data: {
                      contentEntriesCount: contentBank.contentEntries.length,
                      questionsCount: createdQuestions.length,
                    },
                  }),
                ).pipe(
                  map(() => ({
                    message: 'Quiz created successfully',
                    quizId: Number(quiz.id),
                  })),
                );
              }),
            );
          }),
        );
      }),
    );
  }

  /**
   * Create Question, should receive a list of options and a single question,
   * using content entry id, and user_id, (content entry id should have the same user_id.),
   * should create the question and the question options in the same method,
   * for the question the type column would be hardcoded in the code.
   */
  createQuestion(
    params: CreateQuestionParams,
  ): Observable<{ message: string; questionId: number }> {
    const { userId, contentEntryId, question, options } = params;

    return from(
      this.contentEntry.findFirst({
        select: {
          questionsGenerated: true,
        },
        where: {
          id: BigInt(contentEntryId),
          contentBanks: {
            some: {
              contentBank: {
                userId,
              },
            },
          },
        },
      }),
    ).pipe(
      switchMap((contentEntry) => {
        if (!contentEntry) {
          this.logger.error(
            `[createQuestion] Content entry not found or access denied for contentEntryId: ${contentEntryId}, userId: ${userId}`,
          );
          return throwError(
            () =>
              new NotFoundException(
                'Content entry not found or you do not have permission to access it',
              ),
          );
        }

        if (contentEntry.questionsGenerated) {
          this.logger.error(
            `[createQuestion] Content entry already has questions generated for contentEntryId: ${contentEntryId}, userId: ${userId}`,
          );
          return of({
            message: 'Content entry already has questions generated',
            questionId: 0,
          });
        }

        if (!options || options.length === 0) {
          this.logger.error(
            `[createQuestion] No options provided for question`,
          );
          return of({
            message: 'No options provided for question',
            questionId: 0,
          });
        }

        // Create the question with hardcoded type
        return from(
          this.question.create({
            data: {
              question,
              type: 'multiple_choice', // Hardcoded as requested
              contentEntryId: BigInt(contentEntryId),
            },
          }),
        ).pipe(
          switchMap((createdQuestion) => {
            // Create question options
            const createOptions = options.map((option, index) => {
              return this.questionOption.create({
                data: {
                  questionId: createdQuestion.id,
                  optionText: option.optionText,
                  optionExplanation: option.optionExplanation,
                  isCorrect: option.isCorrect,
                },
              });
            });

            return from(Promise.all(createOptions)).pipe(
              map(() => ({
                message: 'Question created successfully',
                questionId: Number(createdQuestion.id),
              })),
            );
          }),
        );
      }),
    );
  }

  /**
   * Update a Content Entry, using a content entry id, and user id,
   * to enable the column questions_generated to true.
   */
  updateContentEntry(
    params: UpdateContentEntryParams,
  ): Observable<ContentEntry> {
    const { userId, contentEntryId } = params;

    return from(
      this.contentEntry.findFirst({
        where: {
          id: BigInt(contentEntryId),
          contentBanks: {
            some: {
              contentBank: {
                userId,
              },
            },
          },
        },
      }),
    ).pipe(
      switchMap((contentEntry) => {
        if (!contentEntry) {
          this.logger.error(
            `[updateContentEntry] Content entry not found or access denied for contentEntryId: ${contentEntryId}, userId: ${userId}`,
          );
          return throwError(
            () =>
              new NotFoundException(
                'Content entry not found or you do not have permission to access it',
              ),
          );
        }

        return from(
          this.contentEntry.update({
            where: { id: BigInt(contentEntryId) },
            data: {
              questionsGenerated: true,
            },
          }),
        );
      }),
    );
  }

  /**
   * Generate quiz generation progress information for a specific content entry
   * Returns progress data matching the gRPC proto structure
   */
  generateQuizProgress(
    params: GenerateProgressParams,
  ): Observable<any> {
    const { contentEntryId, userId } = params;

    return from(
      this.contentEntry.findFirst({
        where: {
          id: BigInt(contentEntryId),
          contentBanks: {
            some: {
              contentBank: {
                userId,
              },
            },
          },
        },
        include: {
          questions: true,
        },
      }),
    ).pipe(
      switchMap((contentEntry) => {
        if (!contentEntry) {
          this.logger.error(
            `[generateQuizProgress] Content entry not found or access denied for contentEntryId: ${contentEntryId}, userId: ${userId}`,
          );
          return throwError(
            () =>
              new NotFoundException(
                'Content entry not found or you do not have permission to access it',
              ),
          );
        }
        return EMPTY;
      }),
    );
  }

  /**
   * Generate quiz generation progress information for a specific content entry
   * Returns progress data matching the gRPC proto structure
   */
  getQuestionsGenerated(params: {
    userId: string;
    contentBankId: number;
  }): Observable<number> {
    const { userId, contentBankId } = params;

    return from(
      this.contentBank.findFirst({
        where: {
          id: BigInt(contentBankId),
          userId,
        },
        include: {
          contentEntries: {
            include: {
              contentEntry: {
                include: {
                  questions: true,
                },
              },
            },
          },
        },
      }),
    ).pipe(
      switchMap((contentBank) => {
        if (!contentBank) {
          this.logger.error(
            `[generateQuizProgress] Content bank not found for contentBankId: ${contentBankId}`,
          );
          return throwError(
            () => new NotFoundException('Content bank not found'),
          );
        }

        let questionsGeneratedSoFar = 0;

        contentBank.contentEntries.forEach((entry) => {
          const entryQuestionCount = entry.contentEntry.questions.length;
          questionsGeneratedSoFar += entryQuestionCount;
        });

        return of(questionsGeneratedSoFar);
      }),
    );
  }
}
