import {
  Controller,
  Get,
  Put,
  Body,
  Request,
  UseGuards,
  HttpException,
  HttpStatus,
  Inject,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { CORE_SERVICE } from '../config/services';
import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

class UpdateInstructionDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(5000)
  instruction: string;
}

@Controller('instructions')
export class InstructionsController {
  constructor(
    @Inject(CORE_SERVICE) private readonly coreServiceClient: ClientProxy,
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async getInstruction(@Request() req: any) {
    try {
      const userId = req.user.id;
      
      const result = await firstValueFrom(
        this.coreServiceClient.send('findInstructionByUserId', userId)
      );
      
      return result;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put()
  @UseGuards(JwtAuthGuard)
  async updateInstruction(
    @Body() updateDto: UpdateInstructionDto,
    @Request() req: any,
  ) {
    try {
      const userId = req.user.id;
      const { instruction } = updateDto;

      if (!instruction || instruction.trim().length === 0) {
        throw new HttpException(
          'Instruction is required and cannot be empty',
          HttpStatus.BAD_REQUEST,
        );
      }

      const updateInstructionDto = {
        userId,
        instruction: instruction.trim(),
      };

      const result = await firstValueFrom(
        this.coreServiceClient.send('createOrUpdateInstruction', updateInstructionDto)
      );

      return result;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
