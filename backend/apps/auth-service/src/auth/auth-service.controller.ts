import { Controller, Post, Get, Body, UseGuards, Request, Res, HttpCode, HttpStatus } from '@nestjs/common';
import { type FastifyRequest, type FastifyReply } from 'fastify';
import { AuthServiceService } from './auth-service.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import {
  RegisterDto,
  LoginDto,
  VerifyEmailDto,
  ResendVerificationDto,
  RefreshTokenDto,
  ChangePasswordDto,
  ResolveCodeDto,
  AuthResponseDto,
  TokensDto
} from '../dto/auth.dto';

@Controller('auth')
export class AuthServiceController {
  constructor(private readonly authServiceService: AuthServiceService) { }

  //get
  @Get('me')
  async getMe(@Request() req: any): Promise<{ message: string }> {
    return { message: 'Hello, World!' };
  }

  @Post('register')
  async register(@Body() registerDto: RegisterDto): Promise<AuthResponseDto> {
    return this.authServiceService.register(registerDto);
  }

  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  async verifyEmail(
    @Body() verifyEmailDto: VerifyEmailDto,
    @Res({ passthrough: true }) response: FastifyReply
  ): Promise<AuthResponseDto> {
    const result = await this.authServiceService.verifyEmail(verifyEmailDto);

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
    }

    return result;
  }

  @Post('resend-verification')
  @HttpCode(HttpStatus.OK)
  async resendVerification(@Body() resendVerificationDto: ResendVerificationDto): Promise<{ message: string }> {
    return this.authServiceService.resendVerification(resendVerificationDto.email);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) response: FastifyReply
  ): Promise<AuthResponseDto> {
    const result = await this.authServiceService.login(loginDto);

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
    }

    return result;
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Body() refreshTokenDto: RefreshTokenDto,
    @Request() req: any,
    @Res({ passthrough: true }) response: FastifyReply
  ): Promise<{ message: string; tokens: TokensDto }> {
    const refreshToken = req.cookies?.refreshToken || refreshTokenDto.refreshToken;
    const tokens = await this.authServiceService.refreshToken(refreshToken);

    // Set new tokens in cookies
    response.setCookie('accessToken', tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000 // 15 minutes
    });

    response.setCookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    return { message: 'Token refreshed successfully', tokens };
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async logout(
    @Request() req: any,
    @Res({ passthrough: true }) response: FastifyReply
  ): Promise<{ message: string }> {
    const refreshToken = req.cookies?.refreshToken;
    const result = await this.authServiceService.logout(refreshToken);

    // Clear cookies
    response.clearCookie('accessToken');
    response.clearCookie('refreshToken');

    return result;
  }

  @Get('verify')
  @UseGuards(JwtAuthGuard)
  async verify(@Request() req: any): Promise<{ valid: boolean; user: any }> {
    return {
      valid: true,
      user: {
        id: req.user.id,
        name: req.user.name,
        email: req.user.email
      }
    };
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Request() req: any): Promise<any> {
    return this.authServiceService.getProfile(req.user.id);
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async changePassword(
    @Body() changePasswordDto: ChangePasswordDto,
    @Request() req,
    @Res({ passthrough: true }) response: FastifyReply
  ): Promise<{ message: string }> {
    let refreshToken
    if (req && req.cookies && req.cookies['refreshToken']) {
      refreshToken = req.cookies['refreshToken'];
    }
    const result = await this.authServiceService.changePassword(refreshToken, req.user.id, changePasswordDto);

    // Clear cookies after password change
    response.clearCookie('accessToken');
    response.clearCookie('refreshToken');

    return result;
  }
}
