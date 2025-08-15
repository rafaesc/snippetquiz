import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { InstructionsService } from './instructions.service';
import { CreateInstructionDto } from './dto/create-instruction.dto';
import { UpdateInstructionDto } from './dto/update-instruction.dto';

@Controller()
export class InstructionsController {
  constructor(private readonly instructionsService: InstructionsService) {}

  @MessagePattern('findInstructionByUserId')
  findByUserId(@Payload() userId: string) {
    return this.instructionsService.findByUserId(userId);
  }

  @MessagePattern('createOrUpdateInstruction')
  createOrUpdate(@Payload() updateInstructionDto: UpdateInstructionDto) {
    return this.instructionsService.createOrUpdate(updateInstructionDto);
  }
}
