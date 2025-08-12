import { Injectable, BadRequestException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { RedisService } from '../../../commons/services';
import { UsersService } from '../users/users.service';
import { GenerateCodeResponseDto, ResolveCodeDto, AuthResponseDto } from 'apps/commons';

import { envs } from '../config/envs';
import { TokenService } from '../utils/token.service';

@Injectable()
export class CodeService {
  constructor(
    private readonly redisService: RedisService,
    private readonly usersService: UsersService,
    private readonly tokenService: TokenService // Add TokenService
  ) {}

  async generateCode(userId: string): Promise<GenerateCodeResponseDto> {
    try {
      // Generate a random 8-character alphanumeric code
      const code = Math.random().toString(36).substring(2, 10).toUpperCase();
      
      // Store the code in Redis with 5-minute expiration
      await this.redisService.storeOneTimeCode(code, userId, '5m');
      
      return { code };
    } catch (error) {
      throw new BadRequestException('Failed to generate code');
    }
  }

  async resolveCode(resolveCodeDto: ResolveCodeDto): Promise<AuthResponseDto> {
    const { code } = resolveCodeDto;
    
    if (!code) {
      throw new BadRequestException('Code is required');
    }
    
    try {
      // Validate and consume the one-time code
      const userId = await this.redisService.validateAndConsumeOneTimeCode(code);
      
      if (!userId) {
        throw new BadRequestException('Invalid or expired code');
      }
      
      // Get user from database
      const user = await this.usersService.findById(userId);
      if (!user) {
        throw new NotFoundException('User not found');
      }
      
      // Check if user is verified
      if (!user.verified) {
        throw new UnauthorizedException('User email not verified');
      }
      
      // Generate tokens
      // Replace: const tokens = this.generateTokens(user);
      const tokens = this.tokenService.generateTokens(user);
      
      return {
        message: 'Code resolved successfully',
        user,
        tokens
      };
    } catch (error) {
      if (error instanceof BadRequestException ||
          error instanceof NotFoundException ||
          error instanceof UnauthorizedException) {
        throw error;
      }
      throw new BadRequestException('Failed to resolve code');
    }
  }

  // Remove the private generateTokens method
}
