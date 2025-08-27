import { Module } from '@nestjs/common';
import { PrismaModule } from '../../../commons/services';
import { ContentBankService } from './content-bank.service';
import { ContentBankController } from './content-bank.controller';

@Module({
  imports: [PrismaModule],
  controllers: [ContentBankController],
  providers: [ContentBankService],
})
export class ContentBankModule {}
