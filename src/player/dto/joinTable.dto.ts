import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class JoinTableDto {
  @IsNotEmpty()
  @IsString()
  player: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @Max(9)
  position: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  stack: number;

  @IsNotEmpty()
  @IsString()
  roomId: string;
}
