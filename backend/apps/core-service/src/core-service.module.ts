import { Module } from '@nestjs/common';
import { CoreServiceController } from './core-service.controller';
import { CoreServiceService } from './core-service.service';

@Module({
  imports: [],
  controllers: [CoreServiceController],
  providers: [CoreServiceService],
})
export class CoreServiceModule {}
