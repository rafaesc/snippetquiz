import {
  WebSocketGateway,
  SubscribeMessage,
  WebSocketServer,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket as ServerSocket } from 'socket.io';
import { envs } from '../config/envs';
import { Logger, UseGuards } from '@nestjs/common';
import { GenerateQuizByBankRequest } from './websocket.dto';
import { WsJwtAuthGuard } from '../guards/ws-jwt-auth.guard';
import { RedisService } from '../../../commons/services/redis.service';

@WebSocketGateway({
  namespace: '/api/ws',
  path: '/api/ws',
  cors: {
    origin: envs.allowedOrigins.split(','),
    credentials: true,
  },
  transports: ['websocket'],
})
export class WebsocketGateway
  implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  io: Server;

  private clients = new Map<string, ServerSocket>();

  private logger = new Logger(WebsocketGateway.name);

  constructor(private readonly redisService: RedisService) {
    redisService.subscribeToPattern('quiz.progress.ephemeral:*', (raw, channel) => {
      const userId = channel.split(':')[2]; // channel = quiz.progress.ephemeral:user-id:123
      const socket = this.clients.get(userId);
      this.logger.log(`Received message for user - ${userId} - ${channel}`);

      if (socket) {
        const data = JSON.parse(raw) as { progress: any; completed: any };

        if (data.completed) {
          socket.emit('quizComplete', data);
          setTimeout(() => {
            socket.disconnect();
          }, 1000);
        } else {
          socket.emit('quizProgress', data);
        }
      }
    });
  }

  handleConnection(client: ServerSocket) {
    const timeout = setTimeout(
      () => {
        client.disconnect(true);
      },
      10 * 60 * 1000, //10min
    );

    (client as any).data.timeout = timeout;

    this.logger.debug(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: any) {
    const entry = [...this.clients.entries()].find(
      ([, s]) => s.id === client.id,
    );
    clearTimeout((client as any).data.timeout);

    const userId = (client as any).data?.userId;
    this.logger.log(`Disconnect ${userId} `);

    if (entry) {
      const [user_id] = entry;
      this.clients.delete(user_id);
    }
  }

  //@UseGuards(WsJwtAuthGuard, WsRateLimitGuard)
  @UseGuards(WsJwtAuthGuard)
  @SubscribeMessage('generateQuiz')
  async handleGenerateQuiz(
    @MessageBody() rawData: string,
    @ConnectedSocket() client: ServerSocket,
  ) {
    try {
      const userId = (client as any).data?.userId;

      const request: GenerateQuizByBankRequest = {
        userId,
      };
      this.logger.log(
        `Generate quiz request received for bank ID: ${JSON.stringify(request)}`,
      );

      // Override old socket if exists
      const oldSocket = this.clients.get(userId);
      if (oldSocket) {
        this.logger.error(
          `Disconnecting old socket for user ${userId}: ${oldSocket.id}`,
        );
        oldSocket.emit('quizError', {
          message: 'Quiz generation is already in progress for this user',
          error: 'Resource locked',
        });
        setTimeout(() => {
          oldSocket.disconnect();
        }, 1000);
      }

      this.clients.set(userId, client);
      this.logger.debug(
        `Client set for user ${userId}: ${client.id}  - entries ${this.clients.size}`,
      );
    } catch (error) {
      this.logger.error(`Error generating quiz for bank ID: ${error.message}`);

      if (error.message.includes('already locked')) {
        client.emit('quizError', {
          message: 'Quiz generation is already in progress for this user',
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
