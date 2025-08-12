import { Injectable } from '@nestjs/common';
import { PrismaClient } from 'generated/prisma/postgres';
import { UpdateInstructionDto } from './dto/update-instruction.dto';
import { InstructionResponseDto } from './dto/instruction-response.dto';

@Injectable()
export class InstructionsService extends PrismaClient {
  constructor() {
    super();
  }

  async findByUserId(userId: string): Promise<InstructionResponseDto> {
    const instruction = await this.quizGenerationInstruction.findFirst({
      where: {
        userId,
      },
    });

    return {
      instruction: instruction?.instruction,
      updatedAt: instruction?.updatedAt,
    };
  }

  async createOrUpdate(updateDto: UpdateInstructionDto): Promise<InstructionResponseDto> {
    const { userId, instruction } = updateDto;

    // Check if user already has an instruction
    const existingInstruction = await this.quizGenerationInstruction.findFirst({
      where: {
        userId,
      },
    });

    let result;
    if (existingInstruction) {
      // Update existing instruction
      result = await this.quizGenerationInstruction.update({
        where: {
          id: existingInstruction.id,
        },
        data: {
          instruction: instruction.trim(),
          updatedAt: new Date(),
        },
      });
    } else {
      // Create new instruction
      result = await this.quizGenerationInstruction.create({
        data: {
          instruction: instruction.trim(),
          userId,
        },
      });
    }

    return {
      instruction: result.instruction,
      updatedAt: result.updatedAt,
    };
  }
}
