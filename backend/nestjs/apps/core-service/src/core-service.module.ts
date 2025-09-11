import { Module } from '@nestjs/common';
import { ContentBankModule } from './content-bank/content-bank.module';
import { ContentEntryModule } from './content-entry/content-entry.module';
import { InstructionsModule } from './instructions/instructions.module';
import { QuizModule } from './quiz/quiz.module';
import { QuizGenerationConsumerModule } from './consumers/quiz-generation.consumer.module';
import { KAFKA_SERVICE } from './config/services';
import { Transport } from '@nestjs/microservices';
import { ClientsModule } from '@nestjs/microservices';  
import { ContentEntryConsumer } from './consumers/content-entry.consumer';
import { envs } from './config/envs';

@Module({
  imports: [
     ClientsModule.register([
        {
          name: KAFKA_SERVICE,
          transport: Transport.KAFKA,
          options: {
            client: {
            brokers: [`${envs.kafkaHost}:${envs.kafkaPort}`],
          },
        },
      }]),
    ContentBankModule,
    ContentEntryModule,
    InstructionsModule,
    QuizModule,
    QuizGenerationConsumerModule,
  ],
  controllers: [ContentEntryConsumer],
  providers: [],
})
export class CoreServiceModule {}
