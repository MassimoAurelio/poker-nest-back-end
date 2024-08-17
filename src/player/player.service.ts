import { PrismaService } from '@/prisma/prisma.service'; // Путь к PrismaService
import { Injectable } from '@nestjs/common';

@Injectable()
export class PlayerService {
  constructor(private readonly prisma: PrismaService) {}

  async join() {}
  async createUser(data: {
    name: string;
    stack: number;
    position: number;
    roomId: string;
  }) {
    return this.prisma.user.create({
      data,
    });
  }
}
