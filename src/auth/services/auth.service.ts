import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { AuthDto } from '../dto/auth.dto';
import { AuthRepository } from '../repositories/auth.repository';
import { TokenService } from './auth.token.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly tokenService: TokenService,
  ) {}

  async register(registerDto: AuthDto) {
    const { username, password } = registerDto;
    const existingUser = await this.authRepository.findUserByUsername(username);

    if (existingUser) {
      throw new BadRequestException('A user with that name already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await this.authRepository.createUser(username, hashedPassword);

    return { message: 'The user has been successfully registered' };
  }

  async login(loginDto: AuthDto) {
    const { username, password } = loginDto;
    const existingUser = await this.authRepository.findUserByUsername(username);

    if (!existingUser) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      existingUser.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const token = this.tokenService.signToken({ userId: existingUser.id });

    return { token, user: { username: existingUser.username } };
  }

  async tableInfo() {
    const allPlayers = await this.authRepository.returnTableInfo();
    return allPlayers;
  }

  async deletePlayers() {
    const allPlayers = await this.authRepository.deleteAll();
    return allPlayers;
  }
}
