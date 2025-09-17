import {
  All,
  Controller,
  Req,
  Res,
  Post,
  UseGuards,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { type FastifyRequest, type FastifyReply } from 'fastify';
import { CoreServiceProxyService } from './core-service-proxy.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { Throttle } from '@nestjs/throttler';

@Controller('core')
@UseGuards(JwtAuthGuard)
export class CoreController {
  constructor(private readonly coreServiceProxy: CoreServiceProxyService) {}

  @Post('/content-banks')
  @Throttle({ default: { limit: 10, ttl: 60000 } }) // 10 content banks per minute
  async createContentBank(
    @Req() req: FastifyRequest,
    @Res() res: FastifyReply,
  ) {
    return await this.proxy(req, res);
  }

  @Post('/content-entry')
  @Throttle({ default: { limit: 10, ttl: 60000 } }) // 10 content entries per minute
  async createContentEntry(
    @Req() req: FastifyRequest,
    @Res() res: FastifyReply,
  ) {
    return await this.proxy(req, res);
  }

  @Post('/content-entry/:id/clone-to/:targetBankId')
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 clone operations per minute
  async cloneContentEntry(
    @Req() req: FastifyRequest,
    @Res() res: FastifyReply,
  ) {
    return await this.proxy(req, res);
  }

  @Post('/quiz')
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 per day 8640000
  async createQuiz(@Req() req: FastifyRequest, @Res() res: FastifyReply) {
    return await this.proxy(req, res);
  }

  @All('*')
  async proxy(@Req() req: FastifyRequest, @Res() res: FastifyReply) {
    await this.coreServiceProxy.handleProxy(req, res);
  }
}
