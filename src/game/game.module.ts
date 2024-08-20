import { PrismaService } from '@/prisma/prisma.service';
import { Module } from '@nestjs/common';
import { GameGateway } from './gateways/game.gateway';
import { GameRepository } from './repositories/game.repository';
import { CardsService } from './services/game.cards.service';

@Module({
  providers: [GameGateway, CardsService, GameRepository, PrismaService],
})
export class GameModule {}
