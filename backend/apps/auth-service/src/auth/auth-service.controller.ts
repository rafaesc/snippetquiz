import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
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
  TokensDto
} from '../../../commons/types/auth-payloads';

@Controller()
export class AuthServiceController {
  constructor(private readonly authServiceService: AuthServiceService) { }

  @MessagePattern('auth.me')
  async getMe(@Payload() data: UserPayload): Promise<{ message: string }> {
    return { message: 'Hello, World!' };
  }

  @MessagePattern('auth.register')
  async register(@Payload() registerDto: RegisterDto): Promise<AuthResponseDto> {
    return this.authServiceService.register(registerDto);
  }

  @MessagePattern('auth.verify-email')
  async verifyEmail(@Payload() verifyEmailDto: VerifyEmailDto): Promise<AuthResponseDto> {
    const result = await this.authServiceService.verifyEmail(verifyEmailDto);
    return result;
  }

  @MessagePattern('auth.resend-verification')
  async resendVerification(@Payload() resendVerificationDto: ResendVerificationDto): Promise<{ message: string }> {
    return this.authServiceService.resendVerification(resendVerificationDto.email);
  }

  @MessagePattern('auth.login')
  async login(@Payload() loginDto: LoginDto): Promise<AuthResponseDto> {
    const result = await this.authServiceService.login(loginDto);
    return result;
  }

  @MessagePattern('auth.refresh')
  async refresh(@Payload() refreshTokenDto: RefreshTokenDto): Promise<{ message: string; tokens: TokensDto }> {
    const tokens = await this.authServiceService.refreshToken(refreshTokenDto.refreshToken!);
    return { message: 'Token refreshed successfully', tokens };
  }

  @MessagePattern('auth.logout')
  async logout(@Payload() data: RefreshTokenPayload): Promise<{ message: string }> {
    const result = await this.authServiceService.logout(data.refreshToken);
    return result;
  }

  @MessagePattern('auth.verify')
  async verify(@Payload() data: UserDetailsPayload): Promise<{ valid: boolean; user: any }> {
    return {
      valid: true,
      user: {
        id: data.userId,
        name: data.name,
        email: data.email
      }
    };
  }

  @MessagePattern('auth.profile')
  async getProfile(@Payload() data: UserPayload): Promise<any> {
    return this.authServiceService.getProfile(data.userId);
  }

  @MessagePattern('auth.change-password')
  async changePassword(@Payload() data: ChangePasswordPayload): Promise<{ message: string }> {
    const result = await this.authServiceService.changePassword(
      data.refreshToken, 
      data.userId, 
      data.changePasswordDto
    );
    return result;
  }
}
