import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaClient } from 'generated/prisma/postgres';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { FindAllQuizzesDto } from './dto/find-all-quizzes.dto';
import { FindQuizResponsesDto } from './dto/find-quiz-responses.dto';
import {
  PaginatedQuizzesResponseDto,
  QuizDetailResponseDto,
  QuizSummaryResponseDto,
  PaginatedQuizResponsesDto,
  QuizResponseDto,
  QuizResponseItemDto,
} from './dto/quiz-response.dto';
import { Observable } from 'rxjs';

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
      id: Number(quiz.id),
      createdAt: quiz.createdAt,
      questionsCount: quiz.questionsCount,
      questionsCompleted: quiz.questionsCompleted,
      contentEntriesCount: quiz.contentEntriesCount,
      topics: quiz.quizTopics.map((topic) => topic.topicName),
    }));

    return {
      quizzes: formattedQuizzes,
      pagination: {
        page,
        limit,
        total,
      },
    };
  }

  async findOne(id: number, userId: string): Promise<QuizDetailResponseDto> {
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
      },
    });

    if (!quiz) {
      throw new NotFoundException(
        'Quiz not found or you do not have permission to access it',
      );
    }

    return {
      id: Number(quiz.id),
      createdAt: quiz.createdAt,
      questionsCompleted: quiz.questionsCompleted,
      contentEntriesCount: quiz.contentEntriesCount,
      topics: quiz.quizTopics.map((topic) => topic.topicName),
      totalQuestions: quiz.questionsCount,
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

  async create(
    createQuizDto: CreateQuizDto,
    userId: string,
  ): Promise<{ message: string; quizId: number }> {
    const { bankId } = createQuizDto;

    // Create a dummy quiz (as per the original implementation)
    const quiz = await this.quiz.create({
      data: {
        userId,
        bankId: BigInt(bankId),
        contentEntriesCount: 3,
        questionsCount: 3,
        questionsCompleted: 0,
        bankName: 'Dummy Quiz Bank',
      },
    });

    // Create dummy topics for the quiz
    const topics = ['JavaScript', 'Programming', 'Web Development'];
    await Promise.all(
      topics.map((topic) =>
        this.quizTopic.create({
          data: {
            quizId: quiz.id,
            topicName: topic,
          },
        }),
      ),
    );

    // Create dummy questions with options
    const questionsData = [
      {
        question:
          'What is the correct way to declare a variable in JavaScript?',
        contentEntryType: 'text',
        contentEntrySourceUrl:
          'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Grammar_and_types',
        options: [
          {
            optionText: 'var myVar = 5;',
            optionExplanation:
              'This is the traditional way to declare variables in JavaScript.',
            isCorrect: true,
          },
          {
            optionText: 'variable myVar = 5;',
            optionExplanation: 'This is not valid JavaScript syntax.',
            isCorrect: false,
          },
          {
            optionText: 'declare myVar = 5;',
            optionExplanation: 'This is not valid JavaScript syntax.',
            isCorrect: false,
          },
          {
            optionText: 'int myVar = 5;',
            optionExplanation: 'This is Java/C++ syntax, not JavaScript.',
            isCorrect: false,
          },
        ],
      },
      {
        question:
          'Which method is used to add an element to the end of an array?',
        contentEntryType: 'text',
        contentEntrySourceUrl:
          'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/push',
        options: [
          {
            optionText: 'array.push(element)',
            optionExplanation:
              'Correct! The push() method adds elements to the end of an array.',
            isCorrect: true,
          },
          {
            optionText: 'array.add(element)',
            optionExplanation: 'JavaScript arrays do not have an add() method.',
            isCorrect: false,
          },
          {
            optionText: 'array.append(element)',
            optionExplanation:
              'JavaScript arrays do not have an append() method.',
            isCorrect: false,
          },
          {
            optionText: 'array.insert(element)',
            optionExplanation:
              'JavaScript arrays do not have an insert() method.',
            isCorrect: false,
          },
        ],
      },
      {
        question: 'What does the "===" operator do in JavaScript?',
        contentEntryType: 'text',
        contentEntrySourceUrl:
          'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Strict_equality',
        options: [
          {
            optionText: 'Strict equality comparison',
            optionExplanation:
              'Correct! The === operator checks for strict equality without type coercion.',
            isCorrect: true,
          },
          {
            optionText: 'Assignment operator',
            optionExplanation: 'The assignment operator is =, not ===.',
            isCorrect: false,
          },
          {
            optionText: 'Loose equality comparison',
            optionExplanation: 'Loose equality comparison uses ==, not ===.',
            isCorrect: false,
          },
          {
            optionText: 'Greater than or equal',
            optionExplanation: 'Greater than or equal uses >=, not ===.',
            isCorrect: false,
          },
        ],
      },
    ];

    // Create questions and their options
    for (const questionData of questionsData) {
      const question = await this.quizQuestion.create({
        data: {
          question: questionData.question,
          type: 'multiple_choice',
          contentEntryType: questionData.contentEntryType,
          contentEntrySourceUrl: questionData.contentEntrySourceUrl,
          quizId: quiz.id,
        },
      });

      // Create options for this question
      await Promise.all(
        questionData.options.map((option) =>
          this.quizQuestionOption.create({
            data: {
              quizQuestionId: question.id,
              optionText: option.optionText,
              optionExplanation: option.optionExplanation,
              isCorrect: option.isCorrect,
            },
          }),
        ),
      );
    }

    return {
      message: 'Dummy quiz created successfully',
      quizId: Number(quiz.id),
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
}
