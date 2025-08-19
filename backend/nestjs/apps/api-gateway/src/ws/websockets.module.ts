import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { WebsocketGateway } from './websocket.gateway';
import { CORE_SERVICE } from '../config/services';
import { join } from 'path';
import { envs } from '../config/envs';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: CORE_SERVICE,
        transport: Transport.GRPC,
        options: {
          package: ['core_quiz_generation'],
          protoPath: [
            join(__dirname, '../../../../protos/core_quiz_generation.proto'),
          ],
          url: `${envs.coreServiceHost}:${envs.coreServicePort}`,
        },
      },
    ]),
  ],
    providers: [WebsocketGateway],
})
export class WebsocketModule {}
