import { CardsService } from '@/src/game/services/game.cards.service';
import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway()
export class GameGateway {
  @WebSocketServer()
  server: Server;

  constructor(private readonly cardsService: CardsService) {}

  @SubscribeMessage('dealCards')
  async distributeCardsAndNotifyClients(data: {
    roomId: string;
  }): Promise<void> {
    const { roomId } = data;
    try {
      const updatedPlayers =
        await this.cardsService.startCardDistribution(roomId);
      this.server.emit('updatedPlayers', updatedPlayers);
    } catch (error) {
      console.error('Error during card distribution:', error);
    }
  }
}
