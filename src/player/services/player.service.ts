import { Injectable } from '@nestjs/common';
import { JoinTableDto } from '../dto/joinTable.dto';
import { LeaveTable } from '../dto/leaveTable.dta';
import { PlayerRepository } from '../repository/player.repository';

@Injectable()
export class PlayerService {
  constructor(private readonly repository: PlayerRepository) {}

  async createUser(joinTableDto: JoinTableDto) {
    const { player: name, position, stack, roomId } = joinTableDto;

    const newUser = await this.repository.createPlayer(
      name,
      position,
      stack,
      roomId,
    );

    return newUser;
  }

  async leaveUser(leaveTable: LeaveTable) {
    const { player, roomId } = leaveTable;
    await this.repository.leavePlayer(player, roomId);
    return { name: player, roomId };
  }
}
