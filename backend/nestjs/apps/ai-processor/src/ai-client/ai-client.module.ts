import { Module } from '@nestjs/common';
import { AiClientService } from './ai-client.service';

@Module({
  providers: [AiClientService],
  exports: [AiClientService],
})
export class AiClientModule { }
