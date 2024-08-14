import {
  IsString,
  IsNotEmpty,
  IsArray,
  IsOptional,
  IsMongoId,
} from 'class-validator';

export class RoomDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsArray()
  @IsOptional()
  @IsMongoId({ each: true })
  users?: string[];
}
