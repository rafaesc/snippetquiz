import {
    All,
    Controller,
    Req,
    Res,
    UseGuards,
} from '@nestjs/common';
import { type FastifyRequest, type FastifyReply } from 'fastify';
import { AiContentServiceProxyService } from './ai-content-service-proxy.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@Controller('ai-content')
@UseGuards(JwtAuthGuard)
export class AiContentController {
    constructor(private readonly aiContentServiceProxy: AiContentServiceProxyService) { }

    @All('*')
    async proxy(@Req() req: FastifyRequest, @Res() res: FastifyReply) {
        await this.aiContentServiceProxy.handleProxy(req, res);
    }
}
