import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { CoreServiceModule } from './core-service.module';
import { envs } from './config/envs';
import { Logger } from '@nestjs/common';
import { AllRpcExceptionsFilter } from './filters/rpc-exception.filter';

async function bootstrap() {
  const logger = new Logger('core-service-bootstrap');

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    CoreServiceModule,
    {
      transport: Transport.TCP,
      options: {
        host: '0.0.0.0', 
        port: envs.coreServicePort,
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

  app.useGlobalFilters(new AllRpcExceptionsFilter());

  await app.listen();
  logger.log(`Core microservice running on TCP port ${envs.coreServicePort}`);
}
bootstrap();
