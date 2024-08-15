import { PrismaService } from '@/prisma/prisma.service';

export class PlayerRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findUserInDifferentRoom(player: string, roomId: string) {
    return this.prisma.user.findFirst({
      where: {
        name: player,
        roomId: { not: roomId },
      },
    });
  }

  async findPlayerByNameAndRoomId(player: string, roomId: string) {
    return await this.prisma.user.findFirst({
      where: { name: player, roomId: roomId },
    });
  }

  async findPlayerByPositionAndRoomId(position: number, roomId: string) {
    return await this.prisma.user.findFirst({
      where: { position: position, roomId: roomId },
    });
  }

  async removeUserFromRoom(userToUpdate: { id: string; roomId: string }) {
    if (!userToUpdate || !userToUpdate.id || !userToUpdate.roomId) {
      throw new Error('Invalid user data removeUserFromRoom');
    }
    return await this.prisma.room.update({
      where: { id: userToUpdate.roomId },
      data: { users: { disconnect: { id: userToUpdate.id } } },
    });
  }

  async clearUserRoomId(userToUpdate) {
    return await this.prisma.user.update({
      where: { id: userToUpdate.id },
      data: { roomId: null },
    });
  }

  async addPlayerToRoom(roomId: string, newPlayer) {
    return await this.prisma.room.update({
      where: { id: roomId },
      data: { users: { connect: { id: newPlayer.id } } },
    });
  }

  async createPlayer(
    player: string,
    position: number,
    stack: number,
    roomId: string,
  ) {
    return await this.prisma.user.create({
      data: { name: player, position, stack, roomId },
    });
  }
}
