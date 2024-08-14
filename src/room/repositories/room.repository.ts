import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
@Injectable()
export class RoomRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findRoomByName(name: string) {
    return this.prisma.rooms.findUnique({
      where: { name },
    });
  }
  async createRoom(name: string, hashedPassword: string) {
    return this.prisma.rooms.create({
      data: { name, password: hashedPassword, v: 0 },
    });
  }
}
