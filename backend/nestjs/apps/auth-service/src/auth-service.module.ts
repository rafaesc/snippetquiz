import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { JwtModule } from '@nestjs/jwt';
import { AuthServiceController } from './auth/auth-service.controller';
import { AuthServiceService } from './auth/auth-service.service';
import { UsersModule } from './users/users.module';
import { RedisModule } from '../../commons/services/redis.module';
import { CodeModule } from './code/code.module';
import { TokenService } from './utils/token.service';
import { envs } from './config/envs';
import { EventBusModule } from 'apps/commons/event-bus/event-bus.module';
import { getKafkaConfig } from 'apps/commons/event-bus/kafka.config';

@Module({
  imports: [
    HttpModule,
    UsersModule,
    RedisModule,
    JwtModule.register({
      global: true,
      secret: envs.jwtAuthSecret,
      signOptions: { expiresIn: envs.jwtAuthExpiresIn },
    }),
    CodeModule,
    EventBusModule.register(getKafkaConfig(envs, 'auth-service-producer').options),
  ],
  controllers: [AuthServiceController],
  providers: [AuthServiceService, TokenService],
  exports: [AuthServiceService, TokenService],
})
export class AuthServiceModule { }
