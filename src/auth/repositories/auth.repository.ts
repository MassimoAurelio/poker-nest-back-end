import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class AuthRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findUserByUsernameInDatabase(username: string) {
    return this.prisma.regUser.findUnique({
      where: { username },
    });
  }

  async createUserInDatabase(username: string, hashedPassword: string) {
    return this.prisma.regUser.create({
      data: { username, password: hashedPassword },
    });
  }

  async returnTableInfoFromDatabase() {
    return this.prisma.user.findMany({});
  }

  async deleteAllPlayersFromDatabase() {
    return this.prisma.user.deleteMany({});
  }
}
