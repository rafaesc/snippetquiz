import { Injectable } from '@nestjs/common';
import { CreateContentEntryDto } from './dto/create-content-entry.dto';
import { UpdateContentEntryDto } from './dto/update-content-entry.dto';

@Injectable()
export class ContentEntryService {
  create(createContentEntryDto: CreateContentEntryDto) {
    return 'This action adds a new contentEntry';
  }

  findAll() {
    return `This action returns all contentEntry`;
  }

  findOne(id: number) {
    return `This action returns a #${id} contentEntry`;
  }

  update(id: number, updateContentEntryDto: UpdateContentEntryDto) {
    return `This action updates a #${id} contentEntry`;
  }

  remove(id: number) {
    return `This action removes a #${id} contentEntry`;
  }
}
