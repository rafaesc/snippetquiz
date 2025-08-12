import { IsString, IsOptional, IsNumberString, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class FindAllContentEntriesDto {
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @IsOptional()
  @IsString()
  name?: string;

  @IsNumberString()
  bankId: string;

  @IsString()
  userId: string;
}