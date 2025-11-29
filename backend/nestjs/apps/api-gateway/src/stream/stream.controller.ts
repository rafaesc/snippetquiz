import { Controller, Sse, UseGuards, Req, OnModuleInit, Logger } from '@nestjs/common';
import { Observable, Subject, finalize } from 'rxjs';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { type FastifyRequest } from 'fastify';
import { RedisService } from '../../../commons/services/redis.service';

@Controller('stream')
@UseGuards(JwtAuthGuard)
export class StreamController implements OnModuleInit {
    private readonly logger = new Logger(StreamController.name);
    private readonly clients = new Map<string, Subject<MessageEvent>>();
    private NOTIFICATION_CONNECTION_TIMEOUT = 5 * 60 * 1000;

    private readonly timeouts = new Map<string, NodeJS.Timeout>();

    constructor(private readonly redisService: RedisService) { }

    onModuleInit() {
        this.redisService.subscribeToPattern('character.message.ephemeral:*', (raw, channel) => {
            const channelParts = channel.split(':'); // channel = character.message.ephemeral:user-id:123
            if (channelParts.length < 3) {
                this.logger.error(`Invalid channel format: ${channel}`);
                return;
            }
            const userId = channelParts[2];
            const subject = this.clients.get(userId);
            this.logger.log(`Received character message for user - ${userId}`);

            if (subject) {
                try {
                    const data = JSON.parse(raw);
                    subject.next({
                        data: {
                            text: data.characterMessage,
                            spriteURL: data.characterSpriteURL,
                            to: data.characterAnimateTo,
                            seconds: data.characterAnimateSeconds,
                        },
                    } as MessageEvent);
                } catch (error) {
                    this.logger.error(`Error parsing character message: ${error.message}`);
                }
            }
        });
    }

    @Sse('notification')
    stream(@Req() req: FastifyRequest): Observable<MessageEvent> {
        // Get user from request (set by JwtAuthGuard)
        const user = (req as any).user;
        const userId = user.id;

        this.logger.log(`Client connected to stream: ${userId}`);

        let subject = this.clients.get(userId);

        if (!subject) {
            subject = new Subject<MessageEvent>();
            this.clients.set(userId, subject);
        }

        // Clear existing timeout if any (refreshing connection)
        if (this.timeouts.has(userId)) {
            clearTimeout(this.timeouts.get(userId));
            this.timeouts.delete(userId);
        }

        // Set 5-minute timeout
        const timeout = setTimeout(() => {
            this.logger.log(`Stream timeout for user: ${userId}`);
            if (subject) {
                subject.complete();
            }
            this.clients.delete(userId);
            this.timeouts.delete(userId);
        }, this.NOTIFICATION_CONNECTION_TIMEOUT);

        this.timeouts.set(userId, timeout);

        return subject.asObservable().pipe(
            finalize(() => {
                this.logger.log(`Client disconnected from stream: ${userId}`);
                if (this.timeouts.has(userId)) {
                    clearTimeout(this.timeouts.get(userId));
                    this.timeouts.delete(userId);
                }
            })
        );
    }
}

interface MessageEvent {
    data: any;
    id?: string;
    type?: string;
    retry?: number;
}
