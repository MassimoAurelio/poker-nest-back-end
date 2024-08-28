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
    await this.repository.makeDoubleTransaction(
      roomId,
      name,
      this.repository.makeFoldAndMakeTurnUserByName.bind(this.repository),
      this.toNextPlayer.bind(this),
    );

    const foldPlayer =
      await this.commonUserRepository.findUserByUserNameFromDatabase(name);
    const nextPlayer = await this.repository.findCurrentPlayer();

    return { foldPlayer, nextPlayer };
  }

  //Логика колл
  async coll(roomId: string, name: string): Promise<any> {
    try {
      const player =
        await this.commonUserRepository.findUserByNameAndRoomIdInDatabase(
          roomId,
          name,
        );
      if (!player) {
        throw new Error('User not found');
      }

      const players =
        await this.commonUserRepository.findAllUsersInRoomInDatabase(roomId);
      if (players.length === 0) {
        throw new Error('No users found');
      }

      await this.commonUserRepository.setMakeTurnUser(player.id);

      const allInPlayers = players.filter((p) => p.allIn);

      const currentRoundStage = player.roundStage;

      const maxPreflopLastBet = players.reduce((a, b) =>
        a.preFlopLastBet > b.preFlopLastBet ? a : b,
      );
      const maxFlopLastBet = players.reduce((a, b) =>
        a.flopLastBet > b.flopLastBet ? a : b,
      );
      const maxTurnLastBet = players.reduce((a, b) =>
        a.turnLastBet > b.turnLastBet ? a : b,
      );
      const maxRiverLastBet = players.reduce((a, b) =>
        a.riverLastBet > b.riverLastBet ? a : b,
      );

      const stageBetFields = {
        preflop: 'preFlopLastBet',
        flop: 'flopLastBet',
        turn: 'turnLastBet',
        river: 'riverLastBet',
      };

      const maxBets = {
        preflop: maxPreflopLastBet,
        flop: maxFlopLastBet,
        turn: maxTurnLastBet,
        river: maxRiverLastBet,
      };

      if (!(currentRoundStage in stageBetFields)) {
        throw new Error('Invalid game stage');
      }

      const bet = maxBets[currentRoundStage][stageBetFields[currentRoundStage]];

      if (bet === 0) {
        throw new Error('No previous bets to call');
      }

      const callAmount = bet - player.lastBet;
      if (callAmount === 0) {
        return 'Player has already matched the highest bet';
      }

      let actualCallAmount = callAmount;
      if (player.stack < callAmount) {
        actualCallAmount = player.stack;
      }

      const updateField =
        currentRoundStage in stageBetFields
          ? {
              [stageBetFields[currentRoundStage]]:
                player.lastBet + actualCallAmount,
            }
          : {};

      await this.prisma.user.update({
        where: { id: player.id },
        data: {
          stack: { decrement: actualCallAmount },
          lastBet: player.lastBet + actualCallAmount,
          ...updateField,
        },
      });

      const nextPlayer = await this.toNextPlayer(roomId);
      const collPlayer =
        await this.commonUserRepository.findUserByNameAndRoomIdInDatabase(
          roomId,
          name,
        );

      if (collPlayer.stack === 0) {
        await this.commonUserRepository.updateUserByName(player.id, {
          allIn: true,
        });
      } else if (allInPlayers.length > 0 && player.stack >= actualCallAmount) {
        await this.commonUserRepository.updateUserByName(player.id, {
          allInColl: true,
        });
      }

      return { collPlayer, nextPlayer };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  //Логика Рейза
  async makeRaise(
    roomId: string,
    name: string,
    raiseAmount: number,
  ): Promise<{ raisePlayer: any; nextPlayer: any }> {
    const bB = 50;

    const players =
      await this.commonUserRepository.findAllUsersInRoomInDatabase(roomId);
    const player =
      await this.commonUserRepository.findUserByNameAndRoomIdInDatabase(
        roomId,
        name,
      );

    if (!player) throw new Error(`Игрок ${name} не найден`);

    const lastBigBet = players.reduce(
      (minBet, current) =>
        current.lastBet > minBet.lastBet ? current : minBet,
      players[0],
    );

    const minRaise = lastBigBet.lastBet + bB;

    if (raiseAmount < minRaise) {
      throw new Error(`Raise amount must be at least ${minRaise}`);
    }

    if (raiseAmount > player.stack + player.lastBet) {
      throw new Error('Not enough funds to raise');
    }

    const updateData: any = {
      stack: {
        decrement: raiseAmount,
      },
      makeTurn: true,
      lastBet: raiseAmount,
    };

    const additionalStack =
      player.position === 1 ? 25 : player.position === 2 ? 50 : 0;

    switch (player.roundStage) {
      case 'preflop':
        updateData.preFlopLastBet = {
          increment: raiseAmount - additionalStack,
        };
        if (player.position === 1) {
          updateData.stack = {
            increment: 25,
          };
        } else if (player.position === 2) {
          updateData.stack = {
            increment: 50,
          };
        }
        break;
      case 'flop':
        updateData.flopLastBet = {
          increment: raiseAmount,
        };
        break;
      case 'turn':
        updateData.turnLastBet = {
          increment: raiseAmount,
        };
        break;
      case 'river':
        updateData.riverLastBet = {
          increment: raiseAmount,
        };
        break;
      default:
        throw new Error('Unknown stage of the game');
    }

    await this.repository.makeDoubleTransaction(
      roomId,
      name,
      async (name: string) => {
        await this.repository.changeUserViaUpdateData(name, updateData);
      },
      async (roomId: string) => {
        await this.toNextPlayer(roomId);
      },
    );

    const raisePlayer =
      await this.commonUserRepository.findUserByNameAndRoomIdInDatabase(
        roomId,
        name,
      );

    if (raisePlayer.stack === 0) {
      await this.repository.updateUserMakeTurnAllIn(roomId, name);
    }

    const nextPlayer = await this.repository.findCurrentPlayer();

    return { raisePlayer, nextPlayer };
  }

  //Логика чека
  async makeCheck(roomId: string, name: string): Promise<any> {
    const player =
      await this.commonUserRepository.findUserByNameAndRoomIdInDatabase(
        roomId,
        name,
      );

    if (!player) {
      throw new Error('Player not found in the specified room.');
    }

    await this.repository.makeDoubleTransaction(
      roomId,
      name,
      this.commonUserRepository.setMakeTurnUser.bind(this.repository),
      this.toNextPlayer.bind(this),
    );

    const сheckPlayer =
      await this.commonUserRepository.findUserByNameAndRoomIdInDatabase(
        roomId,
        name,
      );
    if (!сheckPlayer) {
      throw new Error('Updated player not found in the specified room.');
    }

    const lastBigBetUser = await this.repository.findLastBigBet();

    if (lastBigBetUser.lastBet !== сheckPlayer.lastBet) {
      throw new Error(
        "Player's last bet does not match the current highest bet.",
      );
    }
    const nextPlayer = await this.repository.findCurrentPlayer();

    return { сheckPlayer, nextPlayer };
  }

  async toNextPlayer(roomId: string) {
    const players =
      await this.commonUserRepository.findAllUsersInRoomInDatabase(roomId);
    const currentPlayer = await this.repository.findCurrentPlayer();

    if (!currentPlayer) throw new Error('Current player not found');
    await this.repository.removeCurrentPlayer(currentPlayer.name);

    let nextTurn;
    const playerMaxPosition = players[0];

    if (currentPlayer.position === playerMaxPosition.position) {
      const nextPlayers = players.filter(
        (player) => player.position > currentPlayer.position,
      );
      nextTurn = nextPlayers.find((player) => !player.fold);
    }

    if (!nextTurn) nextTurn = players.find((p) => !p.fold);

    if (nextTurn) {
      await this.repository.setCurrentPlayer(nextTurn.name);
      nextTurn = await this.repository.findCurrentPlayer();
    } else {
      throw new Error('No valid player found to pass the turn to');
    }

    return nextTurn;
  }
}
