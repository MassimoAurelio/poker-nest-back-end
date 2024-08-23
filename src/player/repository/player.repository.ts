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

  async markPlayerFoldAndEnableTurn(roomId: string, name: string) {
    return await this.prisma.user.updateMany({
      where: {
        roomId: roomId,
        name: name,
      },
      data: {
        fold: true,
        allIn: false,
        makeTurn: true,
      },
    });
  }

  async markPlayerFoldAndMakeTurn(roomId: string, name: string) {
    return await this.prisma.user.updateMany({
      where: { roomId: roomId, name: name },
      data: { fold: true, makeTurn: true },
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
}
