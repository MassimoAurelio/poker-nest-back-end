import { Injectable } from '@nestjs/common';
import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { JoinTableDto } from '../dto/joinTable.dto';
import { LeaveTable } from '../dto/leaveTable.dta';
import { PlayerService } from '../services/player.service';

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

  @SubscribeMessage('leaveUser')
  async handleLeaveUser(@MessageBody() leaveTable: LeaveTable) {
    const leaveUser = await this.service.leaveUser(leaveTable);
    this.server.emit('userLeave', leaveUser);
  }
}
