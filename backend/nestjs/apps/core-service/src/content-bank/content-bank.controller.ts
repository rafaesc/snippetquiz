import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { ContentBankService } from './content-bank.service';
import { CreateContentBankDto } from './dto/create-content-bank.dto';
import { UpdateContentBankDto } from './dto/update-content-bank.dto';
import { DuplicateContentBankDto } from './dto/duplicate-content-bank.dto';
import { FindAllContentBanksDto } from './dto/find-all-content-banks.dto';

@Controller()
export class ContentBankController {
  constructor(private readonly contentBankService: ContentBankService) {}

  @GrpcMethod('ContentBankService', 'CreateContentBank')
  create(data: { name: string; user_id: string }) {
    const createDto: CreateContentBankDto = {
      name: data.name,
      userId: data.user_id,
    };
    return this.contentBankService.create(createDto);
  }

  @GrpcMethod('ContentBankService', 'FindAllContentBanks')
  async findAll(data: { page?: number; limit?: number; name?: string; user_id: string }) {    
    // Add validation
    if (!data.user_id || data.user_id.trim() === '') {
      throw new Error('user_id is required and cannot be empty');
    }
    
    const findAllDto: FindAllContentBanksDto = {
      page: data.page,
      limit: data.limit,
      name: data.name,
      userId: data.user_id,
    };
    
    return this.contentBankService.findAll(findAllDto);
  }

  @GrpcMethod('ContentBankService', 'FindOneContentBank')
  findOne(data: { id: string; user_id: string }) {
    return this.contentBankService.findOne(data.id, data.user_id);
  }

  @GrpcMethod('ContentBankService', 'UpdateContentBank')
  update(data: { id: string; name?: string; user_id: string }) {
    const updateDto: UpdateContentBankDto = {
      id: data.id,
      name: data.name,
      userId: data.user_id,
    };
    return this.contentBankService.update(data.id, updateDto);
  }

  @GrpcMethod('ContentBankService', 'RemoveContentBank')
  remove(data: { id: string; user_id: string }) {
    return this.contentBankService.remove(data.id, data.user_id);
  }

  @GrpcMethod('ContentBankService', 'DuplicateContentBank')
  duplicate(data: { id: string; user_id: string; name?: string }) {
    const duplicateDto: DuplicateContentBankDto = {
      name: data.name,
    };
    return this.contentBankService.duplicate(data.id, data.user_id, duplicateDto);
  }
}
