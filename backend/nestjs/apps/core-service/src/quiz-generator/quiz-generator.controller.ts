import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import {
  GrpcStreamMethod,
  GrpcStreamCall,
  GrpcMethod,
} from '@nestjs/microservices';
import { QuizGeneratorService } from './quiz-generator.service';
import { map, Observable, Subject } from 'rxjs';
import { Logger } from '@nestjs/common';
import { StreamQuizGeneratorDto } from './dto/stream-quiz-generator.dto';

interface GenerateQuizByBankRequest {
  bank_id: number;
}

@Controller()
export class QuizGeneratorController {
  private readonly logger = new Logger(QuizGeneratorController.name);

  constructor(private readonly quizGeneratorService: QuizGeneratorService) {}

  @GrpcMethod('CoreQuizGenerationService', 'GenerateQuizByBank')
  generateQuiz(request: GenerateQuizByBankRequest): Observable<any> {
    this.logger.log(`generateQuiz called with bank_id=${request.bank_id}`);


    return this.quizGeneratorService.generateQuizStream(request.bank_id);
  }
}
