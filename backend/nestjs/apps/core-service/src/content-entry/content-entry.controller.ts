import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ContentEntryService } from './content-entry.service';
import { CreateContentEntryDto } from './dto/create-content-entry.dto';
import { FindAllContentEntriesDto } from './dto/find-all-content-entries.dto';
import { CloneContentEntryDto } from './dto/clone-content-entry.dto';

@Controller()
export class ContentEntryController {
  constructor(private readonly contentEntryService: ContentEntryService) {}

  @MessagePattern('createContentEntry')
  create(@Payload() createContentEntryDto: CreateContentEntryDto) {
    return this.contentEntryService.create(createContentEntryDto);
  }

  @MessagePattern('findAllContentEntries')
  findAll(@Payload() findAllDto: FindAllContentEntriesDto) {
    return this.contentEntryService.findAll(findAllDto);
  }

  @MessagePattern('findOneContentEntry')
  findOne(@Payload() payload: { id: string; userId: string }) {
    return this.contentEntryService.findOne(payload.id, payload.userId);
  }

  @MessagePattern('cloneContentEntry')
  clone(@Payload() payload: { id: string; cloneDto: CloneContentEntryDto }) {
    return this.contentEntryService.clone(payload.id, payload.cloneDto);
  }

  @MessagePattern('removeContentEntry')
  remove(@Payload() payload: { id: string; userId: string }) {
    return this.contentEntryService.remove(payload.id, payload.userId);
  }
}
