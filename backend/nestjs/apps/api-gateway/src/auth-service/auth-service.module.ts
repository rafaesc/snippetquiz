import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AuthServiceController } from './auth-service.controller';
import { AuthClientService } from './auth-client.service';
import { envs } from '../config/envs';
import { AUTH_SERVICE } from '../config/services';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: AUTH_SERVICE,
        transport: Transport.TCP,
        options: {
          host: envs.authServiceHost,
          port: envs.authServicePort,
        },
      },
    ]),
  ],
  controllers: [AuthServiceController],
  providers: [AuthClientService],
  exports: [AuthClientService],
})
export class AuthServiceModule {}
