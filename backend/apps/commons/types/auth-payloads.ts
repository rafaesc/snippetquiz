import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';

// Auth payload interfaces for microservice communication
export interface UserPayload {
  userId: string;
}

export interface UserDetailsPayload {
  userId: string;
  name: string;
  email: string;
}

export interface RefreshTokenPayload {
  refreshToken: string;
}

export interface ChangePasswordPayload {
  changePasswordDto: ChangePasswordDto;
  refreshToken: string;
  userId: string;
}

// Base User Response DTO
export class UserResponseDto {
  id: string;
  name: string;
  email: string;
  verified: boolean;
  createdDate: Date;
}

// Authentication DTOs
export class RegisterDto {
  @IsString()
  @MinLength(2)
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;
}

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}

export class VerifyEmailDto {
  @IsString()
  token: string;
}

export class ResendVerificationDto {
  @IsEmail()
  email: string;
}

export class RefreshTokenDto {
  @IsString()
  @IsOptional()
  refreshToken?: string;
}

export class ChangePasswordDto {
  @IsString()
  currentPassword: string;

  @IsString()
  @MinLength(6)
  newPassword: string;
}

export class ResolveCodeDto {
  @IsString()
  code: string;
}

// Add this new DTO for generate code response
export class GenerateCodeResponseDto {
  code: string;
}

// Response DTOs
export class TokensDto {
  accessToken: string;
  refreshToken: string;
}

export class AuthResponseDto {
  message: string;
  user?: UserResponseDto;
  tokens?: TokensDto;
}