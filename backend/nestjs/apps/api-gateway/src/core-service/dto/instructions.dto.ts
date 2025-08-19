import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class UpdateInstructionDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(5000)
  instruction: string;
}