import { PrismaService } from '@/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { JoinTableDto } from './dto/joinTable.dto';

@WebSocketGateway()
@Injectable()
export class PlayerGateWay {
  @WebSocketServer()
  server: Server;

  constructor(private readonly prisma: PrismaService) {}

  @SubscribeMessage('createUser')
  async handleCreateUser(
    @MessageBody()
    joinTableDto: JoinTableDto,
  ) {
    const { player: name, position, stack, roomId } = joinTableDto;

    const newUser = await this.prisma.user.create({
      data: {
        name,
        position,
        stack,
        roomId,
      },
    });

    this.server.emit('userCreated', newUser);
  }
}
