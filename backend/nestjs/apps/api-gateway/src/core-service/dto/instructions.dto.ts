import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class UpdateInstructionDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  instruction: string;
}