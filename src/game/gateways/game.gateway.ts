import { GameDto } from '@/src/game/dto/game.dto';
import { GameService } from '@/src/game/services/game.service';
import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway()
export class GameGateway {
  @WebSocketServer()
  server: Server;

  constructor(private readonly cardsService: GameService) {}

  @SubscribeMessage('startRound')
  async handleStartRound(@MessageBody() gameDto: GameDto) {
    const updatePlayers = await this.cardsService.startNewRound(gameDto);
    this.server.emit('start', updatePlayers);
  }

  @SubscribeMessage('flop')
  async handleDealFlop(@MessageBody() gameDto: GameDto) {
    await this.cardsService.clearTable();
    const cards = await this.cardsService.dealFlopCards(gameDto);
    this.server.emit('dealFlop', cards);
  }

  @SubscribeMessage('turn')
  async handleDealTurn(@MessageBody() gameDto: GameDto) {
    const tableCards = await this.cardsService.dealTurnCard(gameDto);
    this.server.emit('dealTurn', tableCards);
  }

  @SubscribeMessage('river')
  async handleDealRiver(@MessageBody() gameDto: GameDto) {
    const tableCards = await this.cardsService.dealRiverCards(gameDto);
    this.server.emit('dealRiver', tableCards);
  }
}
