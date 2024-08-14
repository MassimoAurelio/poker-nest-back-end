import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class AuthRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findUserByUsername(username: string) {
    return this.prisma.regusers.findUnique({
      where: { username },
    });
  }

  async createUser(username: string, hashedPassword: string) {
    return this.prisma.regusers.create({
      data: { username, password: hashedPassword, v: 0 },
    });
  }
}
