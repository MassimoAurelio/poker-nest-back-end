import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { PlayerService } from './player.service';

@WebSocketGateway()
export class PlayerGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;

  constructor(private readonly playerService: PlayerService) {}

  afterInit(server: Server) {
    console.log('Socket server initialized');
  }

  handleConnection(client: Socket) {
    console.log('Client connected:', client.id);

    // Получение списка всех подключенных клиентов и отправка обновленного списка всем
    const connectedClients = Array.from(this.server.sockets.sockets.keys());
    this.server.emit('updatePlayers', connectedClients);
  }

  handleDisconnect(client: Socket) {
    console.log('Client disconnected:', client.id);

    // Получение списка всех подключенных клиентов после отключения
    const connectedClients = Array.from(this.server.sockets.sockets.keys());
    this.server.emit('updatePlayers', connectedClients);
  }

  @SubscribeMessage('join')
  async handleJoin(
    socket: Socket,
    data: { player: string; position: number; stack: number; roomId: string },
  ) {
    try {
      const { player, position, stack, roomId } = data;
      const result = await this.playerService.joinRoom(
        player,
        position,
        stack,
        roomId,
      );

      if (typeof result === 'string') {
        socket.emit('joinError', result);
      } else {
        socket.emit('joinSuccess', result);
      }
    } catch (error) {
      socket.emit('joinError', { message: error.message });
    }
  }

  /* @SubscribeMessage('join')
  async handleJoin(
    @MessageBody() sitDownDto: SitDownDto,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      await this.playerService.joinRoom(
        sitDownDto.player,
        sitDownDto.position,
        sitDownDto.stack,
        sitDownDto.roomId,
      );
      this.server.emit(
        'playerJoined',
        `Игрок ${sitDownDto.player} присоединился к столу на позицию ${sitDownDto.position}.`,
      );
      client.emit(
        'joinSuccess',
        `Вы присоединились к столу на позицию ${sitDownDto.position}.`,
      );

      // Обновление списка всех игроков после подключения нового
      const connectedClients = Array.from(this.server.sockets.sockets.keys());
      this.server.emit('updatePlayers', connectedClients);
    } catch (error) {
      client.emit('joinError', { message: error.message });
    }
  } */
}
