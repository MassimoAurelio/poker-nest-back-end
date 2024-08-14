import { BadRequestException, Injectable } from '@nestjs/common';
import { RoomDto } from './dto/room.dto';
import { PrismaService } from 'prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
@Injectable()
export class RoomService {
  constructor(private prisma: PrismaService) {}

  async createRoom(roomDto: RoomDto) {
    const { name, password } = roomDto;
    const existingRoom = await this.prisma.rooms.findUnique({
      where: { name },
    });

    if (existingRoom) {
      return new BadRequestException('A room with that name already exists');
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newRoom = await this.prisma.rooms.create({
      data: { name, password: hashedPassword, v: 0 },
    });
    return { roomId: newRoom.id };
  }

  async enterRoom(roomDto: RoomDto) {
    const { name, password } = roomDto;
    const room = await this.prisma.rooms.findUnique({ where: { name } });
    if (!room) {
      return new BadRequestException('A room with that name not found');
    }

    const isPasswordValid = await bcrypt.compare(password, room.password);
    if (!isPasswordValid) {
      return new BadRequestException('Invalid password for the room');
    }
    return { roomId: room.id };
  }
}
