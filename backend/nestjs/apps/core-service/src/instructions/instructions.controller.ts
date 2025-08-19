import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { InstructionsService } from './instructions.service';
import { UpdateInstructionDto } from './dto/update-instruction.dto';

@Controller()
export class InstructionsController {
  constructor(private readonly instructionsService: InstructionsService) {}

  @GrpcMethod('InstructionsService', 'FindInstructionByUserId')
  findByUserId(data: { user_id: string }) {
    return this.instructionsService.findByUserId(data.user_id);
  }

  @GrpcMethod('InstructionsService', 'CreateOrUpdateInstruction')
  createOrUpdate(data: { instruction: string; user_id: string }) {
    const updateInstructionDto: UpdateInstructionDto = {
      instruction: data.instruction,
      userId: data.user_id,
    };
    return this.instructionsService.createOrUpdate(updateInstructionDto);
  }
}
