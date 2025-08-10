import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from 'generated/prisma/postgres';
import { Logger } from '@nestjs/common';

@Injectable()
export class AuthServiceService extends PrismaClient implements OnModuleInit {

  private readonly logger = new Logger(AuthServiceService.name);

  async onModuleInit() {
    await this.$connect();
    this.logger.log('Connected to PostgreSQL database');
  }

  getHello(): string {
    return 'Hello World!';
  }
}
