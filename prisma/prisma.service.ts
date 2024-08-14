import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  async onModuleInit() {
    console.log('PRISMA CONNECT BD');
    await this.$connect();
  }

  async onModuleDestroy() {
    console.log('PRISMA DISCONNECT BD');
    await this.$disconnect();
  }
}
