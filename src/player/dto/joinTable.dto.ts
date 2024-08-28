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
  roomId: string;
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @Max(9)
  position: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  stack: number;

  @IsOptional()
  @IsNumber()
  raiseAmount: number;
}
