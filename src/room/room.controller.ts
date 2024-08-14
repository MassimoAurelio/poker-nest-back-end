import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { RoomService } from './room.service';
import { RoomDto } from './dto/room.dto';

@Controller('room')
export class RoomController {
  constructor(private readonly roomService: RoomService) {}

  @Post('create')
  async createRoom(@Body() roomDto: RoomDto) {
    return this.roomService.createRoom(roomDto);
  }

  @Post('enter')
  async enterRoom(@Body() roomDto: RoomDto) {
    return this.roomService.enterRoom(roomDto);
  }
}
