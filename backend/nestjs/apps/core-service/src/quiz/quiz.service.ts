import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaClient } from 'generated/prisma/postgres';
import { FindAllQuizzesDto } from './dto/find-all-quizzes.dto';
import { FindQuizResponsesDto } from './dto/find-quiz-responses.dto';
import {
  PaginatedQuizzesResponseDto,
  FindOneQuizResponse,
  QuizSummaryResponseDto,
  PaginatedQuizResponsesDto,
  QuizResponseDto,
  QuizResponseItemDto,
} from './dto/quiz-response.dto';
import { Observable, from, switchMap, map, throwError, of } from 'rxjs';

@Injectable()
export class QuizService extends PrismaClient {
  private readonly logger = new Logger(QuizService.name);

  constructor() {
    super();
  }

  async findAll(
    findAllDto: FindAllQuizzesDto,
  ): Promise<PaginatedQuizzesResponseDto> {
    const { page = 1, limit = 10, userId } = findAllDto;
    const skip = (page - 1) * limit;

    // Get total count
    const total = await this.quiz.count({
      where: { userId },
    });

    // Get quizzes with pagination
    const quizzes = await this.quiz.findMany({
      where: { userId },
      select: {
        id: true,
        bankName: true,
        createdAt: true,
        questionsCount: true,
        questionsCompleted: true,
        contentEntriesCount: true,
        quizTopics: {
          select: {
            topicName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    });

    const formattedQuizzes: QuizResponseDto[] = quizzes.map((quiz) => ({
      id: quiz.id.toString(),
      name: quiz.bankName,
      created_at: quiz.createdAt,
      questions_count: quiz.questionsCount,
      questions_completed: quiz.questionsCompleted,
      content_entries_count: quiz.contentEntriesCount,
      topics: quiz.quizTopics.map((topic) => topic.topicName),
    }));

    return {
      quizzes: formattedQuizzes,
      pagination: {
        page,
        limit,
        total,
        total_pages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number, userId: string): Promise<FindOneQuizResponse> {
    const quiz = await this.quiz.findFirst({
      where: {
        id: BigInt(id),
        userId,
      },
      select: {
        id: true,
        createdAt: true,
        questionsCompleted: true,
        contentEntriesCount: true,
        questionsCount: true,
        quizTopics: {
          select: {
            topicName: true,
          },
        },
        quizQuestions: {
          select: {
            id: true,
            question: true,
            contentEntryType: true,
            contentEntrySourceUrl: true,
            options: {
              select: {
                id: true,
                optionText: true,
              },
            },
          },
          orderBy: {
            id: 'asc',
          },
        },
      },
    });

    if (!quiz) {
      throw new NotFoundException(
        'Quiz not found or you do not have permission to access it',
      );
    }

    const currentQuestion = quiz.quizQuestions[quiz.questionsCompleted];

    return {
      id: quiz.id.toString(),
      created_at: quiz.createdAt,
      questions_completed: quiz.questionsCompleted,
      content_entries_count: quiz.contentEntriesCount,
      topics: quiz.quizTopics.map((topic) => topic.topicName),
      total_questions: quiz.questionsCount,
      question: currentQuestion
        ? {
            id: currentQuestion.id.toString(),
            question: currentQuestion.question,
            content_entry_type: currentQuestion.contentEntryType,
            content_entry_source_url:
              currentQuestion.contentEntrySourceUrl || '',
            options: currentQuestion.options.map((option) => ({
              id: option.id.toString(),
              option_text: option.optionText,
            })),
          }
        : null,
    };
  }

  async findQuizResponses(
    findResponsesDto: FindQuizResponsesDto,
  ): Promise<PaginatedQuizResponsesDto> {
    const { page = 1, limit = 10, quizId, userId } = findResponsesDto;
    const skip = (page - 1) * limit;

    // Verify quiz ownership
    const quiz = await this.quiz.findFirst({
      where: {
        id: BigInt(quizId),
        userId,
      },
    });

    if (!quiz) {
      throw new NotFoundException(
        'Quiz not found or you do not have permission to access it',
      );
    }

    // Get total count of responses
    const total = await this.quizQuestionResponse.count({
      where: { quizId: BigInt(quizId) },
    });

    // Get quiz responses with pagination
    const responses = await this.quizQuestionResponse.findMany({
      where: { quizId: BigInt(quizId) },
      select: {
        isCorrect: true,
        correctAnswer: true,
        quizQuestion: {
          select: {
            question: true,
            contentEntrySourceUrl: true,
          },
        },
        quizQuestionOption: {
          select: {
            optionText: true,
            optionExplanation: true,
          },
        },
      },
      skip,
      take: limit,
    });

    const formattedResponses: QuizResponseItemDto[] = responses.map(
      (response) => ({
        isCorrect: response.isCorrect,
        question: response.quizQuestion.question,
        answer: response.quizQuestionOption.optionText,
        correctAnswer: response.correctAnswer,
        explanation: response.quizQuestionOption.optionExplanation,
        sourceUrl: response.quizQuestion.contentEntrySourceUrl || '',
      }),
    );

    return {
      responses: formattedResponses,
      pagination: {
        page,
        limit,
        total,
      },
    };
  }

  async findQuizSummary(
    id: number,
    userId: string,
  ): Promise<QuizSummaryResponseDto> {
    const quiz = await this.quiz.findFirst({
      where: {
        id: BigInt(id),
        userId,
      },
      select: {
        questionsCount: true,
        quizTopics: {
          select: {
            topicName: true,
          },
        },
      },
    });

    if (!quiz) {
      throw new NotFoundException(
        'Quiz not found or you do not have permission to access it',
      );
    }

    // Get total correct answers count
    const totalCorrectAnswers = await this.quizQuestionResponse.count({
      where: {
        quizId: BigInt(id),
        isCorrect: true,
      },
    });

    return {
      topics: quiz.quizTopics.map((topic) => topic.topicName),
      totalQuestions: quiz.questionsCount,
      totalCorrectAnswers,
    };
  }

  async remove(id: number, userId: string): Promise<{ message: string }> {
    // Check if the quiz exists and belongs to the user
    const quiz = await this.quiz.findFirst({
      where: {
        id: BigInt(id),
        userId,
      },
    });

    if (!quiz) {
      throw new NotFoundException(
        'Quiz not found or you do not have permission to delete it',
      );
    }

    // Delete the quiz (cascade delete will handle related records)
    await this.quiz.delete({
      where: { id: BigInt(id) },
    });

    return { message: 'Quiz deleted successfully' };
  }

  /**
   * Create a quiz entity using the user_id and bank id, validate if the bank id has the same user id.
   * Create the QuizQuestions and QuizQuestionOption using the list of Question and Options of all the entries of the content Bank.
   * And finally update the Quiz entity contentEntriesCount and questionsCount
   */
  createQuiz(params: {
    userId: string;
    bankId: number;
  }): Observable<{ quizId: string }> {
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

            // Create a Map for quick lookup of content entries by ID
            const contentEntryMap = new Map(
              contentBank.contentEntries.map((entry) => [
                entry.contentEntry.id,
                entry.contentEntry,
              ]),
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
                  quizId: quiz.id.toString(),
                })),
              );
            }

            // Create quiz questions and options
            const createQuizQuestions = allQuestions.map(
              async (question, index) => {
                // Get the content entry for this question
                const contentEntry = contentEntryMap.get(
                  question.contentEntryId,
                );

                const quizQuestion = await this.quizQuestion.create({
                  data: {
                    question: question.question,
                    type: question.type,
                    contentEntryType: contentEntry?.contentType || 'text',
                    contentEntrySourceUrl: contentEntry?.sourceUrl || null,
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
                    quizId: quiz.id.toString(),
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
  createQuestion(params: {
    userId: string;
    contentEntryId: number;
    question: string;
    options: {
      optionText: string;
      optionExplanation: string;
      isCorrect: boolean;
    }[];
  }): Observable<{ message: string; questionId: number }> {
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

  async updateQuiz(params: {
    userId: string;
    quizId: number;
    questionOptionId: number;
  }): Promise<{ message: string; success: boolean }> {
    const { userId, quizId, questionOptionId } = params;

    // Validate if the quiz belongs to the user
    const quiz = await this.quiz.findFirst({
      where: {
        id: BigInt(quizId),
        userId,
      },
      select: {
        id: true,
        questionsCompleted: true,
        questionsCount: true,
        quizQuestions: {
          select: {
            id: true,
            options: {
              select: {
                id: true,
                isCorrect: true,
                optionText: true,
              },
            },
          },
          orderBy: {
            id: 'asc',
          },
        },
      },
    });

    if (!quiz) {
      throw new NotFoundException(
        'Quiz not found or you do not have permission to access it',
      );
    }

    // Check if quiz is already completed
    if (quiz.questionsCompleted >= quiz.questionsCount) {
      return {
        message: 'Quiz is already completed',
        success: false,
      };
    }

    // Get the current question (next question to answer)
    const currentQuestion = quiz.quizQuestions[quiz.questionsCompleted];

    if (!currentQuestion) {
      return {
        message: 'No more questions available',
        success: false,
      };
    }

    // Validate if the question_option_id exists in the current question's options
    const selectedOption = currentQuestion.options.find(
      (option) => option.id === BigInt(questionOptionId),
    );

    if (!selectedOption) {
      return {
        message: 'Invalid question option selected',
        success: false,
      };
    }

    // Find the correct answer for this question
    const correctOption = currentQuestion.options.find(
      (option) => option.isCorrect,
    );

    if (!correctOption) {
      this.logger.error(
        `No correct option found for question ${currentQuestion.id}`,
      );
      return {
        message: 'Question configuration error',
        success: false,
      };
    }

    // Create a new QuizQuestionResponse
    await this.quizQuestionResponse.create({
      data: {
        quizId: BigInt(quizId),
        quizQuestionId: currentQuestion.id,
        quizQuestionOptionId: BigInt(questionOptionId),
        isCorrect: selectedOption.isCorrect,
        correctAnswer: correctOption.optionText,
        responseTime: '0',
      },
    });

    // Step 5: Increment Quiz.questionsCompleted
    const updatedQuestionsCompleted = quiz.questionsCompleted + 1;
    const completedAt =
      updatedQuestionsCompleted >= quiz.questionsCount ? new Date() : null;

    await this.quiz.update({
      where: {
        id: BigInt(quizId),
      },
      data: {
        questionsCompleted: updatedQuestionsCompleted,
        completedAt,
      },
    });

    return {
      message: 'Quiz updated successfully',
      success: true,
    };
  }
}
