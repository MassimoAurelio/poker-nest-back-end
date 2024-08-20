import { PrismaService } from '@/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
@Injectable()
export class GameRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAllPlayersInRoomInDatabase(roomId: string) {
    return await this.prisma.user.findMany({
      where: { roomId },
    });
  }

  async updatePlayerCardsInDatabase(playerId: string, cards: any[]) {
    return this.prisma.user.update({
      where: { id: playerId },
      data: { cards },
    });
  }
}
