import { Module } from '@nestjs/common';
import { QuizGeneratorService } from './quiz-generator.service';
import { QuizGeneratorController } from './quiz-generator.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { QUIZ_GENERATION_SERVICE } from '../config/services';

import { join } from 'path';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: QUIZ_GENERATION_SERVICE,
        transport: Transport.GRPC,
        options: {
          package: 'quiz_generation',
          protoPath: join(__dirname, '../../../../protos/quiz_generation.proto'),
          url: 'localhost:50051',
        },
      },
    ]),
  ],

  controllers: [QuizGeneratorController],
  providers: [QuizGeneratorService],
})
export class QuizGeneratorModule {}
