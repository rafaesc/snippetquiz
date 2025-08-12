import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Observable } from 'rxjs';
import {
  RegisterDto,
  LoginDto,
  VerifyEmailDto,
  RefreshTokenDto,
  ChangePasswordDto,
  AuthResponseDto,
  TokensDto
} from '../../../commons/types/auth-payloads';
import { AUTH_SERVICE } from '../config/services';


@Injectable()
export class AuthClientService {
  constructor(
    @Inject(AUTH_SERVICE) private readonly authServiceClient: ClientProxy,
  ) {}

  register(registerDto: RegisterDto): Observable<AuthResponseDto> {
    return this.authServiceClient.send('auth.register', registerDto);
  }

  verifyEmail(verifyEmailDto: VerifyEmailDto): Observable<AuthResponseDto> {
    return this.authServiceClient.send('auth.verify-email', verifyEmailDto);
  }

  resendVerification(email: string): Observable<{ message: string }> {
    return this.authServiceClient.send('auth.resend-verification', { email });
  }

  login(loginDto: LoginDto): Observable<AuthResponseDto> {
    return this.authServiceClient.send('auth.login', loginDto);
  }

  refresh(refreshTokenDto: RefreshTokenDto): Observable<{ message: string; tokens: TokensDto }> {
    return this.authServiceClient.send('auth.refresh', refreshTokenDto);
  }

  logout(refreshToken: string): Observable<{ message: string }> {
    return this.authServiceClient.send('auth.logout', { refreshToken });
  }

  verify(userId: string, name: string, email: string): Observable<{ valid: boolean; user: any }> {
    return this.authServiceClient.send('auth.verify', { userId, name, email });
  }

  getProfile(userId: string): Observable<any> {
    return this.authServiceClient.send('auth.profile', { userId });
  }

  getMe(userId: string): Observable<{ message: string }> {
    return this.authServiceClient.send('auth.me', { userId });
  }

  changePassword(refreshToken: string, userId: string, changePasswordDto: ChangePasswordDto): Observable<{ message: string }> {
    return this.authServiceClient.send('auth.change-password', {
      changePasswordDto,
      refreshToken,
      userId
    });
  }
}