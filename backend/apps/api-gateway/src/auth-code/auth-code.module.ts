import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AuthCodeService } from './auth-code.service';
import { AuthCodeController } from './auth-code.controller';
import { envs } from '../config/envs';
import { AUTH_SERVICE } from '../config/services';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: AUTH_SERVICE,
        transport: Transport.TCP,
        options: {
          host: 'localhost',
          port: envs.authServicePort,
        },
      },
    ]),
  ],
  controllers: [AuthCodeController],
  providers: [AuthCodeService],
})
export class AuthCodeModule {}
