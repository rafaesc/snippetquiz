import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthServiceController } from './auth/auth-service.controller';
import { AuthServiceService } from './auth/auth-service.service';
import { UsersModule } from './users/users.module';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RedisModule } from '../../commons/services/redis.module';
import { CodeModule } from './code/code.module';
import { TokenService } from './utils/token.service';
import { envs } from './config/envs';

@Module({
  imports: [
    UsersModule,
    RedisModule,
    JwtModule.register({
      global: true,
      secret: envs.jwtAuthSecret,
      signOptions: { expiresIn: envs.jwtAuthExpiresIn },
    }),
    CodeModule,
  ],
  controllers: [AuthServiceController],
  providers: [AuthServiceService, JwtAuthGuard, TokenService],
  exports: [AuthServiceService, JwtAuthGuard],
})
export class AuthServiceModule { }
