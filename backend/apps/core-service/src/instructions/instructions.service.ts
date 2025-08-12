import { Injectable } from '@nestjs/common';
import { CreateInstructionDto } from './dto/create-instruction.dto';
import { UpdateInstructionDto } from './dto/update-instruction.dto';

@Injectable()
export class InstructionsService {
  create(createInstructionDto: CreateInstructionDto) {
    return 'This action adds a new instruction';
  }

  findAll() {
    return `This action returns all instructions`;
  }

  findOne(id: number) {
    return `This action returns a #${id} instruction`;
  }

  update(id: number, updateInstructionDto: UpdateInstructionDto) {
    return `This action updates a #${id} instruction`;
  }

  remove(id: number) {
    return `This action removes a #${id} instruction`;
  }
}
