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
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Throttle } from '@nestjs/throttler';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { catchError, firstValueFrom } from 'rxjs';
import { CORE_SERVICE } from '../config/services';

interface CreateQuizRequest {
  bankId: number;
}

@Controller('quiz')
@UseGuards(JwtAuthGuard)
export class QuizController {
  constructor(
    @Inject(CORE_SERVICE) private readonly coreServiceClient: ClientProxy,
  ) {}

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

      return await firstValueFrom(
        this.coreServiceClient.send('quiz.findAll', findAllDto).pipe(
          catchError((error) => {
            throw new HttpException(
              error.message || 'Internal server error',
              error.status || HttpStatus.INTERNAL_SERVER_ERROR,
            );
          }),
        ),
      );
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

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    try {
      const userId = req.user.id;

      return await firstValueFrom(
        this.coreServiceClient.send('quiz.findOne', { id, userId }).pipe(
          catchError((error) => {
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
          }),
        ),
      );
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

      return await firstValueFrom(
        this.coreServiceClient
          .send('quiz.findResponses', findResponsesDto)
          .pipe(
            catchError((error) => {
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
            }),
          ),
      );
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

  @Get(':id/summary')
  async findQuizSummary(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
  ) {
    try {
      const userId = req.user.id;

      return await firstValueFrom(
        this.coreServiceClient.send('quiz.findSummary', { id, userId }).pipe(
          catchError((error) => {
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
          }),
        ),
      );
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
      };

      return await firstValueFrom(
        this.coreServiceClient
          .send('quiz.create', { createQuizDto, userId })
          .pipe(
            catchError((error) => {
              throw new HttpException(
                error.message || 'Internal server error',
                error.status || HttpStatus.INTERNAL_SERVER_ERROR,
              );
            }),
          ),
      );
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

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    try {
      const userId = req.user.id;

      return await firstValueFrom(
        this.coreServiceClient.send('quiz.remove', { id, userId }).pipe(
          catchError((error) => {
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
          }),
        ),
      );
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
