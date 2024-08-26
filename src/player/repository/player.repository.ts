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

  async makeFoldAndMakeTurnUserByName(name: string) {
    const user = await this.prisma.user.findUnique({
      where: { name },
    });

    if (!user) {
      throw new Error('User not found');
    }

    return await this.prisma.user.update({
      where: { id: user.id },
      data: {
        fold: true,
        makeTurn: true,
      },
    });
  }

  async findFoldPlayers() {
    return await this.prisma.user.findMany({
      where: {
        fold: false,
      },
      orderBy: {
        position: 'asc',
      },
    });
  }

  async findCurrentPlayer() {
    return await this.prisma.user.findFirst({
      where: {
        currentPlayerId: true,
      },
    });
  }

  async removeCurrentPlayer(name: string) {
    const user = await this.prisma.user.findUnique({
      where: { name },
    });
    if (user) {
      return await this.prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          currentPlayerId: false,
        },
      });
    }
  }

  async setCurrentPlayer(name: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        name,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }
    return await this.prisma.user.update({
      where: { id: user.id },
      data: {
        currentPlayerId: true,
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
}
