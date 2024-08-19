import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { JoinTableDto } from '../dto/joinTable.dto';
import { RoomActionDto } from '../dto/roomAction.dto';
import { PlayerRepository } from '../repository/player.repository';

@Injectable()
export class PlayerService {
  constructor(private readonly repository: PlayerRepository) {}

  async createUser(socket: Socket, joinTableDto: JoinTableDto) {
    const { name, position, stack, roomId } = joinTableDto;

    try {
      const user = await this.repository.findUserByNameAndRoomId(name, roomId);
      if (user) {
        socket.emit('createUserError', {
          message: 'User already exists in the room',
        });
        return;
      }

      const userInThisPosition =
        await this.repository.findUserByPositionAndRoomId(position, roomId);
      if (userInThisPosition) {
        socket.emit('createUserError', {
          message: `User already exist in the position: ${position}`,
        });
        return;
      }

      const newUser = await this.repository.createPlayer(
        name,
        position,
        stack,
        roomId,
      );

      socket.emit('userCreated', newUser);
      return newUser;
    } catch (error) {
      socket.emit('createUserError', {
        message: 'An unexpected error occurred',
      });
      console.error('Error creating user:', error);
      return;
    }
  }

  async leaveUser(leaveTable: RoomActionDto) {
    const { name, roomId } = leaveTable;
    await this.repository.leavePlayer(name, roomId);
    return { name, roomId };
  }

  async getUsers() {
    const allPlayers = await this.repository.getAllUsers();
    return allPlayers;
  }
}
