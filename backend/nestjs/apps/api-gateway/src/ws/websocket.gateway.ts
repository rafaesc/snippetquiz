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

  constructor(@Inject(CORE_SERVICE) private readonly coreClient: ClientGrpc) {}

  onModuleInit() {
    this.coreQuizGenerationService =
      this.coreClient.getService<CoreQuizGenerationService>(
        'CoreQuizGenerationService',
      );
  }

  @UseGuards(WsJwtAuthGuard)
  @SubscribeMessage('generateQuiz')
  handleGenerateQuiz(
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
        },
        complete: () => {
          client.emit('quizComplete', {
            message: 'Quiz generation completed successfully',
          });
          client.disconnect();
        },
      });
    } catch (error) {
      this.logger.error(
        `Error generating quiz for bank ID `,
      );
      client.emit('quizError', {
        message: 'Failed to generate quiz',
        error: error.message,
      });
      client.disconnect();
    }
  }
}
