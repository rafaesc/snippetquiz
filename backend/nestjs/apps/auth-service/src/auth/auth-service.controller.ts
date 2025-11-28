import { Controller, Post, Body } from '@nestjs/common';
import { AuthServiceService } from './auth-service.service';
import type {
  UserPayload,
  UserDetailsPayload,
  RefreshTokenPayload,
  ChangePasswordPayload,
  RegisterDto,
  LoginDto,
  VerifyEmailDto,
  ResendVerificationDto,
  RefreshTokenDto,
  AuthResponseDto,
  TokensDto,
} from '../../../commons/types/auth-payloads';

@Controller('auth')
export class AuthServiceController {
  constructor(private readonly authServiceService: AuthServiceService) { }

  @Post('register')
  async register(@Body() registerDto: RegisterDto): Promise<AuthResponseDto> {
    return this.authServiceService.register(registerDto);
  }

  @Post('verify-email')
  async verifyEmail(
    @Body() verifyEmailDto: VerifyEmailDto,
  ): Promise<AuthResponseDto> {
    const result = await this.authServiceService.verifyEmail(verifyEmailDto);
    return result;
  }

  @Post('resend-verification')
  async resendVerification(
    @Body() resendVerificationDto: ResendVerificationDto,
  ): Promise<{ message: string }> {
    return this.authServiceService.resendVerification(
      resendVerificationDto.email,
    );
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
    const result = await this.authServiceService.login(loginDto);
    return result;
  }

  @Post('refresh')
  async refresh(
    @Body() refreshTokenDto: RefreshTokenDto,
  ): Promise<{ message: string; tokens: TokensDto }> {
    const tokens = await this.authServiceService.refreshToken(
      refreshTokenDto.refreshToken!,
    );
    return { message: 'Token refreshed successfully', tokens };
  }

  @Post('logout')
  async logout(
    @Body() data: RefreshTokenPayload,
  ): Promise<{ message: string }> {
    const result = await this.authServiceService.logout(data.refreshToken);
    return result;
  }

  @Post('verify')
  async verify(
    @Body() data: UserDetailsPayload,
  ): Promise<{ valid: boolean; user: any }> {
    return {
      valid: true,
      user: {
        id: data.userId,
        name: data.name,
        email: data.email,
      },
    };
  }

  @Post('profile')
  async getProfile(@Body() data: UserPayload): Promise<any> {
    return this.authServiceService.getProfile(data.userId);
  }

  @Post('change-password')
  async changePassword(
    @Body() data: ChangePasswordPayload,
  ): Promise<{ message: string }> {
    const result = await this.authServiceService.changePassword(
      data.refreshToken,
      data.userId,
      data.changePasswordDto,
    );
    return result;
  }
}
