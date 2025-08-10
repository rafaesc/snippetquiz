import { Module } from '@nestjs/common';
import { CodeController } from './code.controller';
import { CodeService } from './code.service';
import { JwtModule } from '@nestjs/jwt';
import { RedisModule } from '../../../commons/services';
import { UsersModule } from '../users/users.module';
import { envs } from '../config/envs';
import { TokenService } from '../utils/token.service';

@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: envs.jwtAuthVerificationSecret,
      signOptions: { expiresIn: envs.jwtAuthVerificationExpiresIn },
    }),
    RedisModule,
    UsersModule
  ],
  controllers: [CodeController],
  providers: [CodeService,
    TokenService]
})
export class CodeModule { }
