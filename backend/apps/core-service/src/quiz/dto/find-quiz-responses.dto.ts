import { IsOptional, IsNumber, Min, IsString, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

export class FindQuizResponsesDto {
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

  @IsNumber()
  @IsNotEmpty()
  quizId: number;

  
  @IsString()
  @IsNotEmpty()
  userId: string;
}