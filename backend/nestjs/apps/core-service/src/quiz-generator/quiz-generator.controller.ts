import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { QuizGeneratorService } from './quiz-generator.service';
import { Observable } from 'rxjs';
import { Logger } from '@nestjs/common';
import { CoreQuizGenerationStatus } from './dto/core-quiz-generation.dto';

interface GenerateQuizByBankRequest {
  user_id: string;
}

@Controller()
export class QuizGeneratorController {
  private readonly logger = new Logger(QuizGeneratorController.name);

  constructor(private readonly quizGeneratorService: QuizGeneratorService) {}

  @GrpcMethod('CoreQuizGenerationService', 'GenerateQuizByBank')
  generateQuiz(
    request: GenerateQuizByBankRequest,
  ): Observable<CoreQuizGenerationStatus> {
    this.logger.log(`generateQuiz called with user_id=${request.user_id}`);

    return this.quizGeneratorService.consumeAsObservable(
      'quiz-generation',
      request.user_id,
    );
  }
}
