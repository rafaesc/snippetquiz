import { IsString, IsOptional, MaxLength } from 'class-validator';

export class DuplicateContentBankDto {
  @IsString()
  @IsOptional()
  @MaxLength(100)
  name?: string;
}