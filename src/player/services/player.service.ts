import { PrismaService } from '@/prisma/prisma.service';
import { CommonUserRepository } from '@/src/common/bd/user.repository';
import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { JoinTableDto } from '../dto/joinTable.dto';
import { RoomActionDto } from '../dto/roomAction.dto';
import { PlayerRepository } from '../repository/player.repository';
@Injectable()
export class PlayerService {
  constructor(
    private readonly repository: PlayerRepository,
    private readonly commonUserRepository: CommonUserRepository,
    private readonly prisma: PrismaService,
  ) {}

  async createPlayer(socket: Socket, joinTableDto: JoinTableDto) {
    const { name, position, stack, roomId } = joinTableDto;

    try {
      const user =
        await this.commonUserRepository.findUserByNameAndRoomIdInDatabase(
          name,
          roomId,
        );
      if (user) {
        socket.emit('createPlayerError', {
          message: 'User already exists in the room',
        });
        return;
      }

      const userInThisPosition =
        await this.commonUserRepository.findUserByPositionAndRoomIdInDatabase(
          position,
          roomId,
        );
      if (userInThisPosition) {
        socket.emit('createPlayerError', {
          message: `User already exist in the position: ${position}`,
        });
        return;
      }

      const newUser = await this.repository.createPlayerInDatabase(
        name,
        position,
        stack,
        roomId,
      );

      return newUser;
    } catch (error) {
      socket.emit('createPlayerError', {
        message: 'An unexpected error occurred',
      });
      console.error('Error creating user:', error);
      return;
    }
  }

  async leavePlayer(leaveTable: RoomActionDto) {
    const { name, roomId } = leaveTable;
    await this.repository.leavePlayerInDatabase(name, roomId);
    return { name, roomId };
  }

  async getUsers(roomId: string) {
    const allPlayers =
      await this.commonUserRepository.findAllUsersInRoomInDatabase(roomId);
    return allPlayers;
  }

  async makeFold(roomId: string, name: string): Promise<any> {
    const [foldPlayer, nextPlayer] = await Promise.all([
      this.repository.makeFoldAndMakeTurnUserByName(name),
      this.toNextPlayer(roomId),
    ]);

    return {
      foldPlayer,
      nextPlayer,
    };
  }

  async toNextPlayer(roomId: string) {
    const players: Array<any> =
      await this.commonUserRepository.findAllUsersInRoomInDatabase(roomId);

    const currentPlayer = await this.repository.findCurrentPlayer();
    if (!currentPlayer) {
      throw new Error('Current player not found');
    }

    await this.repository.removeCurrentPlayer(currentPlayer.name);

    let nextTurn;

    const playerMaxPosition = players[0];

    if (currentPlayer.position === playerMaxPosition.position) {
      const nextPlayers = players.filter(
        (player: any) => player.position > currentPlayer.position,
      );
      nextTurn = nextPlayers.find((player) => !player.fold);
    }

    if (!nextTurn) {
      nextTurn = players.find((p) => !p.fold);
    }

    if (nextTurn) {
      await this.repository.setCurrentPlayer(nextTurn.name);
    } else {
      throw new Error('No valid player found to pass the turn to');
    }

    return nextTurn;
  }
}
