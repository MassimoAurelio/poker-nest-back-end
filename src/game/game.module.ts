import { PrismaService } from '@/prisma/prisma.service';
import { Module } from '@nestjs/common';
import { GameGateway } from './gateways/game.gateway';
import { GameRepository } from './repositories/game.repository';
import { GameService } from './services/game.service';

@Module({
  providers: [GameGateway, GameService, GameRepository, PrismaService],
})
export class GameModule {}
