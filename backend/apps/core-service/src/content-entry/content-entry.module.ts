import { Module } from '@nestjs/common';
import { ContentEntryService } from './content-entry.service';
import { ContentEntryController } from './content-entry.controller';

@Module({
  controllers: [ContentEntryController],
  providers: [ContentEntryService],
})
export class ContentEntryModule {}
