import { IsEmpty, IsNumber, IsString } from 'class-validator';

export class SitDownDto {
  @IsEmpty()
  @IsString()
  player: string;

  @IsEmpty()
  @IsNumber()
  position: number;

  @IsNumber()
  stack: number;

  @IsEmpty()
  @IsString()
  roomId: string;
}
