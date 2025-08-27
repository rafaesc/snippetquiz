import { Module } from '@nestjs/common';
import { PrismaModule } from '../../../commons/services';
import { InstructionsService } from './instructions.service';
import { InstructionsController } from './instructions.controller';

@Module({
  imports: [PrismaModule],
  controllers: [InstructionsController],
  providers: [InstructionsService],
})
export class InstructionsModule {}
