import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TokenService } from './token.service';
import { PrismaService } from './prisma.service';
import { RedisModule } from '../../../commons/services';
import { envs } from '../config/envs';

@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: envs.jwtAuthSecret,
      signOptions: { expiresIn: envs.jwtAuthExpiresIn },
    }),
    RedisModule,
  ],
  providers: [TokenService, PrismaService],
  exports: [TokenService, PrismaService],
})
export class UtilsModule { }
