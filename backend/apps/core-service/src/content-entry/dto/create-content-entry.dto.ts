import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsNumberString,
  IsNumber,
} from 'class-validator';

export enum ContentType {
  SELECTED_TEXT = 'selected_text',
  FULL_HTML = 'full_html',
  VIDEO_TRANSCRIPT = 'video_transcript',
}

export class CreateContentEntryDto {
  @IsOptional()
  @IsString()
  sourceUrl?: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsEnum(ContentType)
  @IsNotEmpty()
  type: ContentType;

  @IsOptional()
  @IsString()
  pageTitle?: string;

  @IsNumberString()
  @IsNotEmpty()
  bankId: string;

  @IsString()
  @IsNotEmpty()
  userId: string;

  // YouTube-related optional fields
  @IsOptional()
  @IsString()
  youtubeVideoId?: string;

  @IsOptional()
  @IsNumber()
  youtubeVideoDuration?: number;

  @IsOptional()
  @IsString()
  youtubeChannelId?: string;

  @IsOptional()
  @IsString()
  youtubeChannelName?: string;

  @IsOptional()
  @IsString()
  youtubeAvatarUrl?: string;
}
