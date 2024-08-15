import {
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { SitDownDto } from './dto/player.sitdown.dto';
import { PlayerService } from './player.service';

@WebSocketGateway()
export class PlayerGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;
  constructor(private readonly playerService: PlayerService) {}

  afterInit(server: Server) {
    console.log('init socket');
  }

  handleConnection(client: Socket, ...args: any[]) {
    console.log('client connected:', client.id);
  }

  handleDisconnect(client: Socket) {
    console.log('client disconected:', client.id);
  }

  @SubscribeMessage('join')
  async handleJoin(@MessageBody() sitDownDto: SitDownDto) {
    /* this.server.emit(); */
  }
}
