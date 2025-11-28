import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  RegisterDto,
  LoginDto,
  VerifyEmailDto,
  RefreshTokenDto,
  ChangePasswordDto,
  AuthResponseDto,
  TokensDto,
} from '../../../commons/types/auth-payloads';
import { envs } from '../config/envs';

@Injectable()
export class AuthClientService {
  constructor(private readonly httpService: HttpService) { }

  register(registerDto: RegisterDto): Observable<AuthResponseDto> {
    return this.httpService
      .post(`${envs.authBaseUrl}/auth/register`, registerDto)
      .pipe(map((response) => response.data));
  }

  verifyEmail(verifyEmailDto: VerifyEmailDto): Observable<AuthResponseDto> {
    return this.httpService
      .post(`${envs.authBaseUrl}/auth/verify-email`, verifyEmailDto)
      .pipe(map((response) => response.data));
  }

  resendVerification(email: string): Observable<{ message: string }> {
    return this.httpService
      .post(`${envs.authBaseUrl}/auth/resend-verification`, { email })
      .pipe(map((response) => response.data));
  }

  login(loginDto: LoginDto): Observable<AuthResponseDto> {
    return this.httpService
      .post(`${envs.authBaseUrl}/auth/login`, loginDto)
      .pipe(map((response) => response.data));
  }

  refresh(
    refreshTokenDto: RefreshTokenDto,
  ): Observable<{ message: string; tokens: TokensDto }> {
    return this.httpService
      .post(`${envs.authBaseUrl}/auth/refresh`, refreshTokenDto)
      .pipe(map((response) => response.data));
  }

  logout(refreshToken: string): Observable<{ message: string }> {
    return this.httpService
      .post(`${envs.authBaseUrl}/auth/logout`, { refreshToken })
      .pipe(map((response) => response.data));
  }

  verify(
    userId: string,
    name: string,
    email: string,
  ): Observable<{ valid: boolean; user: any }> {
    return this.httpService
      .post(`${envs.authBaseUrl}/auth/verify`, { userId, name, email })
      .pipe(map((response) => response.data));
  }

  getProfile(userId: string): Observable<any> {
    return this.httpService
      .post(`${envs.authBaseUrl}/auth/profile`, { userId })
      .pipe(map((response) => response.data));
  }

  getMe(userId: string): Observable<{ message: string }> {
    return this.httpService
      .post(`${envs.authBaseUrl}/auth/me`, { userId })
      .pipe(map((response) => response.data));
  }

  changePassword(
    refreshToken: string,
    userId: string,
    changePasswordDto: ChangePasswordDto,
  ): Observable<{ message: string }> {
    return this.httpService
      .post(`${envs.authBaseUrl}/auth/change-password`, {
        changePasswordDto,
        refreshToken,
        userId,
      })
      .pipe(map((response) => response.data));
  }
}
