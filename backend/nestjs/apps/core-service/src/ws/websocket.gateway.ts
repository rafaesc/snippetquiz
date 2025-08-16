import {
  WebSocketGateway,
  SubscribeMessage,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { QuizGeneratorService } from '../quiz-generator/quiz-generator.service';
import { first, firstValueFrom } from 'rxjs';

@WebSocketGateway()
export class WebsocketGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  constructor(private quizGeneratorServiceService: QuizGeneratorService) {}
  @WebSocketServer()
  io: Server;

  @SubscribeMessage('coreMessage')
  async handlePing(@MessageBody() data: any, @ConnectedSocket() socket: Socket) {
    console.log('Starting book streaming for client:', socket.id);
    
    // Subscribe to the streaming service
    this.quizGeneratorServiceService.getBooksStream().subscribe({
      next: (bookResponse) => {
        console.log('Streaming book:', bookResponse.book);
        // Emit each book as it arrives
        socket.emit('coreMessage', {
          type: 'book',
          data: bookResponse.book
        });
      },
      error: (error) => {
        console.error('Streaming error:', error);
        socket.emit('coreMessage', {
          type: 'error',
          data: { message: 'Streaming failed' }
        });
      },
      complete: () => {
        console.log('Book streaming completed for client:', socket.id);
        socket.emit('coreMessage', {
          type: 'complete',
          data: { message: 'All books streamed' }
        });
      }
    });
  }

  handleConnection(client: Socket, ...args: any[]) {
    console.log('handleConnection', client.id);
  }

  handleDisconnect(client: Socket) {
    console.log('handleDisconnect', client.id);
  }
}
