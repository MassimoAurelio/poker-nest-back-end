import { Module } from '@nestjs/common';
import { PokerModule } from './poker/poker.module';
import { AuthModule } from './auth/auth.module';
import { RoomModule } from './room/room.module';


@Module({
  imports: [PokerModule, AuthModule, RoomModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
