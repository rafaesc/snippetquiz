import { Controller, Sse, UseGuards, Req } from '@nestjs/common';
import { delay, map, Observable, interval } from 'rxjs';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { type FastifyRequest } from 'fastify';
import { envs } from '../config/envs';

@Controller('stream')
export class StreamController {
    @Sse('notification')
    stream(@Req() req: FastifyRequest): Observable<MessageEvent> {
        // Get user from request (set by JwtAuthGuard)
        const user = (req as any).user;

        return interval(15000).pipe(map(() => ({
            data: {
                seconds: 6,
                to: -13800,
                spriteURL: envs.characterSpriteUrl,
                text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce at dictum urna. Praesent ac velit nec dolor porttitor ornare. Integer felis lorem, laoreet sit amet facilisis vel, porta a metus.!"
            },
        } as MessageEvent)));
    }
}

interface MessageEvent {
    data: any;
    id?: string;
    type?: string;
    retry?: number;
}
