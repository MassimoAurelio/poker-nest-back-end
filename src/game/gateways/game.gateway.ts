import { GameService } from '@/src/game/services/game.service';
import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { GameDto } from '../dto/game.dto';

@WebSocketGateway()
export class GameGateway {
  @WebSocketServer()
  server: Server;

  constructor(private readonly cardsService: GameService) {}

  @SubscribeMessage('startRound')
  async handleStartRound(@MessageBody() gameDto: GameDto) {
    const { roomId } = gameDto;
    const updatePlayers = await this.cardsService.startNewRound(roomId);
    this.server.emit('start', updatePlayers);
  }

  @SubscribeMessage('dealCards')
  async distributeCardsAndNotifyClients(
    @MessageBody() gameDto: GameDto,
  ): Promise<void> {
    const { roomId } = gameDto;
    try {
      const updatedPlayers =
        await this.cardsService.startCardDistribution(roomId);
      this.server.emit('updatedPlayers', updatedPlayers);
    } catch (error) {
      console.error('Error during card distribution:', error);
    }
  }
}
