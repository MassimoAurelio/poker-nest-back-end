import { PrismaService } from '@/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { PlayerRepository } from './repositories/player.repositoriey';
@Injectable()
export class PlayerService {
  constructor(
    private readonly playerRepository: PlayerRepository,
    private readonly prisma: PrismaService,
  ) {}

  async joinRoom(
    player: string,
    position: number,
    stack: number,
    roomId: string,
  ) {
    // Check for existing player in another room
    const existingPlayerInOtherRoom = await this.prisma.user.findFirst({
      where: {
        name: player,
        roomId: { not: roomId },
      },
    });

    if (existingPlayerInOtherRoom) {
      await this.prisma.room.update({
        where: { id: existingPlayerInOtherRoom.roomId },
        data: { users: { disconnect: { id: existingPlayerInOtherRoom.id } } },
      });
      await this.prisma.user.update({
        where: { id: existingPlayerInOtherRoom.id },
        data: { roomId: null },
      });
    }

    // Check if player already in the room
    const existingPlayer = await this.prisma.user.findFirst({
      where: {
        name: player,
        roomId: roomId,
      },
    });

    if (existingPlayer) {
      return 'Такой игрок уже сидит за столом';
    }

    // Check if position is taken
    const positionPlayer = await this.prisma.user.findFirst({
      where: {
        position: position,
        roomId: roomId,
      },
    });

    if (positionPlayer) {
      return 'Это место на столе уже занято';
    }

    // Add new player
    const newPlayer = await this.prisma.user.create({
      data: {
        name: player,
        position,
        stack,
        roomId,
      },
    });

    await this.prisma.room.update({
      where: { id: roomId },
      data: { users: { connect: { id: newPlayer.id } } },
    });

    return `Игрок ${player} присоединился к столу на позицию ${position}.`;
  }

  /* async sitDown(sitDownDto: SitDownDto) {
    const { player, position, stack, roomId } = sitDownDto;

    const existingPlayer =
      await this.playerRepository.findPlayerNameAndRoomId(player);
    if (existingPlayer) {
      throw new Error(`Player ${player} already in room ${roomId}`);
    }

    const positionPlayer =
      await this.playerRepository.findPlayerPositionAndRoomId(position, roomId);
    if (positionPlayer) {
      throw new Error(`Position ${position} already taken in room ${roomId}`);
    }

    const newPlayer = await this.playerRepository.createNewPlayer(
      player,
      position,
      stack,
      roomId,
    );
    await this.playerRepository.updateUserRoom(roomId, newPlayer.id);
  } */

  /* async joinRoom(
    player: string,
    position: number,
    stack: number,
    roomId: string,
  ) {
    // Проверка существующего игрока в другой комнате
    const existingPlayerInOtherRoom =
      await this.playerRepository.findUserInDifferentRoom(player, roomId);

    if (existingPlayerInOtherRoom) {
      await this.playerRepository.removeUserFromRoom(existingPlayerInOtherRoom);
      await this.playerRepository.clearUserRoomId(existingPlayerInOtherRoom);
    }

    // Проверка существующего игрока в той же комнате
    const existingPlayer =
      await this.playerRepository.findPlayerByNameAndRoomId(player, roomId);

    if (existingPlayer) {
      throw new Error('Такой игрок уже сидит за столом');
    }

    // Проверка занятости позиции
    const positionPlayer =
      await this.playerRepository.findPlayerByPositionAndRoomId(
        position,
        roomId,
      );

    if (positionPlayer) {
      throw new Error('Это место на столе уже занято');
    }

    // Создание нового игрока
    const newPlayer = await this.playerRepository.createPlayer(
      player,
      position,
      stack,
      roomId,
    );
    await this.playerRepository.addPlayerToRoom(roomId, newPlayer);

    return newPlayer;
  } */
}
