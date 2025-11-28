import { Controller, Post, Body } from '@nestjs/common';
import { CodeService } from './code.service';
import {
  GenerateCodeResponseDto,
  ResolveCodeDto,
  AuthResponseDto,
} from 'apps/commons/types';

@Controller('code')
export class CodeController {
  constructor(private readonly codeService: CodeService) { }

  @Post('generate')
  async generateCode(
    @Body('userId') userId: string,
  ): Promise<GenerateCodeResponseDto> {
    return this.codeService.generateCode(userId);
  }

  @Post('resolve')
  async resolveCode(
    @Body() resolveCodeDto: ResolveCodeDto,
  ): Promise<AuthResponseDto> {
    return this.codeService.resolveCode(resolveCodeDto);
  }
}
