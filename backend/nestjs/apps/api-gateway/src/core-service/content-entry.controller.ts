import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  Body,
  Request,
  UseGuards,
  HttpException,
  HttpStatus,
  Inject,
  OnModuleInit,
  Logger,
} from '@nestjs/common';
import { type ClientGrpc } from '@nestjs/microservices';
import { Throttle } from '@nestjs/throttler';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { CORE_SERVICE } from '../config/services';
import type { 
  CreateContentEntryDto, 
  CloneContentEntryDto, 
  ContentType 
} from './dto/content-entry.dto';
import type { AuthenticatedRequest } from './dto/common.dto';


// gRPC service interface
interface ContentEntryService {
  FindAllContentEntries(data: any): Promise<any>;
  FindOneContentEntry(data: any): Promise<any>;
  CreateContentEntry(data: any): Promise<any>;
  CloneContentEntry(data: any): Promise<any>;
  RemoveContentEntry(data: any): Promise<any>;
}

@Controller('content-entry')
@UseGuards(JwtAuthGuard)
export class ContentEntryController implements OnModuleInit {
  private contentEntryService: ContentEntryService;
  private readonly logger = new Logger(ContentEntryController.name);

  constructor(
    @Inject(CORE_SERVICE) private readonly client: ClientGrpc,
  ) {}

  onModuleInit() {
    this.contentEntryService = this.client.getService<ContentEntryService>('ContentEntryService');
  }

  // GET /content-entry/bank/:bankId - Get all content entries for a bank
  @Get('bank/:bankId')
  async findAll(
    @Request() req: AuthenticatedRequest,
    @Param('bankId') bankId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('name') name?: string,
  ) {
    try {
      const pageNum = page ? parseInt(page, 10) : 1;
      const limitNum = limit ? parseInt(limit, 10) : 10;

      if (page && (isNaN(pageNum) || pageNum < 1)) {
        throw new HttpException(
          'Page must be a positive number',
          HttpStatus.BAD_REQUEST,
        );
      }

      if (limit && (isNaN(limitNum) || limitNum < 1 || limitNum > 100)) {
        throw new HttpException(
          'Limit must be between 1 and 100',
          HttpStatus.BAD_REQUEST,
        );
      }

      const findAllDto = {
        userId: req.user.id,
        bankId: bankId,
        page: pageNum,
        limit: limitNum,
        ...(name && name.trim() && { name: name.trim() }),
      };

      const result = await this.contentEntryService.FindAllContentEntries(findAllDto);

      return result;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      if (error.status) {
        throw new HttpException(
          error.message || 'Microservice error',
          error.status,
        );
      }

      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // GET /content-entry/:id - Get specific content entry
  @Get(':id')
  async findOne(@Request() req: AuthenticatedRequest, @Param('id') id: string) {
    try {
      const result = await this.contentEntryService.FindOneContentEntry({
        id,
        userId: req.user.id,
      });

      return result;
    } catch (error) {
      throw new HttpException(
        error.message || 'Internal server error',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // POST /content-entry - Create new content entry
  @Post()
  @Throttle({ default: { limit: 10, ttl: 60000 } }) // 10 content entries per minute
  async create(
    @Request() req: AuthenticatedRequest,
    @Body() createContentEntryDto: CreateContentEntryDto,
  ) {
      this.logger.log(`Init create request`); 
    try {
      // Validation
      if (
        !createContentEntryDto.type ||
        !['full_html', 'selected_text', 'video_transcript'].includes(
          createContentEntryDto.type,
        )
      ) {
        throw new HttpException(
          'Type must be either "full_html", "selected_text" or "video_transcript"',
          HttpStatus.BAD_REQUEST,
        );
      }

      if (!createContentEntryDto.bankId) {
        throw new HttpException('Bank ID is required', HttpStatus.BAD_REQUEST);
      }

      if (
        createContentEntryDto.type === 'full_html' &&
        !createContentEntryDto.sourceUrl
      ) {
        throw new HttpException(
          'Source URL is required when type is "full_html"',
          HttpStatus.BAD_REQUEST,
        );
      }

      if (
        createContentEntryDto.type === 'selected_text' &&
        !createContentEntryDto.content
      ) {
        throw new HttpException(
          'Content is required when type is "selected_text"',
          HttpStatus.BAD_REQUEST,
        );
      }

      if (
        createContentEntryDto.type === 'video_transcript' &&
        !createContentEntryDto.sourceUrl
      ) {
        throw new HttpException(
          'Source URL is required when type is "video_transcript"',
          HttpStatus.BAD_REQUEST,
        );
      }

      const createDto = {
        sourceUrl: createContentEntryDto.sourceUrl,
        content: createContentEntryDto.content,
        type: createContentEntryDto.type,
        pageTitle: createContentEntryDto.pageTitle,
        bankId: createContentEntryDto.bankId,
        youtubeVideoId: createContentEntryDto.youtubeVideoId,
        youtubeVideoDuration: createContentEntryDto.youtubeVideoDuration,
        youtubeChannelId: createContentEntryDto.youtubeChannelId,
        youtubeChannelName: createContentEntryDto.youtubeChannelName,
        youtubeAvatarUrl: createContentEntryDto.youtubeAvatarUrl,
        userId: req.user.id,
      };

      this.logger.log(`Received create request: ${createDto.pageTitle} - ${createDto.type}`); 

      const result = await this.contentEntryService.CreateContentEntry(createDto);

      return result;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      if (error.message?.includes('not found')) {
        throw new HttpException(
          'Content bank not found or does not belong to user',
          HttpStatus.NOT_FOUND,
        );
      }

      throw new HttpException(
        error.message || 'Internal server error',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // POST /content-entry/:id/clone-to/:targetBankId - Clone content entry
  @Post(':id/clone-to/:targetBankId')
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 clone operations per minute
  async clone(
    @Request() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Param('targetBankId') targetBankId: string,
  ) {
    try {
      const cloneDto = {
        id,
        targetBankId: targetBankId,
        userId: req.user.id,
      };

      const result = await this.contentEntryService.CloneContentEntry(cloneDto);

      return result;
    } catch (error) {
      if (error.message?.includes('not found')) {
        throw new HttpException(
          'Content entry or target bank not found',
          HttpStatus.NOT_FOUND,
        );
      }

      if (error.message?.includes('already exists')) {
        throw new HttpException(
          'Content entry already exists in the target bank',
          HttpStatus.CONFLICT,
        );
      }

      throw new HttpException(
        error.message || 'Internal server error',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // DELETE /content-entry/:id - Delete content entry
  @Delete(':id')
  async remove(@Request() req: AuthenticatedRequest, @Param('id') id: string) {
    try {
      const result = await this.contentEntryService.RemoveContentEntry({
        id,
        userId: req.user.id,
      });

      return result;
    } catch (error) {
      if (error.message?.includes('not found')) {
        throw new HttpException(
          'Content entry not found or does not belong to user',
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
