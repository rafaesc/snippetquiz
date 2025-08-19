import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ContentBankController } from './content-bank.controller';
import { CORE_SERVICE } from '../config/services';
import { envs } from '../config/envs';
import { ContentEntryController } from './content-entry.controller';
import { InstructionsController } from './instructions.controller';
import { QuizController } from './quiz.controller';
import { join } from 'path';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: CORE_SERVICE,
        transport: Transport.GRPC,
        options: {
          package: ['content_bank', 'content_entry', 'quiz', 'instructions'],
          protoPath: [
            join(__dirname, '../../../../protos/content-bank/content-bank.proto'),
            join(__dirname, '../../../../protos/content-entry/content-entry.proto'),
            join(__dirname, '../../../../protos/quiz/quiz.proto'),
            join(__dirname, '../../../../protos/instructions/instructions.proto'),
          ],
          url: `${envs.coreServiceHost}:${envs.coreServicePort}`,
        },
      },
    ]),
  ],
  controllers: [
    ContentBankController,
    ContentEntryController,
    InstructionsController,
    QuizController,
  ],
  providers: [],
})
export class CoreServiceModule {}
