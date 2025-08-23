import { Module } from '@nestjs/common';
import { QuizGeneratorService } from './quiz-generator.service';
import { QuizGeneratorController } from './quiz-generator.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AI_GENERATION_SERVICE } from '../config/services';

import { join } from 'path';
import { QuizModule } from '../quiz/quiz.module';
import { QuizService } from '../quiz/quiz.service';
import { ContentEntryModule } from '../content-entry/content-entry.module';
import { ContentEntryService } from '../content-entry/content-entry.service';
import { envs } from '../config/envs';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: AI_GENERATION_SERVICE,
        transport: Transport.GRPC,
        options: {
          package: 'ai_generation',
          protoPath: join(
            __dirname,
            '../../../../protos/ai_generation.proto',
          ),
          url: `${envs.aiGenerationServiceHost}:${envs.aiGenerationServicePort}`,
        },
      },
    ]),
    QuizModule,
    ContentEntryModule,
  ],
  controllers: [QuizGeneratorController],
  providers: [QuizGeneratorService, QuizService, ContentEntryService],
})
export class QuizGeneratorModule {}
