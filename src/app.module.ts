import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';

import { RoomModule } from './room/room.module';

import { PrismaService } from '@/prisma/prisma.service';
import { PlayerModule } from './player/player.module';
@Module({
  imports: [AuthModule, RoomModule, PlayerModule],
  controllers: [],
  providers: [PrismaService],
})
export class AppModule {}
