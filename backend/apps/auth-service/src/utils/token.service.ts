import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RedisService } from '../../../commons/services';
import { TokensDto } from 'apps/commons';
import { envs } from '../config/envs';

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly redisService: RedisService,
  ) {}

  generateTokens(user: any): TokensDto {
    const payload = { id: user.id, email: user.email, name: user.name };

    const accessToken = this.jwtService.sign(payload, {
      secret: envs.jwtAuthSecret,
      expiresIn: envs.jwtAuthExpiresIn,
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: envs.jwtAuthRefreshSecret,
      expiresIn: envs.jwtRefreshExpiresIn,
    });

    // Store refresh token
    this.redisService.storeRefreshToken(
      refreshToken,
      user.id,
      envs.jwtRefreshExpiresIn,
    );

    return { accessToken, refreshToken };
  }
}
