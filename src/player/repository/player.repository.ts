import { PrismaService } from '@/prisma/prisma.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PlayerRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createPlayerInDatabase(
    name: string,
    position: number,
    stack: number,
    roomId: string,
  ) {
    return await this.prisma.user.create({
      data: {
        name,
        position,
        stack,
        roomId,
        cards: [],
      },
    });
  }

  async findUserByNameAndRoomIdInDatabase(name: string, roomId: string) {
    return await this.prisma.user.findFirst({
      where: {
        name: name,
        roomId: roomId,
      },
    });
  }

  async findUserByPositionAndRoomIdInDatabase(
    position: number,
    roomId: string,
  ) {
    return await this.prisma.user.findFirst({
      where: {
        position: position,
        roomId: roomId,
      },
    });
  }

  async leavePlayerInDatabase(name: string, roomId: string) {
    return await this.prisma.user.deleteMany({
      where: {
        name: name,
        roomId: roomId,
      },
    });
  }

  async getAllUsersFromDatabase() {
    return await this.prisma.user.findMany({});
  }
}
