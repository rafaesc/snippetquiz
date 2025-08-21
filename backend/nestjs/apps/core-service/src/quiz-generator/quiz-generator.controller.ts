import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { QuizGeneratorService } from './quiz-generator.service';
import { Observable } from 'rxjs';
import { Logger } from '@nestjs/common';
import { QuizGenerationProgressDto } from './dto/core-quiz-generation.dto';

interface GenerateQuizByBankRequest {
  bank_id: number;
  user_id: string;
}

@Controller()
export class QuizGeneratorController {
  private readonly logger = new Logger(QuizGeneratorController.name);

  constructor(private readonly quizGeneratorService: QuizGeneratorService) {}

  @GrpcMethod('CoreQuizGenerationService', 'GenerateQuizByBank')
  generateQuiz(
    request: GenerateQuizByBankRequest,
  ): Observable<QuizGenerationProgressDto> {
    this.logger.log(`generateQuiz called with bank_id=${request.bank_id}`);

    return this.quizGeneratorService.generateQuizStream(request.bank_id, request.user_id);
  }
}
