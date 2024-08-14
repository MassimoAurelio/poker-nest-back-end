import { PrismaService } from '@/prisma/prisma.service';
import { AuthController } from '@/src/auth/controllers/auth.controller';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthRepository } from './repositories/auth.repository';
import { AuthService } from './services/auth.service';
import { TokenService } from './services/auth.token.service';
@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '60m' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, PrismaService, AuthRepository, TokenService],
})
export class AuthModule {}
