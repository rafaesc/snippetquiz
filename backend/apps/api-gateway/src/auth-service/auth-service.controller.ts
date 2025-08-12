import { Controller, Post, Get, Body, UseGuards, Request, Res, HttpCode, HttpStatus } from '@nestjs/common';
import { type FastifyRequest, type FastifyReply } from 'fastify';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { AuthClientService } from './auth-client.service';
import { firstValueFrom } from 'rxjs';
import {
  RegisterDto,
  LoginDto,
  VerifyEmailDto,
  ResendVerificationDto,
  RefreshTokenDto,
  ChangePasswordDto
} from '../../../commons/types/auth-payloads';

@Controller('auth-service')
export class AuthServiceController {
  constructor(private readonly authClientService: AuthClientService) { }

  @Get('me')
  async getMe(@Request() req: any): Promise<{ message: string }> {
    // Extract user ID from JWT token or request
    const userId = req.user?.id || 'demo-user-id';
    return await firstValueFrom(this.authClientService.getMe(userId));
  }

  @Post('register')
  async register(@Body() registerDto: RegisterDto): Promise<any> {
    return await firstValueFrom(this.authClientService.register(registerDto));
  }

  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  async verifyEmail(
    @Body() verifyEmailDto: VerifyEmailDto,
    @Res({ passthrough: true }) response: FastifyReply
  ): Promise<any> {
    const result = await firstValueFrom(this.authClientService.verifyEmail(verifyEmailDto));

    if (result.tokens) {
      // Set tokens in cookies
      response.setCookie('accessToken', result.tokens.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 15 * 60 * 1000 // 15 minutes
      });

      response.setCookie('refreshToken', result.tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      // Remove tokens from response body for security
      const { tokens, ...responseWithoutTokens } = result;
      return responseWithoutTokens;
    }

    return result;
  }

  @Post('resend-verification')
  @HttpCode(HttpStatus.OK)
  async resendVerification(@Body() resendVerificationDto: ResendVerificationDto): Promise<{ message: string }> {
    return await firstValueFrom(this.authClientService.resendVerification(resendVerificationDto.email));
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) response: FastifyReply
  ): Promise<any> {
    const result = await firstValueFrom(this.authClientService.login(loginDto));

    if (result.tokens) {
      // Set tokens in cookies
      response.setCookie('accessToken', result.tokens.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 15 * 60 * 1000 // 15 minutes
      });

      response.setCookie('refreshToken', result.tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      // Remove tokens from response body for security
      return result;
    }

    return result;
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Body() refreshTokenDto: RefreshTokenDto,
    @Request() req: FastifyRequest,
    @Res({ passthrough: true }) response: FastifyReply
  ): Promise<{ message: string; tokens?: any }> {
    const refreshToken = req.cookies?.refreshToken || refreshTokenDto.refreshToken;
    const result = await firstValueFrom(this.authClientService.refresh({ refreshToken }));

    if (result.tokens) {
      // Set new tokens in cookies
      response.setCookie('accessToken', result.tokens.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 15 * 60 * 1000 // 15 minutes
      });

      response.setCookie('refreshToken', result.tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      // Return message without tokens in body
      return { message: result.message };
    }

    return result;
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async logout(
    @Body() refreshTokenDto: RefreshTokenDto,
    @Request() req: any,
    @Res({ passthrough: true }) response: FastifyReply
  ): Promise<{ message: string }> {
    const refreshToken = req.cookies?.refreshToken || refreshTokenDto?.refreshToken;
    const result = await firstValueFrom(this.authClientService.logout(refreshToken));

    // Clear cookies
    response.clearCookie('accessToken', { path: "/api/auth-service" });
    response.clearCookie('refreshToken', { path: "/api/auth-service" });

    return result;
  }

  @Get('verify')
  @UseGuards(JwtAuthGuard)
  async verify(@Request() req: any): Promise<{ valid: boolean; user: any }> {
    // Extract user details from JWT token
    const userId = req.user?.id || 'demo-user-id';
    const name = req.user?.name || 'Demo User';
    const email = req.user?.email || 'demo@example.com';

    return await firstValueFrom(this.authClientService.verify(userId, name, email));
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Request() req: any): Promise<any> {
    const userId = req.user?.id || 'demo-user-id';
    return await firstValueFrom(this.authClientService.getProfile(userId));
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async changePassword(
    @Body() changePasswordDto: ChangePasswordDto,
    @Request() req: any,
    @Res({ passthrough: true }) response: FastifyReply
  ): Promise<{ message: string }> {
    const refreshToken = req.cookies?.refreshToken;
    const userId = req.user?.id || 'demo-user-id';

    const result = await firstValueFrom(
      this.authClientService.changePassword(refreshToken, userId, changePasswordDto)
    );

    // Clear cookies after password change
    response.clearCookie('accessToken', { path: "/api/auth-service" });
    response.clearCookie('refreshToken', { path: "/api/auth-service" });

    return result;
  }
}
