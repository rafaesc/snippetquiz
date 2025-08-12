import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { CoreServiceService } from './core-service.service';
import { CoreServiceController } from './core-service.controller';
import { CORE_SERVICE } from '../config/services';
import { envs } from '../config/envs';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: CORE_SERVICE,
        transport: Transport.TCP,
        options: {
          host: 'localhost',
          port: envs.coreServicePort,
        },
      },
    ]),
  ],
  controllers: [CoreServiceController],
  providers: [CoreServiceService],
})
export class CoreServiceModule { }
