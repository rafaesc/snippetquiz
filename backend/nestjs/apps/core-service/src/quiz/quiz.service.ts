import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../commons/services';
import { FindAllQuizzesDto } from './dto/find-all-quizzes.dto';
import { FindQuizResponsesDto } from './dto/find-quiz-responses.dto';
import {
  PaginatedQuizzesResponseDto,
  FindOneQuizResponse,
  QuizSummaryResponseDto,
  PaginatedQuizResponsesDto,
  QuizResponseDto,
  QuizResponseItemDto,
  CheckQuizInProgressRequestDto,
  CheckQuizInProgressResponseDto,
  QuizInProgressDetailsDto,
} from './dto/quiz-response.dto';
import { Observable, from, switchMap, map, throwError, of } from 'rxjs';
import { UpdateQuizResponseDto } from './dto/update-quiz.dto';
import { ClientKafka } from '@nestjs/microservices';
import { KAFKA_SERVICE } from '../config/services';
import { GenerateQuizRequest } from '../content-entry/dto/quiz-generator.dto';
import { CreateQuizGenerationEventPayload } from './dto/create-quiz-generation-event.dto';

export enum QuizStatus {
  READY = 'READY',
  READY_WITH_ERROR = 'READY_WITH_ERROR',
  IN_PROGRESS = 'IN_PROGRESS',
}

function getFinalStatus(quiz: {
  status: string | null;
  questionUpdatedAt: Date | null;
}) {
  let finalStatus = quiz.status;
  if (quiz.status === QuizStatus.IN_PROGRESS && quiz.questionUpdatedAt) {
    const oneHourHalfAgo = new Date(Date.now() - 30 * 60 * 1000);
    if (quiz.questionUpdatedAt < oneHourHalfAgo) {
      finalStatus = QuizStatus.READY_WITH_ERROR;
    }
  }
  return finalStatus;
}

@Injectable()
export class QuizService {
  private readonly logger = new Logger(QuizService.name);

  constructor(
    private readonly prisma: PrismaService,
    @Inject(KAFKA_SERVICE) private kafkaClient: ClientKafka,
  ) {}

  async findAll(
    findAllDto: FindAllQuizzesDto,
  ): Promise<PaginatedQuizzesResponseDto> {
    const { page = 1, limit = 10, userId } = findAllDto;
    const skip = (page - 1) * limit;

    // Get total count
    const total = await this.prisma.quiz.count({
      where: { userId },
    });

    // Get quizzes with pagination
    const quizzes = await this.prisma.quiz.findMany({
      where: { userId },
      select: {
        id: true,
        bankName: true,
        createdAt: true,
        questionsCount: true,
        questionsCompleted: true,
        status: true,
        questionUpdatedAt: true,
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

    const formattedQuizzes: QuizResponseDto[] = quizzes.map((quiz) => {
      return {
        id: quiz.id.toString(),
        name: quiz.bankName,
        created_at: quiz.createdAt,
        questions_count: quiz.questionsCount,
        questions_completed: quiz.questionsCompleted,
        status: getFinalStatus(quiz),
        content_entries_count: quiz.contentEntriesCount,
        topics: quiz.quizTopics.map((topic) => topic.topicName),
      };
    });

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
    const quiz = await this.prisma.quiz.findFirst({
      where: {
        id: BigInt(id),
        userId,
      },
      select: {
        id: true,
        createdAt: true,
        questionsCompleted: true,
        contentEntriesCount: true,
        status: true,
        questionUpdatedAt: true,
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
      status: getFinalStatus(quiz),
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
    const quiz = await this.prisma.quiz.findFirst({
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
    const total = await this.prisma.quizQuestionResponse.count({
      where: { quizId: BigInt(quizId) },
    });

    // Get quiz responses with pagination
    const responses = await this.prisma.quizQuestionResponse.findMany({
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
        is_correct: response.isCorrect,
        question: response.quizQuestion.question,
        answer: response.quizQuestionOption.optionText,
        correct_answer: response.correctAnswer,
        explanation: response.quizQuestionOption.optionExplanation,
        source_url: response.quizQuestion.contentEntrySourceUrl || '',
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
    const quiz = await this.prisma.quiz.findFirst({
      where: {
        id: BigInt(id),
        userId,
      },
      select: {
        status: true,
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
    const totalCorrectAnswers = await this.prisma.quizQuestionResponse.count({
      where: {
        quizId: BigInt(id),
        isCorrect: true,
      },
    });

    return {
      topics: quiz.quizTopics.map((topic) => topic.topicName),
      total_questions: quiz.questionsCount,
      total_correct_answers: totalCorrectAnswers,
    };
  }

  async remove(id: number, userId: string): Promise<{ message: string }> {
    // Check if the quiz exists and belongs to the user
    const quiz = await this.prisma.quiz.findFirst({
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
    await this.prisma.quiz.delete({
      where: { id: BigInt(id) },
    });

    return { message: 'Quiz deleted successfully' };
  }

  createQuiz(params: {
    quizId?: string;
    userId: string;
    bankId: number;
    status: QuizStatus;
  }): Observable<{ quiz_id: string }> {
    const { userId, bankId, status } = params;

    return from(
      this.prisma.contentBank.findFirst({
        where: {
          id: BigInt(bankId),
          userId,
        },
        include: {
          contentEntries: {
            include: {
              contentEntry: {
                include: {
                  topics: {
                    include: {
                      topic: true,
                    },
                  },
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

        return from(
          (async () => {
            if (params.quizId) {
              await this.prisma.quiz.update({
                where: {
                  id: BigInt(params.quizId),
                  userId,
                },
                data: {
                  status,
                  questionUpdatedAt: new Date(),
                },
                select: {
                  id: true,
                },
              });

              return await this.prisma.quiz.findFirst({
                where: {
                  id: BigInt(params.quizId),
                  userId,
                },
                select: {
                  id: true,
                },
              });
            }
            return await this.prisma.quiz.create({
              data: {
                userId,
                bankId: BigInt(bankId),
                bankName: contentBank.name,
                contentEntriesCount: 0,
                questionsCount: 0,
                questionsCompleted: 0,
                status,
              },
            });
          })(),
        ).pipe(
          switchMap((quiz) => {
            if (!quiz) {
              return throwError(
                () =>
                  new NotFoundException(
                    'Quiz not found or you do not have permission to access it',
                  ),
              );
            }
            // Collect all questions from all content entries
            const allQuestions = contentBank.contentEntries.flatMap(
              (entry) => entry.contentEntry.questions,
            );
            // Collect all questions from all content entries
            const allTopics = contentBank.contentEntries.flatMap((entry) =>
              entry.contentEntry.topics.map((topic) => topic.topic.topic),
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
                this.prisma.quiz.update({
                  where: { id: quiz.id },
                  data: {
                    contentEntriesCount: contentBank.contentEntries.length,
                    questionsCount: 0,
                  },
                }),
              ).pipe(
                map(() => ({
                  quiz_id: quiz.id.toString(),
                })),
              );
            }

            // Create quiz questions and options
            const createQuizQuestions = allQuestions.map(async (question) => {
              // Get the content entry for this question
              const contentEntry = contentEntryMap.get(question.contentEntryId);

              const quizQuestion = await this.prisma.quizQuestion.create({
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
                  return this.prisma.quizQuestionOption.create({
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
            });

            return from(Promise.all(createQuizQuestions)).pipe(
              switchMap((createdQuestions) => {
                // Create quiz topics using upsert
                const uniqueTopics = [...new Set(allTopics)];
                const createQuizTopics = uniqueTopics.map(async (topicName) => {
                  return this.prisma.quizTopic.upsert({
                    where: {
                      quizId_topicName: {
                        quizId: quiz.id,
                        topicName: topicName,
                      },
                    },
                    update: {},
                    create: {
                      quizId: quiz.id,
                      topicName: topicName,
                    },
                  });
                });

                // Execute topic creation in parallel with quiz update
                this.logger.log(
                  `[createQuiz] Creating ${createdQuestions.length} questions for quiz ${quiz.id}`,
                );
                return from(Promise.all(createQuizTopics)).pipe(
                  switchMap(() => {
                    // Update quiz with counts
                    return from(
                      this.prisma.quiz.update({
                        where: { id: quiz.id },
                        data: {
                          contentEntriesCount:
                            contentBank.contentEntries.length,
                          questionsCount: createdQuestions.length,
                        },
                      }),
                    ).pipe(
                      map(() => ({
                        quiz_id: quiz.id.toString(),
                      })),
                    );
                  }),
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
      this.prisma.contentEntry.findFirst({
        select: {
          questionsGenerated: true,
        },
        where: {
          id: BigInt(contentEntryId),
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
          this.prisma.question.create({
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
              return this.prisma.questionOption.create({
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
      this.prisma.contentBank.findFirst({
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
  }): Promise<UpdateQuizResponseDto> {
    const { userId, quizId, questionOptionId } = params;

    // Validate if the quiz belongs to the user
    const quiz = await this.prisma.quiz.findFirst({
      where: {
        id: BigInt(quizId),
        userId,
      },
      select: {
        id: true,
        status: true,
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
    await this.prisma.quizQuestionResponse.create({
      data: {
        quizId: BigInt(quizId),
        quizQuestionId: currentQuestion.id,
        quizQuestionOptionId: BigInt(questionOptionId),
        isCorrect: selectedOption.isCorrect,
        correctAnswer: correctOption.optionText,
        responseTime: '0',
      },
    });

    // Increment Quiz.questionsCompleted
    const updatedQuestionsCompleted = quiz.questionsCompleted + 1;
    const isCompleted = updatedQuestionsCompleted >= quiz.questionsCount  && quiz.status === QuizStatus.READY;
    const completedAt = isCompleted ? new Date() : null;

    await this.prisma.quiz.update({
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
      completed: isCompleted,
    };
  }

  // Add the migrated method
  async getContentEntriesByBankId(
    bankId: number,
    userId: string,
  ): Promise<{ request: GenerateQuizRequest; entriesSkipped: number }> {
    try {
      const contentBank = await this.prisma.contentBank.findFirst({
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

      const contentEntries = await this.prisma.contentEntry.findMany({
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
          continue;
        }
        mappedEntries.push({
          id: Number(entry.id),
          pageTitle: entry.pageTitle || '',
          content: entry.content || '',
          wordCountAnalyzed: entry.wordCount || 0,
        });
      }

      const instruction = await this.prisma.quizGenerationInstruction.findFirst(
        {
          where: {
            userId,
          },
        },
      );

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

  async emitCreateQuizEvent(
    quizId: string,
    bankId: number,
    userId: string,
  ): Promise<{ message: string; entriesSkipped: number }> {
    try {
      const { request: quizRequest, entriesSkipped } =
        await this.getContentEntriesByBankId(bankId, userId);

      const payload: CreateQuizGenerationEventPayload = {
        instructions: quizRequest.instructions,
        contentEntries: quizRequest.contentEntries,
        entriesSkipped,
        userId: userId,
        quizId: quizId,
        bankId: bankId,
      };

      this.kafkaClient.emit('create-quiz', {
        key: `user-${userId}`,
        value: payload,
      });

      this.logger.log(
        `Emitted create-quiz events for ${quizRequest.contentEntries.length} content entries from bank ${bankId}`,
      );

      return {
        message: `Successfully emitted ${quizRequest.contentEntries.length} create-quiz events`,
        entriesSkipped,
      };
    } catch (error) {
      this.logger.error(
        `Failed to emit create-quiz events for bankId: ${bankId}`,
        error,
      );
      throw error;
    }
  }

  /**
   * Update the questionUpdatedAt timestamp for a quiz
   */
  async updateQuizDate(
    quizId: number,
  ): Promise<{ message: string; success: boolean }> {
    try {
      const updatedQuiz = await this.prisma.quiz.update({
        where: {
          id: BigInt(quizId),
        },
        data: {
          questionUpdatedAt: new Date(),
        },
        select: {
          id: true,
          questionUpdatedAt: true,
        },
      });

      this.logger.log(
        `Quiz ${quizId} questionUpdatedAt updated to ${updatedQuiz.questionUpdatedAt}`,
      );

      return {
        message: 'Quiz date updated successfully',
        success: true,
      };
    } catch (error) {
      this.logger.error(
        `Failed to update quiz date for quizId: ${quizId}`,
        error,
      );
      return {
        message: 'Failed to update quiz date',
        success: false,
      };
    }
  }

  checkQuizInProgress(
    request: CheckQuizInProgressRequestDto,
  ): Observable<CheckQuizInProgressResponseDto> {
    const { user_id } = request;

    return from(
      this.prisma.quiz.findMany({
        where: {
          userId: user_id,
          status: QuizStatus.IN_PROGRESS,
        },
        select: {
          id: true,
          bankId: true,
          bankName: true,
          status: true,
          questionUpdatedAt: true,
        },
      })
    ).pipe(
      switchMap(async (inProgressQuizzes) => {
        if (inProgressQuizzes.length === 0) {
          return {
            in_progress: false,
          };
        }

        let inProgressQuiz: QuizInProgressDetailsDto | null = null;

        for (const quiz of inProgressQuizzes) {
          const finalStatus = getFinalStatus(quiz);

          if (finalStatus === QuizStatus.IN_PROGRESS) {
            inProgressQuiz = {
              quiz_id: quiz.id.toString(),
              bank_id: quiz.bankId?.toString(),
              name: quiz.bankName,
            };
          }

          if (finalStatus === QuizStatus.READY_WITH_ERROR) {
            await this.prisma.quiz.update({
              where: { id: quiz.id },
              data: { status: QuizStatus.READY_WITH_ERROR },
            });
          }
        }

        return {
          in_progress: inProgressQuiz !== null,
          details: inProgressQuiz,
        };
      })
    );
  }
}
