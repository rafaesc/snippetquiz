import { Module } from '@nestjs/common';
import { QuizGeneratorService } from './quiz-generator.service';
import { QuizGeneratorController } from './quiz-generator.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';

import { join } from 'path';

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

  controllers: [QuizGeneratorController],
  providers: [QuizGeneratorService],
})
export class QuizGeneratorModule {}
