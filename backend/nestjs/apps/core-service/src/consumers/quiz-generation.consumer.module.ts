import { Module } from '@nestjs/common';
import { QuizGenerationConsumer } from './quiz-generation.consumer';
import { ContentEntryModule } from '../content-entry/content-entry.module';
import { QuizModule } from '../quiz/quiz.module';

@Module({
  imports: [
    ContentEntryModule,
    QuizModule,
  ],
  controllers: [QuizGenerationConsumer],
  providers: [],
  exports: [],
})
export class QuizGenerationConsumerModule {}