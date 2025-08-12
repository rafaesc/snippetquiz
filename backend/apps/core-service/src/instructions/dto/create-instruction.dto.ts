import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class CreateInstructionDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(5000)
  instruction: string;

  @IsString()
  @IsNotEmpty()
  userId: string;
}