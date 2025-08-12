import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CodeService } from './code.service';
import { GenerateCodeResponseDto, ResolveCodeDto, AuthResponseDto } from 'apps/commons';

@Controller()
export class CodeController {
  constructor(private readonly codeService: CodeService) {}

  @MessagePattern('auth.generateCode')
  async generateCode(@Payload() userId: string): Promise<GenerateCodeResponseDto> {
    return this.codeService.generateCode(userId);
  }

  @MessagePattern('auth.resolveCode')
  async resolveCode(@Payload() resolveCodeDto: ResolveCodeDto): Promise<AuthResponseDto> {
    return this.codeService.resolveCode(resolveCodeDto);
  }
}
