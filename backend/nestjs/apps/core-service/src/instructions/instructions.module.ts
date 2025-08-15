import { Module } from '@nestjs/common';
import { InstructionsService } from './instructions.service';
import { InstructionsController } from './instructions.controller';

@Module({
  controllers: [InstructionsController],
  providers: [InstructionsService],
})
export class InstructionsModule {}
