import { Injectable } from '@nestjs/common';
import { IsNotEmpty, IsString } from 'class-validator';

@Injectable()
export class LeaveTable {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  roomId: string;
}
