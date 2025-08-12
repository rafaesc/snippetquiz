import { IsOptional, IsNumber, Min, IsString, IsNotEmpty } from 'class-validator';

import { Type } from 'class-transformer';

export class FindAllQuizzesDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 10;

  @IsString()
  @IsNotEmpty()
  userId: string;
}