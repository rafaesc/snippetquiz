import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
  Request,
  Inject,
  HttpException,
  HttpStatus,
  ParseIntPipe,
  OnModuleInit,
} from '@nestjs/common';
import { type ClientGrpc } from '@nestjs/microservices';
import { Throttle } from '@nestjs/throttler';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { CORE_SERVICE } from '../config/services';
import { 
  CreateQuizDto, 
  FindAllQuizzesDto, 
  FindQuizResponsesDto 
} from './dto/quiz.dto';

interface CreateQuizRequest {
  bankId: number;
}

// gRPC service interface
interface QuizService {
  FindAllQuizzes(data: any): Promise<any>;
  FindOneQuiz(data: any): Promise<any>;
  FindQuizResponses(data: any): Promise<any>;
  FindQuizSummary(data: any): Promise<any>;
  CreateQuiz(data: any): Promise<any>;
  RemoveQuiz(data: any): Promise<any>;
}

@Controller('quiz')
@UseGuards(JwtAuthGuard)
export class QuizController implements OnModuleInit {
  private quizService: QuizService;

  constructor(
    @Inject(CORE_SERVICE) private readonly client: ClientGrpc,
  ) {}

  onModuleInit() {
    this.quizService = this.client.getService<QuizService>('QuizService');
  }

  @Get()
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Request() req?: any,
  ) {
    try {
      const userId = req.user.id;
      const findAllDto = {
        page: page ? parseInt(page) : 1,
        limit: limit ? parseInt(limit) : 10,
        userId,
      };

      return await this.quizService.FindAllQuizzes(findAllDto);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        error.message || 'Internal server error',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    try {
      const userId = req.user.id;

      return await this.quizService.FindOneQuiz({ id, userId });
    } catch (error) {
      if (error.message?.includes('not found')) {
        throw new HttpException(
          'Quiz not found or you do not have permission to access it',
          HttpStatus.NOT_FOUND,
        );
      }
      throw new HttpException(
        error.message || 'Internal server error',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id/responses')
  async findQuizResponses(
    @Param('id', ParseIntPipe) id: number,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Request() req?: any,
  ) {
    try {
      const userId = req.user.id;
      const findResponsesDto = {
        page: page ? parseInt(page) : 1,
        limit: limit ? parseInt(limit) : 10,
        quizId: id,
        userId,
      };

      return await this.quizService.FindQuizResponses(findResponsesDto);
    } catch (error) {
      if (error.message?.includes('not found')) {
        throw new HttpException(
          'Quiz not found or you do not have permission to access it',
          HttpStatus.NOT_FOUND,
        );
      }
      throw new HttpException(
        error.message || 'Internal server error',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id/summary')
  async findQuizSummary(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
  ) {
    try {
      const userId = req.user.id;

      return await this.quizService.FindQuizSummary({ id, userId });
    } catch (error) {
      if (error.message?.includes('not found')) {
        throw new HttpException(
          'Quiz not found or you do not have permission to access it',
          HttpStatus.NOT_FOUND,
        );
      }
      throw new HttpException(
        error.message || 'Internal server error',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post()
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 quiz creations per minute
  async create(
    @Body() createQuizRequest: CreateQuizRequest,
    @Request() req: any,
  ) {
    try {
      const userId = req.user.id;
      const createQuizDto = {
        bankId: createQuizRequest.bankId,
        userId,
      };

      return await this.quizService.CreateQuiz(createQuizDto);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        error.message || 'Internal server error',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    try {
      const userId = req.user.id;

      return await this.quizService.RemoveQuiz({ id, userId });
    } catch (error) {
      if (error.message?.includes('not found')) {
        throw new HttpException(
          'Quiz not found or you do not have permission to delete it',
          HttpStatus.NOT_FOUND,
        );
      }
      throw new HttpException(
        error.message || 'Internal server error',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
