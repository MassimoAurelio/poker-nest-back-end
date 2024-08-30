import { RoomService } from '@/src/room/services/room.service';
import { Injectable } from '@nestjs/common';
import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { RoomDto } from '../dto/room.dto';

@WebSocketGateway()
@Injectable()
export class RoomGateWay {
  @WebSocketServer()
  server: Server;

  constructor(private readonly roomService: RoomService) {}

  /*  @SubscribeMessage('createRoom')
  async handleCreateRoom(@MessageBody() roomDto: RoomDto) {
    try {
      const newRoom = await this.roomService.createRoom(roomDto);
      console.log('huy');
      this.server.emit('roomCreated', newRoom);
    } catch (error) {
      this.server.emit('roomCreationFailed', error.message);
    }
  } */

  @SubscribeMessage('createRoom')
  async handleCreateRoom(@MessageBody() roomDto: RoomDto) {
    console.log('Received data:', roomDto);
  }
}
