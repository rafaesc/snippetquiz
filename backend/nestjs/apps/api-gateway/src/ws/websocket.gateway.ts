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
import { Inject, Logger, OnModuleInit } from '@nestjs/common';
import { type ClientGrpc } from '@nestjs/microservices';
import {
  GenerateQuizByBankRequest,
  QuizGenerationProgress,
  CoreQuizGenerationService,
} from './websocket.dto';

@WebSocketGateway({
  namespace: '/ws',
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

  @SubscribeMessage('generateQuiz')
  handleGenerateQuiz(
    @MessageBody() rawData: string,
    @ConnectedSocket() client: ServerSocket,
  ) {
    const data = JSON.parse(rawData);
    this.logger.log(
      `Generate quiz request received for bank ID: ${data.bankId}, user ID: ${data.userId}`,
    );

    const request: GenerateQuizByBankRequest = {
      bankId: data.bankId,
      userId: data.userId,
    };

    // Call gRPC service and stream results back to client
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
      },
    });
  }
}
