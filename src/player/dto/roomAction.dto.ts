import { Injectable } from '@nestjs/common';
import { IsNotEmpty, IsString } from 'class-validator';

@Injectable()
export class RoomActionDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  roomId: string;
}
