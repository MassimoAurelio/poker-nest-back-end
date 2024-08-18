import { PrismaService } from '@/prisma/prisma.service';
import { Module } from '@nestjs/common';
import { PlayerGateWay } from './gateways/player.gateway';
import { PlayerRepository } from './repository/player.repository';
import { PlayerService } from './services/player.service';

@Module({
  providers: [PlayerService, PlayerGateWay, PrismaService, PlayerRepository],
})
export class PlayerModule {}
