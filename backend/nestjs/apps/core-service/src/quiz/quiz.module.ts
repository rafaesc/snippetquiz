import { Module } from '@nestjs/common';
import { PrismaModule } from '../../../commons/services';
import { QuizService } from './quiz.service';
import { QuizController } from './quiz.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { KAFKA_SERVICE } from '../config/services';
import { envs } from '../config/envs';

@Module({
  imports: [PrismaModule, 
    ClientsModule.register([
      {
        name: KAFKA_SERVICE,
        transport: Transport.KAFKA,
        options: {
          client: {
            brokers: [`${envs.kafkaHost}:${envs.kafkaPort}`],
          },
          consumer: {
            groupId: envs.kafkaCoreConsumerGroup,
          },
          send: {
            acks: -1,
          },
          producer: {
            allowAutoTopicCreation: false,
            idempotent: true,
            maxInFlightRequests: 5,
          },
        },
      },
    ]),
  ],
  controllers: [QuizController],
  providers: [QuizService],
  exports: [QuizService],
})
export class QuizModule {}
