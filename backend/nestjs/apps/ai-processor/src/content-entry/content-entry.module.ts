import { Module } from '@nestjs/common';
import { ContentEntryController } from './content-entry.controller';
import { ContentEntryService } from './content-entry.service';
import { UtilsModule } from '../utils/utils.module';
import { AiClientModule } from '../ai-client/ai-client.module';
import { getKafkaConfig } from '../config/kafka.config';
import { EventBusModule } from '../../../commons/event-bus/event-bus.module';
import { EventProcessorModule } from '../event-processor/event-processor.module';

@Module({
  imports: [
    UtilsModule,
    AiClientModule,
    EventProcessorModule,
    EventBusModule.register(getKafkaConfig('ai-processor-producer').options),
  ],
  controllers: [ContentEntryController],
  providers: [ContentEntryService],
})
export class ContentEntryModule { }
