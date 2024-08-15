import { Injectable } from '@nestjs/common';
import { SitDownDto } from './dto/player.sitdown.dto';
import { PlayerRepository } from './repositories/player.repositoriey';
@Injectable()
export class PlayerService {
  constructor(private readonly playerRepository: PlayerRepository) {}

  async sitDown(sitDownDto: SitDownDto) {
    const { player, position, stack, roomId } = sitDownDto;

    const existingPlayer = await this.playerRepository.findPlayerNameAndRoomId(
      player,
      roomId,
    );
    if (existingPlayer) {
      return;
    }
    const positionPlayer =
      await this.playerRepository.findPlayerPositionAndRoomId(position, roomId);
    if (positionPlayer) {
      return;
    }
    /* const newPlayer =  */
  }
}
