import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ContentEntryService } from './content-entry.service';
import { CreateContentEntryDto } from './dto/create-content-entry.dto';
import { UpdateContentEntryDto } from './dto/update-content-entry.dto';

@Controller()
export class ContentEntryController {
  constructor(private readonly contentEntryService: ContentEntryService) {}

  @MessagePattern('createContentEntry')
  create(@Payload() createContentEntryDto: CreateContentEntryDto) {
    return this.contentEntryService.create(createContentEntryDto);
  }

  @MessagePattern('findAllContentEntry')
  findAll() {
    return this.contentEntryService.findAll();
  }

  @MessagePattern('findOneContentEntry')
  findOne(@Payload() id: number) {
    return this.contentEntryService.findOne(id);
  }

  @MessagePattern('updateContentEntry')
  update(@Payload() updateContentEntryDto: UpdateContentEntryDto) {
    return this.contentEntryService.update(updateContentEntryDto.id, updateContentEntryDto);
  }

  @MessagePattern('removeContentEntry')
  remove(@Payload() id: number) {
    return this.contentEntryService.remove(id);
  }
}
