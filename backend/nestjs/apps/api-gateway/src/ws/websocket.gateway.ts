import {
  WebSocketGateway,
  SubscribeMessage,
  WebSocketServer,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket as ServerSocket } from 'socket.io';
import { envs } from '../config/envs';
import { CORE_SERVICE } from '../config/services';
import { Inject, Logger, OnModuleInit, UseGuards } from '@nestjs/common';
import { type ClientGrpc } from '@nestjs/microservices';
import {
  GenerateQuizByBankRequest,
  QuizGenerationProgress,
  CoreQuizGenerationService,
} from './websocket.dto';
import { WsJwtAuthGuard } from '../guards/ws-jwt-auth.guard';
import { RedisService } from '../../../commons/services/redis.service';
import { WsRateLimitGuard } from '../guards/ws-rate-limit.guard';

@WebSocketGateway({
  namespace: '/api/ws',
  path: '/api/ws',
  cors: {
    origin: envs.allowedOrigins.split(','),
    credentials: true,
  },
  transports: ['websocket'],
})
export class WebsocketGateway implements OnModuleInit {
  @WebSocketServer()
  io: Server;

  private logger = new Logger(WebsocketGateway.name);

  private coreQuizGenerationService: CoreQuizGenerationService;

  constructor(
    @Inject(CORE_SERVICE) private readonly coreClient: ClientGrpc,
    private readonly redisService: RedisService,
  ) {}

  onModuleInit() {
    this.coreQuizGenerationService =
      this.coreClient.getService<CoreQuizGenerationService>(
        'CoreQuizGenerationService',
      );
  }

  @UseGuards(WsJwtAuthGuard, WsRateLimitGuard)
  @SubscribeMessage('generateQuiz')
  async handleGenerateQuiz(
    @MessageBody() rawData: string,
    @ConnectedSocket() client: ServerSocket,
  ) {
    try {
      const userId = (client as any).data?.userId;
      const data = JSON.parse(rawData);

      const request: GenerateQuizByBankRequest = {
        bankId: data.bankId,
        userId,
      };
      this.logger.log(
        `Generate quiz request received for bank ID: ${JSON.stringify(request)}`,
      );

      // Use Redis lock to prevent concurrent quiz generation for the same user
      const lockKey = `quiz-generation:${userId}`;

      await this.redisService.withLock(lockKey, async () => {
        const quizStream =
          this.coreQuizGenerationService.generateQuizByBank(request);

        quizStream.subscribe({
          next: (progress: QuizGenerationProgress) => {
            client.emit('quizProgress', progress);
          },
          error: (error) => {
            client.emit('quizError', {
              message: 'Failed to generate quiz',
              error: error.message,
            });
            this.redisService.releaseLock(lockKey);
          },
          complete: () => {
            client.emit('quizComplete', {
              message: 'Quiz generation completed successfully',
            });
            this.redisService.releaseLock(lockKey);
            client.disconnect();
          },
        });
      });
    } catch (error) {
      this.logger.error(`Error generating quiz for bank ID: ${error.message}`);

      if (error.message.includes('already locked')) {
        client.emit('quizError', {
          message:
            'Quiz generation is already in progress for this user',
          error: 'Resource locked',
        });
      } else {
        client.emit('quizError', {
          message: 'Failed to generate quiz',
          error: error.message,
        });
      }
      client.disconnect();
    }
  }
}
