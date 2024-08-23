import { PrismaService } from '@/prisma/prisma.service';

import { Module } from '@nestjs/common';
import { CommonUserRepository } from '../common/bd/user.repository';
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
  ],
})
export class PlayerModule {}
