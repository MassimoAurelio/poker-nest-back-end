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

  @SubscribeMessage('createRoom')
  async handleCreateRoom(@MessageBody() roomDto: RoomDto) {
    try {
      const newRoom = await this.roomService.createRoom(roomDto);
      this.server.emit('roomCreated', newRoom);
    } catch (error) {
      this.server.emit('roomCreationFailed', error.message);
    }
  }

  @SubscribeMessage('enterRoom')
  async handleEnterRoom(@MessageBody() roomDto: RoomDto) {
    try {
      const enterRoom = await this.roomService.enterRoom(roomDto);
      console.log('Room entered successfully:', enterRoom);
      this.server.emit('roomEnter', enterRoom);
    } catch (error) {
      console.error('Error entering room:', error);
      this.server.emit('roomEnterFailed', {
        message: error.message,
        stack: error.stack,
      });
    }
  }

  @SubscribeMessage('roomInfo')
  async handleRoomInfo(@MessageBody() roomId: string) {
    const roomInfo = await this.roomService.roomInfo(roomId);
    this.server.emit('infoRoom', roomInfo);
  }
}
