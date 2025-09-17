import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { HttpModule } from '@nestjs/axios';
import { CORE_SERVICE } from '../config/services';
import { envs } from '../config/envs';
import { CoreController } from './core.controller';
import { CoreServiceProxyService } from './core-service-proxy.service';
import { join } from 'path';


@Module({
  imports: [
    HttpModule,
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
    CoreController
  ],
  providers: [
    CoreServiceProxyService,
  ],
  exports: [CoreServiceProxyService],
})
export class CoreServiceModule {}
