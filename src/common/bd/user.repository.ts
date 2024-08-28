import { PrismaService } from '@/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
@Injectable()
export class CommonUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAllUsersInRoom(roomId: string) {
    return this.prisma.user.findMany({ where: { roomId } });
  }

  async findUserByName(name: string) {
    return this.prisma.user.findFirst({ where: { name } });
  }

  async findUserByNameAndRoomId(roomId: string, name: string) {
    return this.prisma.user.findFirst({
      where: { name, roomId },
    });
  }

  async findUserByPositionAndRoomId(position: number, roomId: string) {
    return this.prisma.user.findFirst({
      where: { position, roomId },
    });
  }

  async findAllInPlayers(roomId: string) {
    return this.prisma.user.findMany({
      where: { roomId, allIn: true },
    });
  }

  async updateUserByName(name: string, updateData: Partial<User>) {
    const user = await this.prisma.user.findUnique({ where: { name } });
    if (user) {
      return this.prisma.user.update({
        where: { id: user.id },
        data: updateData,
      });
    }
    return null;
  }

  private async updateUserById(id: string, updateData: Partial<User>) {
    return this.prisma.user.update({
      where: { id },
      data: updateData,
    });
  }

  async setMakeTurnUser(name: string) {
    const user = await this.findUserByName(name);
    if (user) {
      return this.updateUserById(user.id, { makeTurn: true });
    }
  }

  async findAllNonFoldPlayers(roomId: string) {
    return this.prisma.user.findMany({
      where: { roomId, fold: false },
    });
  }

  async resetCurrentPlayerIdInRoom(roomId: string) {
    return this.prisma.user.updateMany({
      where: { roomId },
      data: { currentPlayerId: false },
    });
  }

  async resetLastBetInRoom(roomId: string) {
    return this.prisma.user.updateMany({
      where: { roomId },
      data: { lastBet: 0 },
    });
  }

  async setCurrentPlayerByName(name: string, isCurrent: boolean) {
    const user = await this.findUserByName(name);
    if (user) {
      return this.updateUserById(user.id, { currentPlayerId: isCurrent });
    }
  }

  async findPlayerByPosition(roomId: string, position: number) {
    return this.prisma.user.findFirst({
      where: { roomId, position },
    });
  }
}
