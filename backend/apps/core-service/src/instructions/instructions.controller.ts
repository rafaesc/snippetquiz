import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { InstructionsService } from './instructions.service';
import { CreateInstructionDto } from './dto/create-instruction.dto';
import { UpdateInstructionDto } from './dto/update-instruction.dto';

@Controller()
export class InstructionsController {
  constructor(private readonly instructionsService: InstructionsService) {}

  @MessagePattern('createInstruction')
  create(@Payload() createInstructionDto: CreateInstructionDto) {
    return this.instructionsService.create(createInstructionDto);
  }

  @MessagePattern('findAllInstructions')
  findAll() {
    return this.instructionsService.findAll();
  }

  @MessagePattern('findOneInstruction')
  findOne(@Payload() id: number) {
    return this.instructionsService.findOne(id);
  }

  @MessagePattern('updateInstruction')
  update(@Payload() updateInstructionDto: UpdateInstructionDto) {
    return this.instructionsService.update(updateInstructionDto.id, updateInstructionDto);
  }

  @MessagePattern('removeInstruction')
  remove(@Payload() id: number) {
    return this.instructionsService.remove(id);
  }
}
