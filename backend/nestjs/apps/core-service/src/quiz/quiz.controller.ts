import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { QuizService } from './quiz.service';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { FindAllQuizzesDto } from './dto/find-all-quizzes.dto';
import { FindQuizResponsesDto } from './dto/find-quiz-responses.dto';

@Controller()
export class QuizController {
  constructor(private readonly quizService: QuizService) {}

  @GrpcMethod('QuizService', 'FindAllQuizzes')
  findAll(data: { page?: number; limit?: number; user_id: string }) {
    const findAllDto: FindAllQuizzesDto = {
      page: data.page,
      limit: data.limit,
      userId: data.user_id,
    };
    return this.quizService.findAll(findAllDto);
  }

  @GrpcMethod('QuizService', 'FindOneQuiz')
  findOne(data: { id: number; user_id: string }) {
    return this.quizService.findOne(data.id, data.user_id);
  }

  @GrpcMethod('QuizService', 'FindQuizResponses')
  findQuizResponses(data: { page?: number; limit?: number; quiz_id: string; user_id: string }) {
    const findResponsesDto: FindQuizResponsesDto = {
      page: data.page,
      limit: data.limit,
      quizId: Number(data.quiz_id),
      userId: data.user_id,
    };
    return this.quizService.findQuizResponses(findResponsesDto);
  }

  @GrpcMethod('QuizService', 'FindQuizSummary')
  findQuizSummary(data: { id: number; user_id: string }) {
    return this.quizService.findQuizSummary(data.id, data.user_id);
  }

  @GrpcMethod('QuizService', 'CreateQuiz')
  create(data: { bank_id: number; user_id: string }) {
    const createQuizDto: CreateQuizDto = {
      bankId: data.bank_id,
    };
    return this.quizService.create(createQuizDto, data.user_id);
  }

  @GrpcMethod('QuizService', 'RemoveQuiz')
  remove(data: { id: number; user_id: string }) {
    return this.quizService.remove(data.id, data.user_id);
  }
}
