import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';

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