import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { CoreServiceModule } from './core-service.module';
import { envs } from './config/envs';
import { Logger } from '@nestjs/common';
import { AllRpcExceptionsFilter } from './filters/rpc-exception.filter';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';

async function bootstrap() {
  const logger = new Logger('core-service-bootstrap');

  const app = await NestFactory.create<NestFastifyApplication>(
    CoreServiceModule,
    new FastifyAdapter({
      logger: true,
    }),
  );

  const microservice = app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.TCP,
    options: {
      host: '0.0.0.0',
      port: envs.coreServicePort,
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

  await microservice.listen();
  await app.listen(7001, '0.0.0.0');
  logger.log(`Core microservice running on TCP port 7001`);
}
bootstrap();
