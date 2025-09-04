import { Module } from '@nestjs/common';
import { QuizGeneratorService } from './quiz-generator.service';
import { QuizGeneratorController } from './quiz-generator.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AI_GENERATION_SERVICE } from '../config/services';
import { PrismaModule } from '../../../commons/services';

import { join } from 'path';
import { QuizModule } from '../quiz/quiz.module';
import { QuizService } from '../quiz/quiz.service';
import { ContentEntryModule } from '../content-entry/content-entry.module';
import { ContentEntryService } from '../content-entry/content-entry.service';
import { envs } from '../config/envs';
import { KAFKA_SERVICE } from '../config/services';

@Module({
  imports: [
    PrismaModule,
    ClientsModule.register([
      {
        name: AI_GENERATION_SERVICE,
        transport: Transport.GRPC,
        options: {
          package: 'ai_generation',
          protoPath: join(__dirname, '../../../../protos/ai_generation.proto'),
          url: `${envs.aiGenerationServiceHost}:${envs.aiGenerationServicePort}`,
        },
      },
      {
        name: KAFKA_SERVICE,
        transport: Transport.KAFKA,
        options: {
          client: {
            brokers: [`${envs.kafkaHost}:${envs.kafkaPort}`],
          },
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
