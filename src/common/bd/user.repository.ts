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

  async allInPlayers(roomId: string) {
    return await this.prisma.user.findFirst({
      where: {
        roomId: roomId,
        allIn: true,
      },
    });
  }
}
