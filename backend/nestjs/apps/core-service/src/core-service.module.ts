import { Module } from '@nestjs/common';
import { ContentBankModule } from './content-bank/content-bank.module';
import { ContentEntryModule } from './content-entry/content-entry.module';
import { InstructionsModule } from './instructions/instructions.module';
import { QuizModule } from './quiz/quiz.module';
import { QuizGeneratorModule } from './quiz-generator/quiz-generator.module';

@Module({
  imports: [
    ContentBankModule,
    ContentEntryModule,
    InstructionsModule,
    QuizModule,
    QuizGeneratorModule,
  ],
  controllers: [],
  providers: [],
})
export class CoreServiceModule {}
