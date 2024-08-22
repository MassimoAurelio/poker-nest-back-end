import { IsNotEmpty, IsString } from 'class-validator';

export class GameDto {
  @IsNotEmpty()
  @IsString()
  roomId: string;
}
