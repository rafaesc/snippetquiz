import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Body, 
  Param, 
  Query, 
  Inject, 
  UseGuards,
  Request,
  HttpStatus,
  HttpException
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { CORE_SERVICE } from '../config/services';
import { JwtAuthGuard } from '../guards/jwt-auth.guard'; // Assuming you have this guard
import { firstValueFrom } from 'rxjs';
import { IsString, IsNotEmpty, MaxLength, IsOptional } from 'class-validator';

// DTOs for request validation
class CreateContentBankDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;
}

class UpdateContentBankDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;
}

class DuplicateContentBankDto {
  @IsString()
  @IsOptional()
  @MaxLength(100)
  name?: string;
}

interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    email: string;
  };
}

@Controller('content-bank')
@UseGuards(JwtAuthGuard)
export class ContentBankController {
  constructor(
    @Inject(CORE_SERVICE) private readonly coreServiceClient: ClientProxy
  ) {}

  // GET /content-banks - Get all content banks with pagination
  @Get()
  async findAll(
    @Request() req: AuthenticatedRequest,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('name') name?: string
  ) {
    try {
      // Validate and parse query parameters
      const pageNum = page ? parseInt(page, 10) : 1;
      const limitNum = limit ? parseInt(limit, 10) : 10;
      
      // Validate parsed numbers
      if (page && (isNaN(pageNum) || pageNum < 1)) {
        throw new HttpException('Page must be a positive number', HttpStatus.BAD_REQUEST);
      }
      
      if (limit && (isNaN(limitNum) || limitNum < 1 || limitNum > 100)) {
        throw new HttpException('Limit must be a positive number between 1 and 100', HttpStatus.BAD_REQUEST);
      }
      
      // Validate userId
      if (!req.user?.id) {
        throw new HttpException('User ID is required', HttpStatus.UNAUTHORIZED);
      }
  
      const findAllDto = {
        userId: req.user.id,
        page: pageNum,
        limit: limitNum,
        ...(name && name.trim() && { name: name.trim() })
      };
  
      const result = await firstValueFrom(
        this.coreServiceClient.send('findAllContentBank', findAllDto)
      );
  
      return result;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      
      // Handle RPC exceptions from microservice
      if (error.status) {
        throw new HttpException(
          error.message || 'Microservice error',
          error.status
        );
      }
      
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // GET /content-banks/:id - Get specific content bank
  @Get(':id')
  async findOne(
    @Request() req: AuthenticatedRequest,
    @Param('id') id: string
  ) {
    try {
      const result = await firstValueFrom(
        this.coreServiceClient.send('findOneContentBank', {
          id,
          userId: req.user.id
        })
      );

      return result;
    } catch (error) {
      throw new HttpException(
        error.message || 'Internal server error',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // POST /content-banks - Create new content bank
  @Post()
  async create(
    @Request() req: AuthenticatedRequest,
    @Body() createContentBankDto: CreateContentBankDto
  ) {
    try {
      // Validation
      if (!createContentBankDto.name || createContentBankDto.name.trim().length === 0) {
        throw new HttpException('Content bank name is required', HttpStatus.BAD_REQUEST);
      }

      if (createContentBankDto.name.length > 100) {
        throw new HttpException(
          'Content bank name must be 100 characters or less',
          HttpStatus.BAD_REQUEST
        );
      }

      const createDto = {
        name: createContentBankDto.name.trim(),
        userId: req.user.id
      };

      const result = await firstValueFrom(
        this.coreServiceClient.send('createContentBank', createDto)
      );

      return result;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      
      // Handle microservice errors
      if (error.message?.includes('already exists')) {
        throw new HttpException(
          'A content bank with this name already exists',
          HttpStatus.CONFLICT
        );
      }

      throw new HttpException(
        error.message || 'Internal server error',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // PUT /content-banks/:id - Update content bank
  @Put(':id')
  async update(
    @Request() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() updateContentBankDto: UpdateContentBankDto
  ) {
    try {
      // Validation
      if (!updateContentBankDto.name || updateContentBankDto.name.trim().length === 0) {
        throw new HttpException('Content bank name is required', HttpStatus.BAD_REQUEST);
      }

      if (updateContentBankDto.name.length > 100) {
        throw new HttpException(
          'Content bank name must be 100 characters or less',
          HttpStatus.BAD_REQUEST
        );
      }

      const updateDto = {
        id,
        name: updateContentBankDto.name.trim(),
        userId: req.user.id
      };

      const result = await firstValueFrom(
        this.coreServiceClient.send('updateContentBank', updateDto)
      );

      return result;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      // Handle microservice errors
      if (error.message?.includes('not found')) {
        throw new HttpException(
          'Content bank not found or does not belong to user',
          HttpStatus.NOT_FOUND
        );
      }

      if (error.message?.includes('already exists')) {
        throw new HttpException(
          'A content bank with this name already exists',
          HttpStatus.CONFLICT
        );
      }

      throw new HttpException(
        error.message || 'Internal server error',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // DELETE /content-banks/:id - Delete content bank
  @Delete(':id')
  async remove(
    @Request() req: AuthenticatedRequest,
    @Param('id') id: string
  ) {
    try {
      const result = await firstValueFrom(
        this.coreServiceClient.send('removeContentBank', {
          id,
          userId: req.user.id
        })
      );

      return result;
    } catch (error) {
      if (error.message?.includes('not found')) {
        throw new HttpException(
          'Content bank not found or does not belong to user',
          HttpStatus.NOT_FOUND
        );
      }

      throw new HttpException(
        error.message || 'Internal server error',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // POST /content-banks/:id/duplicate - Duplicate content bank
  @Post(':id/duplicate')
  async duplicate(
    @Request() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() duplicateContentBankDto: DuplicateContentBankDto
  ) {
    try {
      // Validate new name if provided
      if (duplicateContentBankDto.name && duplicateContentBankDto.name.length > 100) {
        throw new HttpException(
          'Content bank name must be 100 characters or less',
          HttpStatus.BAD_REQUEST
        );
      }

      const duplicateDto = {
        name: duplicateContentBankDto.name?.trim()
      };

      const result = await firstValueFrom(
        this.coreServiceClient.send('duplicateContentBank', {
          id,
          userId: req.user.id,
          duplicateDto
        })
      );

      return result;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      // Handle microservice errors
      if (error.message?.includes('not found')) {
        throw new HttpException(
          'Content bank not found or does not belong to user',
          HttpStatus.NOT_FOUND
        );
      }

      if (error.message?.includes('already exists')) {
        throw new HttpException(
          'A content bank with this name already exists',
          HttpStatus.CONFLICT
        );
      }

      throw new HttpException(
        error.message || 'Internal server error',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
