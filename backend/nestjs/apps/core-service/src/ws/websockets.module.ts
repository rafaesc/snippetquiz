import { Module } from '@nestjs/common';
import { WebsocketGateway } from './websocket.gateway';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { QuizGeneratorService } from '../quiz-generator/quiz-generator.service';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'HERO_PACKAGE',
        transport: Transport.GRPC,
        options: {
          package: 'books',
          protoPath: join(__dirname, '../../../../protos/books.proto'),
          url: 'localhost:50051',
        },
      },
    ]),
  ],
    providers: [WebsocketGateway, QuizGeneratorService],
})
export class WebsocketModule {}
