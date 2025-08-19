import { Module } from '@nestjs/common';
import { QuizService } from './quiz.service';
import { QuizController } from './quiz.controller';
import { QuizObservableService } from './quiz.observable.service';

@Module({
  controllers: [QuizController],
  providers: [QuizService, QuizObservableService],
  exports: [QuizService, QuizObservableService],
})
export class QuizModule {}
