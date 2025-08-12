import { Module } from '@nestjs/common';
import { ContentBankService } from './content-bank.service';
import { ContentBankController } from './content-bank.controller';

@Module({
  controllers: [ContentBankController],
  providers: [ContentBankService],
})
export class ContentBankModule {}
