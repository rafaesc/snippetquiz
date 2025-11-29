import { Module } from '@nestjs/common';
import { QuizController } from './quiz.controller';
import { QuizService } from './quiz.service';
import { UtilsModule } from '../utils/utils.module';
import { AiClientModule } from '../ai-client/ai-client.module';
import { EventBusModule } from '../../../commons/event-bus/event-bus.module';
import { getKafkaConfig } from '../../../commons/event-bus/kafka.config';
import { EventProcessorModule } from '../event-processor/event-processor.module';
import { envs } from '../config/envs';

@Module({
  imports: [
    UtilsModule,
    EventProcessorModule,
    AiClientModule,
    EventBusModule.register(getKafkaConfig(envs, 'ai-content-service-producer').options),
  ],
  controllers: [QuizController],
  providers: [QuizService]
})
export class QuizModule { }
