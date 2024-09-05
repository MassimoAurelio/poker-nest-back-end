import { Module } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

import { CommonUserRepository } from '../common/bd/user.repository';
import { RoomController } from './controllers/room.controller';
import { RoomGateWay } from './gateways/room.gateway';
import { RoomRepository } from './repositories/room.repository';
import { RoomService } from './services/room.service';
@Module({
  controllers: [RoomController],
  providers: [
    RoomService,
    PrismaService,
    RoomRepository,
    RoomGateWay,
    CommonUserRepository,
  ],
})
export class RoomModule {}
