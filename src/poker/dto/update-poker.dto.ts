import { PartialType } from '@nestjs/mapped-types';
import { CreatePokerDto } from './create-poker.dto';

export class UpdatePokerDto extends PartialType(CreatePokerDto) {
  id: number;
}
