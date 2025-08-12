import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class CreateContentBankDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @IsString()
  @IsNotEmpty()
  userId: string;
}