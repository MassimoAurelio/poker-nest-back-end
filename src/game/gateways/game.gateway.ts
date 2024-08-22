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
    const { roomId } = gameDto;
    const updatePlayers = await this.cardsService.startNewRound(roomId);
    this.server.emit('start', updatePlayers);
  }
}
