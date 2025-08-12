import { IsString, IsNotEmpty, IsNumberString } from 'class-validator';

export class CloneContentEntryDto {
  @IsNumberString()
  @IsNotEmpty()
  targetBankId: string;

  @IsString()
  @IsNotEmpty()
  userId: string;
}