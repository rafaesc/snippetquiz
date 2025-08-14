import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ContentBankService } from './content-bank.service';
import { CreateContentBankDto } from './dto/create-content-bank.dto';
import { UpdateContentBankDto } from './dto/update-content-bank.dto';
import { DuplicateContentBankDto } from './dto/duplicate-content-bank.dto';
import { FindAllContentBanksDto } from './dto/find-all-content-banks.dto';

@Controller()
export class ContentBankController {
  constructor(private readonly contentBankService: ContentBankService) {}

  @MessagePattern('createContentBank')
  create(@Payload() createContentBankDto: CreateContentBankDto) {
    return this.contentBankService.create(createContentBankDto);
  }

  @MessagePattern('findAllContentBank')
  findAll(@Payload() findAllDto: FindAllContentBanksDto) {
    return this.contentBankService.findAll(findAllDto);
  }

  @MessagePattern('findOneContentBank')
  findOne(@Payload() payload: { id: string; userId: string }) {
    return this.contentBankService.findOne(payload.id, payload.userId);
  }

  @MessagePattern('updateContentBank')
  update(@Payload() updateContentBankDto: UpdateContentBankDto) {
    return this.contentBankService.update(
      updateContentBankDto.id,
      updateContentBankDto,
    );
  }

  @MessagePattern('removeContentBank')
  remove(@Payload() payload: { id: string; userId: string }) {
    return this.contentBankService.remove(payload.id, payload.userId);
  }

  @MessagePattern('duplicateContentBank')
  duplicate(
    @Payload()
    payload: {
      id: string;
      userId: string;
      duplicateDto: DuplicateContentBankDto;
    },
  ) {
    return this.contentBankService.duplicate(
      payload.id,
      payload.userId,
      payload.duplicateDto,
    );
  }
}
