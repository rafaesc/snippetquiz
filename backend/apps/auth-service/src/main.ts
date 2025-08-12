import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AuthServiceModule } from './auth-service.module';
import { envs } from './config/envs';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('auth-service-bootstrap');

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AuthServiceModule,
    {
      transport: Transport.TCP,
      options: {
        port: envs.authServicePort,
      },
    },
  );

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.listen();
  logger.log(`Auth microservice running on TCP port ${envs.authServicePort}`);
}
bootstrap();
