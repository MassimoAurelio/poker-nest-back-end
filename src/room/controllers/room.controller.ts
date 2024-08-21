import { Body, Controller, Post } from '@nestjs/common';
import { RoomDto } from '../dto/room.dto';
import { RoomService } from '../services/room.service';

@Controller('room')
export class RoomController {
  constructor(private readonly roomService: RoomService) {}

  @Post('roomInfo')
  async roomInfo(@Body('roomId') roomId: string) {
    return this.roomService.roomInfo(roomId);
  }

  @Post('create')
  async createRoom(@Body() roomDto: RoomDto) {
    return this.roomService.createRoom(roomDto);
  }

  @Post('enter')
  async enterRoom(@Body() roomDto: RoomDto) {
    return this.roomService.enterRoom(roomDto);
  }
}
