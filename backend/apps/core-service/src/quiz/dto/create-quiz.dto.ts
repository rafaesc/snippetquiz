import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateQuizDto {
  @IsNotEmpty()
  @IsNumber()
  bankId: number;
}