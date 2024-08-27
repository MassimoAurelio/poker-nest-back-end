import { PrismaService } from '@/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
@Injectable()
export class CommonUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAllUsersInRoomInDatabase(roomId: string) {
    return await this.prisma.user.findMany({
      where: {
        roomId: roomId,
      },
    });
  }

  async findUserByUserNameFromDatabase(name: string) {
    return await this.prisma.user.findFirst({
      where: {
        name: name,
      },
    });
  }

  async findUserByNameAndRoomIdInDatabase(roomId: string, name: string) {
    return await this.prisma.user.findFirst({
      where: {
        roomId: roomId,
        name: name,
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

  async allInPlayers(roomId: string) {
    return await this.prisma.user.findFirst({
      where: {
        roomId: roomId,
        allIn: true,
      },
    });
  }

  async setMakeTurnUser(name: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        name: name,
      },
    });
    if (user) {
      return await this.prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          makeTurn: true,
        },
      });
    }
  }
}
