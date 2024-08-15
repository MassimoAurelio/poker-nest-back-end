import { Module } from '@nestjs/common';
import { PlayerGateway } from './player.gateway';
import { PlayerService } from './player.service';
import { PlayerRepository } from './repositories/player.repositoriey';

@Module({
  providers: [PlayerGateway, PlayerService, PlayerRepository],
})
export class PlayerModule {}
