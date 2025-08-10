import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { AuthServiceModule } from './auth-service.module';
import { envs } from './config/envs';
import { Logger } from '@nestjs/common';
import fastifyCookie from '@fastify/cookie';

async function bootstrap() {
  const logger = new Logger('auth-service-bootstrap');

  const app = await NestFactory.create<NestFastifyApplication>(
    AuthServiceModule,
    new FastifyAdapter(),
  );

  app.enableCors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  });

  await app.register(fastifyCookie, {
    secret: envs.cookieSecret,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.listen(envs.authServicePort, '0.0.0.0');
  logger.log(`App running on port ${envs.authServicePort}`);
}
bootstrap();
