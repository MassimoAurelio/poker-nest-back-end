import { Injectable } from '@nestjs/common';
import { JoinTableDto } from '../dto/joinTable.dto';
import { LeaveTable } from '../dto/leaveTable.dta';
import { PlayerRepository } from '../repository/player.repository';

@Injectable()
export class PlayerService {
  constructor(private readonly repository: PlayerRepository) {}

  async createUser(joinTableDto: JoinTableDto) {
    const { name, position, stack, roomId } = joinTableDto;

    const newUser = await this.repository.createPlayer(
      name,
      position,
      stack,
      roomId,
    );

    return newUser;
  }

  async leaveUser(leaveTable: LeaveTable) {
    const { name, roomId } = leaveTable;
    await this.repository.leavePlayer(name, roomId);
    return { name, roomId };
  }
}
