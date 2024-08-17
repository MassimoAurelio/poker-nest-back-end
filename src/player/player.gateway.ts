import { Injectable } from '@nestjs/common';
import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { JoinTableDto } from './dto/joinTable.dto';
import { PlayerService } from './player.service';

@WebSocketGateway()
@Injectable()
export class PlayerGateWay {
  @WebSocketServer()
  server: Server;

  constructor(private readonly service: PlayerService) {}

  @SubscribeMessage('createUser')
  async handleCreateUser(
    @MessageBody()
    joinTableDto: JoinTableDto,
  ) {
    const newUser = await this.service.createUser(joinTableDto);
    this.server.emit('userCreated', newUser);
  }
}
