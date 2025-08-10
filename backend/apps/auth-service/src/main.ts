import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { AuthServiceModule } from './auth-service.module';
import { envs } from '../../libs/config/envs';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('auth-service-bootstrap');

  const app = await NestFactory.create<NestFastifyApplication>(
    AuthServiceModule,
    new FastifyAdapter(),
  );

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  await app.listen(envs.authServicePort);
  logger.log(`App running on port ${envs.authServicePort}`);
}
bootstrap();
