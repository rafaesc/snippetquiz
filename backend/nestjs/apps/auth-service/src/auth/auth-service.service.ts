import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as nodemailer from 'nodemailer';
import {
  RegisterDto,
  LoginDto,
  VerifyEmailDto,
  ChangePasswordDto,
  UserResponseDto,
  AuthResponseDto,
  TokensDto,
} from 'apps/commons/types';
import { RedisService } from 'apps/commons/services';
import { UsersService } from '../users/users.service';
import { envs } from '../config/envs';
import { TokenService } from '../utils/token.service';
import {
  getVerificationEmailTemplate,
  getResendVerificationEmailTemplate,
} from '../utils/email-templates';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { X_USER_ID_HEADER } from 'apps/commons/config/constants';
import { EventBusService } from 'apps/commons/event-bus/event-bus.service';
import { AuthUserVerifiedEvent } from './events/auth-user-verified.event';

@Injectable()
export class AuthServiceService {
  private readonly logger = new Logger(AuthServiceService.name);
  private transporter: nodemailer.Transporter;

  constructor(
    private jwtService: JwtService,
    private readonly redisService: RedisService,
    private readonly usersService: UsersService,
    private readonly tokenService: TokenService,
    private readonly httpService: HttpService,
    private readonly eventBusService: EventBusService,
  ) {
    this.setupEmailTransporter();
  }

  private setupEmailTransporter() {
    if (!envs.emailUsername || !envs.emailPassword) {
      this.logger.warn(
        'Email credentials not provided. Email features will be disabled.',
      );
      return;
    }

    this.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: envs.emailUsername,
        pass: envs.emailPassword,
      },
    });

    this.transporter.verify((error, success) => {
      if (error) {
        this.logger.error('Email transporter verification error:', error);
      } else {
        this.logger.log('Email transporter is ready to take messages');
      }
    });
  }

  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    const { name, email, password } = registerDto;

    // Check if user already exists using UsersService
    const existingUser = await this.usersService.findByEmail(email);
    if (existingUser && existingUser.verified) {
      throw new ConflictException('User already exists with this email');
    }

    // Determine if email verification is available
    const emailVerificationEnabled = !!(
      envs.emailUsername && envs.emailPassword
    );

    let user = existingUser;
    if (!existingUser) {
      user = await this.usersService.createUser({
        name,
        email,
        password,
        verified: !emailVerificationEnabled, // Auto-verify if email is disabled
      });
    }

    if (!user) {
      throw new ConflictException('Unkown error creating user');
    }

    // If email verification is enabled, send verification email
    if (emailVerificationEnabled) {
      // Generate verification token
      const verificationToken = this.jwtService.sign(
        { userId: user.id, email: user.email },
        {
          secret: envs.jwtAuthVerificationSecret,
          expiresIn: envs.jwtAuthVerificationExpiresIn,
        },
      );

      // Send verification email
      const verificationUrl = `${envs.frontendUrl}/auth/verify-email?token=${verificationToken}`;
      const mailOptions = {
        from: envs.emailUsername!,
        to: email,
        subject: 'Verify Your Email - SnippetQuiz',
        html: getVerificationEmailTemplate({
          name,
          verificationUrl,
          expiresIn: envs.jwtAuthVerificationExpiresIn,
        }),
      };

      this.transporter.sendMail(mailOptions);

      return {
        message:
          'User registered successfully. Please check your email to verify your account.',
        user: user as UserResponseDto,
      };
    } else {
      // Email verification disabled - user is automatically verified
      const tokens = this.tokenService.generateTokens(user);

      return {
        message:
          'User registered and automatically verified (email verification disabled).',
        user: user as UserResponseDto,
        tokens, // Provide tokens for immediate login
      };
    }
  }

  async verifyEmail(verifyEmailDto: VerifyEmailDto): Promise<AuthResponseDto> {
    const { token } = verifyEmailDto;

    try {
      const decoded = this.jwtService.verify(token, {
        secret: envs.jwtAuthVerificationSecret,
      });

      const user = await this.usersService.findById(decoded.userId);
      if (!user) {
        throw new NotFoundException('User not found');
      }

      if (user.verified) {
        throw new BadRequestException('Email already verified');
      }

      // Update user verification status using UsersService
      const updatedUser = await this.usersService.verifyUser(user.id);

      // Generate tokens for automatic login after verification
      const tokens = this.tokenService.generateTokens(updatedUser);

      this.eventBusService.publish(new AuthUserVerifiedEvent(user.id));

      return {
        message: 'Email verified successfully',
        user: updatedUser as UserResponseDto,
        tokens,
      };
    } catch (error) {
      if (
        error.name === 'JsonWebTokenError' ||
        error.name === 'TokenExpiredError'
      ) {
        throw new BadRequestException('Invalid or expired verification token');
      }
      throw error;
    }
  }

  async resendVerification(email: string): Promise<{ message: string }> {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.verified) {
      throw new BadRequestException('Email already verified');
    }

    // Generate new verification token
    const verificationToken = this.jwtService.sign(
      { userId: user.id, email: user.email },
      {
        secret: envs.jwtAuthVerificationSecret,
        expiresIn: envs.jwtAuthVerificationExpiresIn,
      },
    );

    // Send verification email
    const verificationUrl = `${envs.frontendUrl}/auth/verify-email?token=${verificationToken}`;
    const mailOptions = {
      from: envs.emailUsername!,
      to: email,
      subject: 'Verify Your Email - SnippetQuiz',
      html: getResendVerificationEmailTemplate({
        name: user.name,
        verificationUrl,
        expiresIn: envs.jwtAuthVerificationExpiresIn,
      }),
    };

    await this.transporter.sendMail(mailOptions);

    return { message: 'Verification email sent successfully' };
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const { email, password } = loginDto;

    const user = await this.usersService.findUserByEmail(email);
    if (!user || !user.password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await this.usersService.verifyPassword(
      user.password,
      password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.verified) {
      throw new UnauthorizedException(
        'Please verify your email before logging in',
      );
    }

    const tokens = this.tokenService.generateTokens(user);
    const userResponse = {
      id: user.id,
      name: user.name,
      email: user.email,
      verified: user.verified,
      createdDate: user.createdDate,
    };

    return {
      message: 'Login successful',
      user: userResponse,
      tokens,
    };
  }

  async refreshToken(refreshToken: string): Promise<TokensDto> {
    try {
      // First validate refresh token exists in Redis
      const storedUserId =
        await this.redisService.validateRefreshToken(refreshToken);
      if (!storedUserId) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // Then verify JWT signature and decode
      const decoded = this.jwtService.verify(refreshToken, {
        secret: envs.jwtAuthRefreshSecret,
      });

      // Ensure the user from Redis matches the JWT payload
      if (storedUserId !== decoded.id.toString()) {
        throw new UnauthorizedException('Token mismatch');
      }

      const user = await this.usersService.findById(decoded.id);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      // Remove old refresh token from Redis
      await this.redisService.removeRefreshToken(refreshToken);

      // Generate new tokens
      return this.tokenService.generateTokens(user);
    } catch (error) {
      // Clean up any potentially invalid token
      await this.redisService.removeRefreshToken(refreshToken);
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(refreshToken?: string): Promise<{ message: string }> {
    if (refreshToken) {
      await this.redisService.removeRefreshToken(refreshToken);
    }
    return { message: 'Logged out successfully' };
  }

  async verifyToken(token: string): Promise<any> {
    try {
      const decoded = this.jwtService.verify(token, {
        secret: envs.jwtAuthSecret,
      });
      return decoded;
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  async changePassword(
    refreshToken: string,
    userId: string,
    changePasswordDto: ChangePasswordDto,
  ): Promise<{ message: string }> {
    const { currentPassword, newPassword } = changePasswordDto;

    // Verify current password using UsersService
    const isCurrentPasswordValid = await this.usersService.verifyUserPassword(
      userId,
      currentPassword,
    );
    if (!isCurrentPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    // Update password using UsersService
    await this.usersService.updatePassword(userId, newPassword);

    // Invalidate all refresh tokens for this user
    if (refreshToken) {
      // Remove refresh token from Redis
      await this.redisService.removeRefreshToken(refreshToken);
    }

    return { message: 'Password changed successfully' };
  }

  async getProfile(userId: string): Promise<any> {
    const user = await this.usersService.findById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      user,
    };
  }
}
