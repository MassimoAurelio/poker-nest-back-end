import { Injectable } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
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
export class PlayerGateWay
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  constructor(private readonly service: PlayerService) {}

  afterInit(server: Server) {
    console.log('WebSocketGateway initialized');
  }

  handleConnection(client: Socket, ...args: any[]) {
    console.log('Client connected:', client.id);
  }

  handleDisconnect(client: Socket) {
    console.log('Client disconnect:', client.id);
  }

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

  @SubscribeMessage('givePlayers')
  async handleGiveAllPlayers(@MessageBody() roomId: string) {
    const findAllPlayers = await this.service.getUsers(roomId);
    this.server.emit('getUsers', findAllPlayers);
  }

  @SubscribeMessage('fold')
  async handleFoldPlayer(@MessageBody() data: [string, string]) {
    const [roomId, name] = data;
    const foldPlayer = await this.service.makeFold(roomId, name);
    this.server.emit('foldPlayer', foldPlayer);
  }

  @SubscribeMessage('check')
  async handleCheckPlayer(@MessageBody() data: [string, string]) {
    const [roomId, name] = data;
    try {
      const checkPlayer = await this.service.makeCheck(roomId, name);
      this.server.emit('checkPlayer', checkPlayer);
    } catch (error) {
      this.server.emit('checkPlayerError', error.message);
    }
  }

  @SubscribeMessage('raise')
  async handleRaisePlayer(@MessageBody() data: [string, string, number]) {
    const [roomId, name, raiseAmount] = data;
    try {
      const raisePlayer = await this.service.makeRaise(
        roomId,
        name,
        raiseAmount,
      );
      this.server.emit('raisePlayer', raisePlayer);
    } catch (error) {
      this.server.emit('raisePlayerError', error.message);
    }
  }
}
