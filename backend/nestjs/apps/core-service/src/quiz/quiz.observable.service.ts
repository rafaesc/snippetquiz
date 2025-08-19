import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaClient } from 'generated/prisma/postgres';
import { Observable, from, switchMap, map, throwError, tap } from 'rxjs';

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
  createQuiz(params: CreateQuizParams): Observable<{ message: string; quizId: number }> {
    const { userId, bankId } = params;
    
    this.logger.log(`[createQuiz] Starting quiz creation for userId: ${userId}, bankId: ${bankId}`);

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
      })
    ).pipe(
      tap(() => this.logger.log(`[createQuiz] Content bank query executed for bankId: ${bankId}`)),
      switchMap((contentBank) => {
        if (!contentBank) {
          this.logger.error(`[createQuiz] Content bank not found for bankId: ${bankId}, userId: ${userId}`);
          return throwError(() => new NotFoundException('Content bank not found or you do not have permission to access it'));
        }

        this.logger.log(`[createQuiz] Found content bank: ${contentBank.name} with ${contentBank.contentEntries.length} entries`);

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
          })
        ).pipe(
          tap((quiz) => this.logger.log(`[createQuiz] Quiz entity created with ID: ${quiz.id}`)),
          switchMap((quiz) => {
            // Collect all questions from all content entries
            const allQuestions = contentBank.contentEntries.flatMap(
              (entry) => entry.contentEntry.questions
            );

            this.logger.log(`[createQuiz] Found ${allQuestions.length} total questions across all content entries`);

            if (allQuestions.length === 0) {
              this.logger.warn(`[createQuiz] No questions found, updating quiz with zero counts`);
              return from(
                this.quiz.update({
                  where: { id: quiz.id },
                  data: {
                    contentEntriesCount: contentBank.contentEntries.length,
                    questionsCount: 0,
                  },
                })
              ).pipe(
                tap(() => this.logger.log(`[createQuiz] Quiz updated with zero questions for quizId: ${quiz.id}`)),
                map(() => ({
                  message: 'Quiz created successfully with no questions',
                  quizId: Number(quiz.id),
                }))
              );
            }

            this.logger.log(`[createQuiz] Starting creation of ${allQuestions.length} quiz questions`);

            // Create quiz questions and options
            const createQuizQuestions = allQuestions.map(async (question, index) => {
              this.logger.log(`[createQuiz] Creating quiz question ${index + 1}/${allQuestions.length} for contentEntryId: ${question.contentEntryId}`);
              
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

              this.logger.log(`[createQuiz] Quiz question created with ID: ${quizQuestion.id}, creating ${question.options.length} options`);

              // Create quiz question options
              await Promise.all(
                question.options.map(async (option, optionIndex) => {
                  this.logger.debug(`[createQuiz] Creating option ${optionIndex + 1}/${question.options.length} for questionId: ${quizQuestion.id}`);
                  return this.quizQuestionOption.create({
                    data: {
                      quizQuestionId: quizQuestion.id,
                      optionText: option.optionText,
                      optionExplanation: option.optionExplanation,
                      isCorrect: option.isCorrect,
                    },
                  });
                })
              );

              this.logger.log(`[createQuiz] Completed quiz question ${index + 1}/${allQuestions.length} with all options`);
              return quizQuestion;
            });

            return from(Promise.all(createQuizQuestions)).pipe(
              tap((createdQuestions) => this.logger.log(`[createQuiz] All ${createdQuestions.length} quiz questions created successfully`)),
              switchMap((createdQuestions) => {
                this.logger.log(`[createQuiz] Updating quiz counts: contentEntries=${contentBank.contentEntries.length}, questions=${createdQuestions.length}`);
                
                // Update quiz with counts
                return from(
                  this.quiz.update({
                    where: { id: quiz.id },
                    data: {
                      contentEntriesCount: contentBank.contentEntries.length,
                      questionsCount: createdQuestions.length,
                    },
                  })
                ).pipe(
                  tap(() => this.logger.log(`[createQuiz] Quiz counts updated successfully for quizId: ${quiz.id}`)),
                  map(() => ({
                    message: 'Quiz created successfully',
                    quizId: Number(quiz.id),
                  }))
                );
              })
            );
          })
        );
      })
    );
  }

  /**
   * Create Question, should receive a list of options and a single question,
   * using content entry id, and user_id, (content entry id should have the same user_id.),
   * should create the question and the question options in the same method,
   * for the question the type column would be hardcoded in the code.
   */
  createQuestion(params: CreateQuestionParams): Observable<{ message: string; questionId: number }> {
    const { userId, contentEntryId, question, options } = params;
    
    this.logger.log(`[createQuestion] Starting question creation for userId: ${userId}, contentEntryId: ${contentEntryId}`);
    this.logger.log(`[createQuestion] Question text: "${question.substring(0, 100)}${question.length > 100 ? '...' : ''}"`);
    this.logger.log(`[createQuestion] Number of options: ${options?.length || 0}`);

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
      })
    ).pipe(
      tap(() => this.logger.log(`[createQuestion] Content entry validation query executed for contentEntryId: ${contentEntryId}`)),
      switchMap((contentEntry) => {
        if (!contentEntry) {
          this.logger.error(`[createQuestion] Content entry not found or access denied for contentEntryId: ${contentEntryId}, userId: ${userId}`);
          return throwError(() => new NotFoundException('Content entry not found or you do not have permission to access it'));
        }

        this.logger.log(`[createQuestion] Content entry validation passed for contentEntryId: ${contentEntryId}`);

        if (!options || options.length === 0) {
          this.logger.error(`[createQuestion] No options provided for question`);
          return throwError(() => new BadRequestException('At least one option is required'));
        }

        this.logger.log(`[createQuestion] Creating question with type: 'multiple_choice'`);

        // Create the question with hardcoded type
        return from(
          this.question.create({
            data: {
              question,
              type: 'multiple_choice', // Hardcoded as requested
              contentEntryId: BigInt(contentEntryId),
            },
          })
        ).pipe(
          tap((createdQuestion) => this.logger.log(`[createQuestion] Question created with ID: ${createdQuestion.id}`)),
          switchMap((createdQuestion) => {
            this.logger.log(`[createQuestion] Creating ${options.length} question options for questionId: ${createdQuestion.id}`);
            
            // Create question options
            const createOptions = options.map((option, index) => {
              this.logger.debug(`[createQuestion] Creating option ${index + 1}/${options.length}: "${option.optionText.substring(0, 50)}${option.optionText.length > 50 ? '...' : ''}" (correct: ${option.isCorrect})`);
              
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
              tap((createdOptions) => this.logger.log(`[createQuestion] All ${createdOptions.length} options created successfully for questionId: ${createdQuestion.id}`)),
              map(() => ({
                message: 'Question created successfully',
                questionId: Number(createdQuestion.id),
              }))
            );
          })
        );
      })
    );
  }

  /**
   * Update a Content Entry, using a content entry id, and user id,
   * to enable the column questions_generated to true.
   */
  updateContentEntry(params: UpdateContentEntryParams): Observable<{ message: string }> {
    const { userId, contentEntryId } = params;
    
    this.logger.log(`[updateContentEntry] Starting content entry update for userId: ${userId}, contentEntryId: ${contentEntryId}`);

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
      })
    ).pipe(
      tap(() => this.logger.log(`[updateContentEntry] Content entry validation query executed for contentEntryId: ${contentEntryId}`)),
      switchMap((contentEntry) => {
        if (!contentEntry) {
          this.logger.error(`[updateContentEntry] Content entry not found or access denied for contentEntryId: ${contentEntryId}, userId: ${userId}`);
          return throwError(() => new NotFoundException('Content entry not found or you do not have permission to access it'));
        }

        this.logger.log(`[updateContentEntry] Content entry validation passed, updating questionsGenerated to true`);

        return from(
          this.contentEntry.update({
            where: { id: BigInt(contentEntryId) },
            data: {
              questionsGenerated: true,
            },
          })
        ).pipe(
          tap(() => this.logger.log(`[updateContentEntry] Content entry ${contentEntryId} updated successfully - questionsGenerated set to true`)),
          map(() => ({
            message: 'Content entry updated successfully',
          }))
        );
      })
    );
  }
}