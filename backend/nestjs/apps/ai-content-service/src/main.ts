import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { AiContentServiceModule } from './ai-content-service.module';
import { envs } from './config/envs';
import { getKafkaConfig } from '../../commons/event-bus/kafka.config';

async function bootstrap() {
  const logger = new Logger('AiContentService-Main');

  // Create Fastify HTTP application
  const app = await NestFactory.create<NestFastifyApplication>(
    AiContentServiceModule,
    new FastifyAdapter(),
  );

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Connect Kafka microservice
  app.connectMicroservice(getKafkaConfig(envs, 'ai-content-service'));

  // Start all microservices
  await app.startAllMicroservices();
  logger.log(`AiContentService Kafka microservice running on ${envs.kafkaHost}:${envs.kafkaPort}`);

  // Start HTTP server
  await app.listen(envs.aiContentServicePort, '0.0.0.0');
  logger.log(`AiContentService HTTP server running on port ${envs.aiContentServicePort}`);
}
bootstrap();
