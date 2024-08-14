import { Module } from '@nestjs/common';
import { PokerService } from './services/poker.service';
import { PokerGateway } from './poker.gateway';

@Module({
  providers: [PokerGateway, PokerService],
  controllers: [],
})
export class PokerModule {}
