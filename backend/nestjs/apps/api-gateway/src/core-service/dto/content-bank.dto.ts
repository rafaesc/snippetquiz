import { IsString, IsNotEmpty, MaxLength, IsOptional } from 'class-validator';

export class CreateContentBankDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;
}

export class UpdateContentBankDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;
}

export class DuplicateContentBankDto {
  @IsString()
  @IsOptional()
  @MaxLength(100)
  name?: string;
}