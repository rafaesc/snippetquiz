import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { QuizService } from './quiz.service';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { FindAllQuizzesDto } from './dto/find-all-quizzes.dto';
import { FindQuizResponsesDto } from './dto/find-quiz-responses.dto';

@Controller()
export class QuizController {
  constructor(private readonly quizService: QuizService) {}

  @MessagePattern('quiz.findAll')
  findAll(@Payload() findAllDto: FindAllQuizzesDto) {
    return this.quizService.findAll(findAllDto);
  }

  @MessagePattern('quiz.findOne')
  findOne(@Payload() payload: { id: number; userId: string }) {
    return this.quizService.findOne(payload.id, payload.userId);
  }

  @MessagePattern('quiz.findResponses')
  findQuizResponses(@Payload() findResponsesDto: FindQuizResponsesDto) {
    return this.quizService.findQuizResponses(findResponsesDto);
  }

  @MessagePattern('quiz.findSummary')
  findQuizSummary(@Payload() payload: { id: number; userId: string }) {
    return this.quizService.findQuizSummary(payload.id, payload.userId);
  }

  @MessagePattern('quiz.create')
  create(@Payload() payload: { createQuizDto: CreateQuizDto; userId: string }) {
    return this.quizService.create(payload.createQuizDto, payload.userId);
  }

  @MessagePattern('quiz.remove')
  remove(@Payload() payload: { id: number; userId: string }) {
    return this.quizService.remove(payload.id, payload.userId);
  }
}
