import { Module } from '@nestjs/common';
import { UtilsModule } from '../utils/utils.module';
import { EventProcessorService } from './event-processor.service';

@Module({
  imports: [UtilsModule],
  providers: [EventProcessorService],
  exports: [EventProcessorService],
})
export class EventProcessorModule { }
