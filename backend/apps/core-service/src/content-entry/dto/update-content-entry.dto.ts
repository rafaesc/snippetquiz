import { PartialType } from '@nestjs/mapped-types';
import { CreateContentEntryDto } from './create-content-entry.dto';

export class UpdateContentEntryDto extends PartialType(CreateContentEntryDto) {
  id: number;
}
