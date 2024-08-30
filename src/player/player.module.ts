import { PrismaService } from '@/prisma/prisma.service';

import { Module } from '@nestjs/common';
import { CommonUserRepository } from '../common/bd/user.repository';
import { GameStateService } from '../common/services/game.state.service';
import { PlayerGateWay } from './gateways/player.gateway';
import { PlayerRepository } from './repository/player.repository';
import { PlayerService } from './services/player.service';

@Module({
  providers: [
    PlayerService,
    PlayerGateWay,
    PrismaService,
    PlayerRepository,
    CommonUserRepository,
    GameStateService,
  ],
})
export class PlayerModule {}
