import { Injectable } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JoinTableDto } from '../dto/joinTable.dto';
import { RoomActionDto } from '../dto/roomAction.dto';
import { PlayerService } from '../services/player.service';

@WebSocketGateway()
@Injectable()
export class PlayerGateWay {
  @WebSocketServer()
  server: Server;

  constructor(private readonly service: PlayerService) {}

  @SubscribeMessage('createUser')
  async handleCreateUser(
    @ConnectedSocket() socket: Socket,
    @MessageBody()
    joinTableDto: JoinTableDto,
  ) {
    const newUser = await this.service.createPlayer(socket, joinTableDto);
    this.server.emit('userCreated', newUser);
  }

  @SubscribeMessage('leaveUser')
  async handleLeaveUser(@MessageBody() leaveTable: RoomActionDto) {
    const leaveUser = await this.service.leavePlayer(leaveTable);
    this.server.emit('userLeave', leaveUser);
  }
}
