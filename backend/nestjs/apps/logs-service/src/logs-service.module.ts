import { Module } from '@nestjs/common';
import { LogsServiceController } from './logs-service.controller';
import { LogsServiceService } from './logs-service.service';

@Module({
  imports: [],
  controllers: [LogsServiceController],
  providers: [LogsServiceService],
})
export class LogsServiceModule {}
