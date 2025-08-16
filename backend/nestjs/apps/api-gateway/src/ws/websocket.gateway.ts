import {
  WebSocketGateway,
  SubscribeMessage,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket as ServerSocket } from 'socket.io';
import io from 'socket.io-client';
import { envs } from '../config/envs';

@WebSocketGateway({
  namespace: '/ws',
  cors: {
    origin: envs.allowedOrigins.split(','),
    credentials: true,
  },
  transports: ['websocket'],
})
export class WebsocketGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  io: Server;

  // Store connections to core-service for each client
  private coreServiceConnections = new Map<string, SocketIOClient.Socket>();

  @SubscribeMessage('coreMessage')
  handlePing(@MessageBody() data: any, @ConnectedSocket() client: ServerSocket) {
    const coreServiceSocket = this.coreServiceConnections.get(client.id);
    if (coreServiceSocket) {
      console.log('Send message to core')
      coreServiceSocket.emit('coreMessage', data);
    }
  }

  handleConnection(client: ServerSocket, ...args: any[]) {
    console.log('handleConnection', client.id);
    
    // Create connection to core-service when client connects
    const coreServiceUrl = `http://localhost:7001`;
    const coreServiceSocket: SocketIOClient.Socket = io(`${coreServiceUrl}`, {
      transports: ['websocket'],
    });

    // Store the connection
    this.coreServiceConnections.set(client.id, coreServiceSocket);

    // Handle core-service connection events
    coreServiceSocket.on('connect', () => {
      console.log(`Connected to core-service for client ${client.id}`);
    });

    coreServiceSocket.on('disconnect', () => {
      console.log(`Disconnected from core-service for client ${client.id}`);
    });

    coreServiceSocket.on('error', (error) => {
      console.error(`Core-service connection error for client ${client.id}:`, error);
    });
    

    // Forward messages from core-service to client
    coreServiceSocket.on('coreMessage', (data) => {
      console.log('coreMessage', data);
      client.emit('coreMessage', data);
    });
  }

  handleDisconnect(client: ServerSocket) {
    console.log('handleDisconnect', client.id);
    
    // Clean up core-service connection when client disconnects
    const coreServiceSocket = this.coreServiceConnections.get(client.id);
    if (coreServiceSocket) {
      coreServiceSocket.disconnect();
      this.coreServiceConnections.delete(client.id);
      console.log(`Cleaned up core-service connection for client ${client.id}`);
    }
  }
}
