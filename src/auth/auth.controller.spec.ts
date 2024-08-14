import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthDto } from './dto/auth.dto';
import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';

describe('AuthController', () => {
  let app: INestApplication;
  let authService: AuthService;

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            login: jest.fn(),
            register: jest.fn(),
          },
        },
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
    authService = moduleRef.get<AuthService>(AuthService);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /auth/login', () => {
    it('201 Created: Valid loginDto', async () => {
      const loginDto: AuthDto = {

        username: 'massimo',

        
        password: '111111',
      };
      const result = {
        token: 'token',
        user: {
          username: 'massimo',
        },
      };
      jest.spyOn(authService, 'login').mockResolvedValue(result);
      return request(app.getHttpServer())
        .post('/auth/login')
        .send(loginDto)
        .expect(HttpStatus.CREATED)
        .expect(result);
    });

    it('401 Unauthorized: Invalid credentials', async () => {
      const loginDto: AuthDto = {
        username: 'massimo',
        password: 'wrongPassword',
      };

      const result = {
        message: 'Invalid credentials',
        statusCode: 401,
      };

      jest.spyOn(authService, 'login').mockRejectedValue({
        message: 'Invalid credentials',
        status: HttpStatus.UNAUTHORIZED,
      });

      return request(app.getHttpServer())
        .post('/auth/login')
        .send(loginDto)
        .expect(HttpStatus.UNAUTHORIZED)
        .expect(result);
    });
  });
});
