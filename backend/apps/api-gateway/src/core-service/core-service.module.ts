import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { CoreServiceService } from './core-service.service';
import { ContentBankController } from './content-bank.controller';
import { CORE_SERVICE } from '../config/services';
import { envs } from '../config/envs';
import { ContentEntryController } from './content-entry.controller';
import { InstructionsController } from './instructions.controller';
import { QuizController } from './quiz.controller';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: CORE_SERVICE,
        transport: Transport.TCP,
        options: {
          host: envs.coreServiceHost,
          port: envs.coreServicePort,
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
  providers: [CoreServiceService],
})
export class CoreServiceModule {}
