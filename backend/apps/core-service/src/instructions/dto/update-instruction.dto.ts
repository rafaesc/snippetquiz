import { PartialType } from '@nestjs/mapped-types';
import { CreateInstructionDto } from './create-instruction.dto';

export class UpdateInstructionDto extends PartialType(CreateInstructionDto) {
  id: number;
}
