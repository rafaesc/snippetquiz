import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { CoreServiceModule } from './core-service.module';
import { envs } from './config/envs';
import { Logger } from '@nestjs/common';
import { AllRpcExceptionsFilter } from './filters/rpc-exception.filter';
import { join } from 'path';

async function bootstrap() {
  const logger = new Logger('core-service-bootstrap');

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(CoreServiceModule, {
    transport: Transport.GRPC,
    options: {
      package: [
        'content_bank',
        'content_entry', 
        'quiz',
        'instructions',
        'core_quiz_generation'
      ],
      protoPath: [
        join(__dirname, '../../../../protos/content-bank/content-bank.proto'),
        join(__dirname, '../../../../protos/content-entry/content-entry.proto'),
        join(__dirname, '../../../../protos/quiz/quiz.proto'),
        join(__dirname, '../../../../protos/instructions/instructions.proto'),
        join(__dirname, '../../../../protos/core_quiz_generation.proto')
      ],
      url: `${envs.coreServiceHost}:${envs.coreServicePort}`,
      loader: {
        keepCase: true,
        longs: String,
        enums: String,
        defaults: true,
        oneofs: true,
      },
    },
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalFilters(new AllRpcExceptionsFilter());

  await app.listen();
  logger.log(`Core microservice running on gRPC port ${envs.coreServicePort}`);
}
bootstrap();
