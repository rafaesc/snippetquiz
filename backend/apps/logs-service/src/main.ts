import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { LogsServiceModule } from './logs-service.module';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    LogsServiceModule,
    new FastifyAdapter(),
  );
  await app.listen(process.env.PORT ?? 8000);
}
bootstrap();
