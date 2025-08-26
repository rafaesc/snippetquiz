import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class CreateInstructionDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  instruction: string;

  @IsString()
  @IsNotEmpty()
  userId: string;
}
