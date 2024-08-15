import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
@Injectable()
export class RoomRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findRoomByName(name: string) {
    return this.prisma.room.findFirst({
      where: { name },
    });
  }
  async createRoom(name: string, hashedPassword: string) {
    return this.prisma.room.create({
      data: { name, password: hashedPassword },
    });
  }
}
