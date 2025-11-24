import { Module } from '@nestjs/common';
import { ContentEntryModule } from './content-entry/content-entry.module';
import { QuizModule } from './quiz/quiz.module';

@Module({
  imports: [ContentEntryModule, QuizModule],
  controllers: [],
  providers: [],
})
export class AiProcessorModule { }
