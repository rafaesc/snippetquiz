import { NestFactory } from '@nestjs/core';
import { AiProcessorModule } from './ai-processor.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { Logger } from '@nestjs/common';
import { envs } from './config/envs';
import { getKafkaConfig } from '../../commons/event-bus/kafka.config';

async function bootstrap() {
  const logger = new Logger('AiProcessor-Main');
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AiProcessorModule,
    getKafkaConfig(envs, 'ai-processor'),
  );

  await app.listen();
  logger.log(`AiProcessor Microservice running on Kafka broker ${envs.kafkaHost}:${envs.kafkaPort}`);
}
bootstrap();
