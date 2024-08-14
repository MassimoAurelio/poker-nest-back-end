import { IsBoolean, IsEmpty } from 'class-validator';
import { AuthDto } from './auth.dto';

export class LoginDto extends AuthDto {
  @IsEmpty()
  @IsBoolean()
  rememberMe: boolean;
}
