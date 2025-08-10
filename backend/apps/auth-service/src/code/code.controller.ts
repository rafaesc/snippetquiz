import { Controller, Post, Body, UseGuards, Request, HttpCode, HttpStatus, Res } from '@nestjs/common';
import { type FastifyReply } from 'fastify';
import { CodeService } from './code.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { GenerateCodeResponseDto, ResolveCodeDto, AuthResponseDto } from '../dto/auth.dto';
import { envs } from '../config/envs';

@Controller('code')
export class CodeController {
  constructor(private readonly codeService: CodeService) {}

  @Post('generate')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async generateCode(@Request() req: any): Promise<GenerateCodeResponseDto> {
    const userId = req.user.id;
    return this.codeService.generateCode(userId);
  }

  @Post('resolve')
  @HttpCode(HttpStatus.OK)
  async resolveCode(
    @Body() resolveCodeDto: ResolveCodeDto,
    @Res({ passthrough: true }) response: FastifyReply
  ): Promise<AuthResponseDto> {
    const result = await this.codeService.resolveCode(resolveCodeDto);
    
    // Set tokens in cookies if they exist
    if (result.tokens) {
      response.setCookie('accessToken', result.tokens.accessToken, {
        httpOnly: true,
        secure: envs.isProduction,
        sameSite: 'lax',
        maxAge: 15 * 60 * 1000 // 15 minutes
      });
      
      response.setCookie('refreshToken', result.tokens.refreshToken, {
        httpOnly: true,
        secure: envs.isProduction,
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });
    }
    
    return result;
  }
}
