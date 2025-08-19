import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { ContentEntryService } from './content-entry.service';
import {
  CreateContentEntryDto,
  ContentType,
} from './dto/create-content-entry.dto';
import { FindAllContentEntriesDto } from './dto/find-all-content-entries.dto';
import { CloneContentEntryDto } from './dto/clone-content-entry.dto';
import { Logger } from '@nestjs/common';

@Controller()
export class ContentEntryController {
  private readonly logger = new Logger(ContentEntryController.name);
  constructor(private readonly contentEntryService: ContentEntryService) {}

  @GrpcMethod('ContentEntryService', 'CreateContentEntry')
  create(data: {
    source_url?: string;
    content?: string;
    type: number;
    page_title?: string;
    bank_id: string;
    user_id: string;
    youtube_video_id?: string;
    youtube_video_duration?: number;
    youtube_channel_id?: string;
    youtube_channel_name?: string;
    youtube_avatar_url?: string;
  }) {
    this.logger.log(`Received create request: ${data.page_title}`);
    // Map gRPC enum to TypeScript enum
    const typeMap = {
      1: ContentType.SELECTED_TEXT,
      2: ContentType.FULL_HTML,
      3: ContentType.VIDEO_TRANSCRIPT,
    };

    const createDto: CreateContentEntryDto = {
      sourceUrl: data.source_url,
      content: data.content,
      type: typeMap[data.type] || ContentType.SELECTED_TEXT,
      pageTitle: data.page_title,
      bankId: data.bank_id,
      userId: data.user_id,
      youtubeVideoId: data.youtube_video_id,
      youtubeVideoDuration: data.youtube_video_duration,
      youtubeChannelId: data.youtube_channel_id,
      youtubeChannelName: data.youtube_channel_name,
      youtubeAvatarUrl: data.youtube_avatar_url,
    };
    return this.contentEntryService.create(createDto);
  }

  @GrpcMethod('ContentEntryService', 'FindAllContentEntries')
  findAll(data: {
    page?: number;
    limit?: number;
    name?: string;
    bank_id: string;
    user_id: string;
  }) {
    const findAllDto: FindAllContentEntriesDto = {
      page: data.page,
      limit: data.limit,
      name: data.name,
      bankId: data.bank_id,
      userId: data.user_id,
    };
    return this.contentEntryService.findAll(findAllDto);
  }

  @GrpcMethod('ContentEntryService', 'FindOneContentEntry')
  findOne(data: { id: string; user_id: string }) {
    return this.contentEntryService.findOne(data.id, data.user_id);
  }

  @GrpcMethod('ContentEntryService', 'CloneContentEntry')
  clone(data: { id: string; target_bank_id: string; user_id: string }) {
    const cloneDto: CloneContentEntryDto = {
      targetBankId: data.target_bank_id,
      userId: data.user_id,
    };
    return this.contentEntryService.clone(data.id, cloneDto);
  }

  @GrpcMethod('ContentEntryService', 'RemoveContentEntry')
  remove(data: { id: string; user_id: string }) {
    return this.contentEntryService.remove(data.id, data.user_id);
  }
}
