import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { CoreServiceModule } from './core-service.module';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    CoreServiceModule,
    new FastifyAdapter(),
  );
  await app.listen(process.env.PORT ?? 7000);
}
bootstrap();
