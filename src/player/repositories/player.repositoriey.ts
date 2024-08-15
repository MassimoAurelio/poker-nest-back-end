import { PrismaService } from '@/prisma/prisma.service';
export class PlayerRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findPlayerNameAndRoomId(player: string, roomId: string) {
    return await this.prisma.users.findFirst({
      where: {
        name: player,
        roomId: roomId,
      },
    });
  }

  async findPlayerPositionAndRoomId(position: number, roomId: string) {
    return await this.prisma.users.findFirst({
      where: {
        position: position,
        roomId: roomId,
      },
    });
  }

  /* async createNewPlayer(
    player: string,
    position: number,
    stack: number,
    roomId: string,
  ) {
    return await this.prisma.users.create({
      data: {
        name: player,
        position,
        stack,
        roomId: roomId,
      },
    });
  } */
}
