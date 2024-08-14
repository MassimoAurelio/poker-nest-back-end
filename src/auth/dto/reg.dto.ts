import { IsEmpty, IsString } from 'class-validator';
import { AuthDto } from './auth.dto';

export class RegisterDto extends AuthDto {
  @IsString()
  @IsEmpty()
  email: string;
}
