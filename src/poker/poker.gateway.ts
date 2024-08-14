import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  OnGatewayConnection,
  OnGatewayInit,
  OnGatewayDisconnect,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { PokerService } from './services/poker.service';

@WebSocketGateway()
export class PokerGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(private readonly pokerService: PokerService) {}

  @WebSocketServer() server: Server;

  afterInit(server: Server) {
    console.log('WebSocket init');
  }

  handleConnection(client: Socket, ...args: any[]) {
    console.log('Client connected:', client.id);
  }

  handleDisconnect(client: Socket) {
    console.log('Client disconect:', client.id);
  }

  @SubscribeMessage('message')
  handleMessage(@MessageBody() message: string): void {
    console.log('message:', message);
    this.server.emit('message', `Echo: ${message}`); 
  }
}
