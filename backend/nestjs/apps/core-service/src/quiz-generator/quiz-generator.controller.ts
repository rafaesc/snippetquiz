import { Controller, Get } from '@nestjs/common';
import { QuizGeneratorService } from './quiz-generator.service';
import { Observable } from 'rxjs';

@Controller('quiz-generator')
export class QuizGeneratorController {
  constructor(private readonly quizGeneratorServiceService: QuizGeneratorService) {}

  @Get('hello')
  getHello() {
    return { message: 'hello world' };
  }

  @Get('books')
  getBooks(): Observable<any> {
    return this.quizGeneratorServiceService.getBooks();
  }
}
