import { Module } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RoomController } from './controllers/room.controller';
import { RoomRepository } from './repositories/room.repository';
import { RoomService } from './services/room.service';

@Module({
  controllers: [RoomController],
  providers: [RoomService, PrismaService, RoomRepository],
})
export class RoomModule {}
