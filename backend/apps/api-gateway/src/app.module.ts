import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthServiceModule } from './auth-service/auth-service.module';
import { JwtModule } from '@nestjs/jwt';
import { envs } from './config/envs';
import { AuthCodeModule } from './auth-code/auth-code.module';
import { CoreServiceModule } from './core-service/core-service.module';

@Module({
  imports: [
    AuthServiceModule,
    JwtModule.register({
      global: true,
      secret: envs.jwtAuthSecret,
      signOptions: { expiresIn: envs.jwtAuthExpiresIn },
    }),
    AuthCodeModule,
    CoreServiceModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
