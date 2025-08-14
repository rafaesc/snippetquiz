import { Injectable, Logger } from '@nestjs/common';
import { PrismaClient } from 'generated/prisma/postgres';
import * as bcrypt from 'bcryptjs';

export interface UserData {
  id?: string;
  name: string;
  email: string;
  password?: string;
  passwordUpdatedAt?: Date;
  createdDate?: Date;
  verified?: boolean;
}

export interface CreateUser {
  name: string;
  email: string;
  password: string;
}

@Injectable()
export class UsersService extends PrismaClient {
  private readonly logger = new Logger(UsersService.name);
  private readonly saltRounds = 12;

  constructor() {
    super();
  }

  // Password hashing method
  private async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.saltRounds);
  }

  // Password verification method
  async verifyPassword(
    hashedPassword: string,
    plainPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  // Find user by email
  async findByEmail(email: string) {
    return this.user.findUnique({
      where: { email },
    });
  }

  // Find user by email with password (for authentication)
  async findUserByEmail(email: string) {
    return this.user.findUnique({
      where: {
        email,
        password: {
          not: undefined,
        },
      },
    });
  }

  // Create a new user
  async createUser(
    userData: Omit<UserData, 'id' | 'createdDate'>,
  ): Promise<any> {
    const hashedPassword = userData.password
      ? await this.hashPassword(userData.password)
      : undefined;
    if (!hashedPassword) {
      throw new Error('Password is required');
    }

    return this.user.create({
      data: {
        name: userData.name,
        email: userData.email,
        password: hashedPassword,
        passwordUpdatedAt: hashedPassword ? new Date() : undefined,
        verified: userData.verified ?? false,
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdDate: true,
        verified: true,
        passwordUpdatedAt: true,
        // Exclude password from response
      },
    });
  }

  // Update user
  async updateUser(id: string, userData: Partial<UserData>) {
    const updateData: any = { ...userData };

    // Hash password if provided
    if (userData.password) {
      updateData.password = await this.hashPassword(userData.password);
      updateData.passwordUpdatedAt = new Date();
    }

    // Remove undefined fields
    Object.keys(updateData).forEach((key) => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    return this.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        createdDate: true,
        verified: true,
        passwordUpdatedAt: true,
        // Exclude password from response
      },
    });
  }

  // Delete user
  async deleteUser(id: string): Promise<{ count: number }> {
    await this.user.delete({
      where: { id },
    });
    return { count: 1 };
  }

  // Verify user
  async verifyUser(id: string) {
    return this.user.update({
      where: { id },
      data: { verified: true },
      select: {
        id: true,
        name: true,
        email: true,
        createdDate: true,
        verified: true,
        passwordUpdatedAt: true,
      },
    });
  }

  // Update password specifically
  async updatePassword(id: string, newPassword: string) {
    const hashedPassword = await this.hashPassword(newPassword);

    return this.user.update({
      where: { id },
      data: {
        password: hashedPassword,
        passwordUpdatedAt: new Date(),
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdDate: true,
        verified: true,
        passwordUpdatedAt: true,
      },
    });
  }

  // Update user profile (name and email only)
  async updateProfile(
    id: string,
    data: Partial<Pick<UserData, 'name' | 'email'>>,
  ) {
    return this.user.update({
      where: { id },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        createdDate: true,
        verified: true,
        passwordUpdatedAt: true,
      },
    });
  }

  // Find user by ID
  async findById(id: string) {
    return this.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        createdDate: true,
        verified: true,
        passwordUpdatedAt: true,
        // Exclude password from response
      },
    });
  }

  // Find user by ID with password (for authentication purposes)
  async findByIdWithPassword(id: string) {
    return this.user.findUnique({
      where: { id },
    });
  }

  // Verify user password by ID
  async verifyUserPassword(id: string, password: string): Promise<boolean> {
    const user = await this.findByIdWithPassword(id);
    if (!user || !user.password) {
      return false;
    }
    return this.verifyPassword(user.password, password);
  }
}
