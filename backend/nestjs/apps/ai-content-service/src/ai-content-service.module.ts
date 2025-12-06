import { Module } from '@nestjs/common';
import { ContentEntryModule } from './content-entry/content-entry.module';
import { QuizModule } from './quiz/quiz.module';
import { UserModule } from './user/user.module';
import { CharacterModule } from './character/character.module';
import { HealthModule } from 'apps/commons/health/health.module';

@Module({
  imports: [ContentEntryModule, QuizModule, UserModule, CharacterModule, HealthModule],
  controllers: [],
  providers: [],
})
export class AiContentServiceModule { }
