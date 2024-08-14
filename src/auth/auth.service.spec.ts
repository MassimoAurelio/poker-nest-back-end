import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

describe('AuthService', () => {
  let authService: AuthService;
  let prismaService: PrismaService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: {
            regusers: {
              findUnique: jest.fn(),
              create: jest.fn(),
            },
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    prismaService = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);
  });

  describe('register', () => {
    it('should throw an exception if the username already exists', async () => {
      prismaService.regusers.findUnique = jest
        .fn()
        .mockResolvedValue({ username: 'testuser' });

      await expect(
        authService.register({ username: 'testuser', password: 'password' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should register a new user successfully', async () => {
      prismaService.regusers.findUnique = jest.fn().mockResolvedValue(null);
      prismaService.regusers.create = jest
        .fn()
        .mockResolvedValue({ username: 'testuser' });

      const result = await authService.register({
        username: 'testuser',
        password: 'password',
      });
      expect(result).toEqual({
        message: 'The user has been successfully registered',
      });
    });
  });

  describe('login', () => {
    it('should throw an exception if the user does not exist', async () => {
      prismaService.regusers.findUnique = jest.fn().mockResolvedValue(null);

      await expect(
        authService.login({ username: 'testuser', password: 'password' }),
      ).rejects.toThrow(UnauthorizedException);
    });

     it('should throw an exception if the password is incorrect', async () => {
      prismaService.regusers.findUnique = jest
        .fn()
        .mockResolvedValue({
          username: 'testuser',
          password: 'hashedpassword',
        });
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false);

      await expect(
        authService.login({ username: 'testuser', password: 'wrongpassword' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should return a token and user info if credentials are correct', async () => {
      prismaService.regusers.findUnique = jest
        .fn()
        .mockResolvedValue({
          id: 1,
          username: 'testuser',
          password: 'hashedpassword',
        });
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);
      jwtService.sign = jest.fn().mockReturnValue('token');

      const result = await authService.login({
        username: 'testuser',
        password: 'password',
      });
      expect(result).toEqual({
        token: 'token',
        user: { username: 'testuser' },
      });
    }); 
  });
});
