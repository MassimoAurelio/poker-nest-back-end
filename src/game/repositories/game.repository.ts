import { PrismaService } from '@/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
@Injectable()
export class GameRepository {
  constructor(private readonly prisma: PrismaService) {}

  async updatePlayerCardsInDatabase(playerId: string, cards: any[]) {
    return this.prisma.user.update({
      where: { id: playerId },
      data: { cards },
    });
  }

  async fullUpdateAllUsers(roomId: string) {
    return this.prisma.user.updateMany({
      where: {
        roomId: roomId,
      },
      data: {
        isDealer: false,
        currentPlayerId: false,
        fold: false,
        lastBet: 0,
        preFlopLastBet: 0,
        flopLastBet: 0,
        turnLastBet: 0,
        riverLastBet: 0,
        makeTurn: false,
        allIn: null,
        allInColl: null,
        loser: false,
        winner: false,
        roundStage: 'preflop',

        cards: [],
      },
    });
  }
  //Нужно вынести в отдельный общий метод эти три метода ниже
  async updateAllInRoomToMakeTurnFalseAndRoundStageToFlop(roomId: string) {
    return await this.prisma.user.updateMany({
      where: {
        roomId: roomId,
      },
      data: {
        makeTurn: false,
        roundStage: 'flop',
      },
    });
  }

  async updateAllInRoomToMakeTurnFalseAndRoundStageToTurn(roomId: string) {
    return await this.prisma.user.updateMany({
      where: {
        roomId: roomId,
      },
      data: {
        makeTurn: false,
        roundStage: 'turn',
      },
    });
  }

  async updateAllInRoomToMakeTurnFalseAndRoundStageToRiver(roomId: string) {
    return await this.prisma.user.updateMany({
      where: {
        roomId: roomId,
      },
      data: {
        makeTurn: false,
        roundStage: 'river',
      },
    });
  }

  async setCurrentPlayer(roomId: string, position: number) {
    return await this.prisma.user.updateMany({
      where: {
        roomId: roomId,
        position: position,
      },
      data: {
        currentPlayerId: true,
      },
    });
  }

  async setFoldInSbPlayer(sbPlayer: any) {
    return await this.prisma.user.update({
      where: {
        id: sbPlayer.id,
      },
      data: { fold: true },
    });
  }

  async setSb(roomId: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        position: 1,
        roomId: roomId,
      },
    });

    if (user) {
      return await this.prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          stack: {
            decrement: 25,
          },
          lastBet: 25,
          preFlopLastBet: 25,
        },
      });
    }

    throw new Error('sbUser not found');
  }

  async setBb(roomId: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        position: 2,
        roomId: roomId,
      },
    });
    if (user) {
      return await this.prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          stack: {
            decrement: 50,
          },
          lastBet: 50,
          preFlopLastBet: 50,
        },
      });
    }
    throw new Error('bbUser not found');
  }
}
