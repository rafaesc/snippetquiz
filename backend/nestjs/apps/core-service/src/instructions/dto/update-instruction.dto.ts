import { IsString, IsNotEmpty, MaxLength, IsOptional } from 'class-validator';

export class UpdateInstructionDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(5000)
  instruction: string;
}
