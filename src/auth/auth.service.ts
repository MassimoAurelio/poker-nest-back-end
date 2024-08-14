import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { AuthDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: AuthDto) {
    const { username, password } = registerDto;
    const existingUser = await this.prisma.regusers.findUnique({
      where: { username },
    });

    if (existingUser) {
      throw new BadRequestException('A user with that name already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await this.prisma.regusers.create({
      data: { username, password: hashedPassword, v: 0 },
    });

    return { message: 'The user has been successfully registered' };
  }

  async login(loginDto: AuthDto) {
    const { username, password } = loginDto;
    const existingUser = await this.prisma.regusers.findUnique({
      where: { username },
    });

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

    const token = this.jwtService.sign({ userId: existingUser.id });

    return { token, user: { username: existingUser.username } };
  }
}
