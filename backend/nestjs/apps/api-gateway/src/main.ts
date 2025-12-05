import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import fastifyCookie from '@fastify/cookie';
import { envs } from './config/envs';
import { RpcExceptionFilter } from './filters/rpc-exception.filter';

async function bootstrap() {
  const logger = new Logger('api-gateway-bootstrap');

  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );

  app.enableCors({
    origin: envs.allowedOrigins.split(','),
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  });

  await app.register(fastifyCookie, {
    secret: envs.cookieSecret,
  });

  app.setGlobalPrefix('api');

  const config = new DocumentBuilder()
    .setTitle('API Gateway')
    .setDescription('The API Gateway description')
    .setVersion('1.0')
    .addTag('api-gateway')
    .build();

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalFilters(new RpcExceptionFilter());

  // enable only if the env is development
  if (!envs.isProduction) {
    const documentFactory = () => SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/swagger-ui', app, documentFactory);
  }

  await app.listen(envs.apiGatewayPort, '0.0.0.0');
  logger.log(`API Gateway running on port ${envs.apiGatewayPort}, production: ${envs.isProduction}`);
}
bootstrap();
