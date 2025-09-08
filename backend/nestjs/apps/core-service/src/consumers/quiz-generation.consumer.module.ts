import { Module } from '@nestjs/common';
import { QuizGenerationConsumer } from './quiz-generation.consumer';
import { ContentEntryModule } from '../content-entry/content-entry.module';
import { QuizModule } from '../quiz/quiz.module';
import { RedisModule } from 'apps/commons';

@Module({
  imports: [
    ContentEntryModule,
    QuizModule,
    RedisModule
  ],
  controllers: [QuizGenerationConsumer],
  providers: [],
  exports: [],
})
export class QuizGenerationConsumerModule {}