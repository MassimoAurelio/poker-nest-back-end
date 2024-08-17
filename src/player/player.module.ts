import { PrismaService } from '@/prisma/prisma.service';
import { Module } from '@nestjs/common';
import { PlayerGateWay } from './player.gateway';
import { PlayerService } from './player.service';

@Module({
  providers: [PlayerService, PlayerGateWay, PrismaService],
})
export class PlayerModule {}
