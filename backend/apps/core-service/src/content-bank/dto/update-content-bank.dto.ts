import { PartialType } from '@nestjs/mapped-types';
import { CreateContentBankDto } from './create-content-bank.dto';
import { IsString } from 'class-validator';

export class UpdateContentBankDto extends PartialType(CreateContentBankDto) {
  @IsString()
  id: string; // BigInt as string for JSON serialization
}
