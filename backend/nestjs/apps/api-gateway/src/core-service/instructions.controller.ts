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
  OnModuleInit,
} from '@nestjs/common';
import { type ClientGrpc } from '@nestjs/microservices';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { CORE_SERVICE } from '../config/services';
import { UpdateInstructionDto } from './dto/instructions.dto';

// gRPC service interface
interface InstructionsService {
  FindInstructionByUserId(data: any): Promise<any>;
  CreateOrUpdateInstruction(data: any): Promise<any>;
}

@Controller('instructions')
export class InstructionsController implements OnModuleInit {
  private instructionsService: InstructionsService;

  constructor(
    @Inject(CORE_SERVICE) private readonly client: ClientGrpc,
  ) {}

  onModuleInit() {
    this.instructionsService = this.client.getService<InstructionsService>('InstructionsService');
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async getInstruction(@Request() req: any) {
    try {
      const userId = req.user.id;

      const result = await this.instructionsService.FindInstructionByUserId({
        userId,
      });

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

      const result = await this.instructionsService.CreateOrUpdateInstruction(
        updateInstructionDto,
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
