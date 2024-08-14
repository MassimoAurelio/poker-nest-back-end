import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthDto } from './dto/auth.dto';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
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

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  describe('login', () => {
    it('should call AuthService login with correct parameters', async () => {
      const loginDto: AuthDto = {
        username: 'test@example.com',
        password: 'password123',
      };

      // Ожидаемый результат, соответствующий типу { token: string; user: { username: string; } }
      const result = {
        token: 'some-jwt-token',
        user: {
          username: 'testuser',
        },
      };

      // Замокайте возвращаемое значение метода login
      jest.spyOn(authService, 'login').mockResolvedValue(result);

      // Вызовите метод login контроллера
      const response = await authController.login(loginDto);

      // Ожидайте, что AuthService.login был вызван с правильными параметрами
      expect(authService.login).toHaveBeenCalledWith(loginDto);

      // Ожидайте, что контроллер вернет ожидаемый результат
      expect(response).toBe(result);
    });
  });

  describe('register', () => {
    it('should call AuthService register with correct parameters', async () => {
      const registerDto: AuthDto = {
        username: 'test@example.com',
        password: 'password123',
      };

      const result = {
        message: 'some-message',
      };

      jest.spyOn(authService, 'register').mockResolvedValue(result);

      // Вызовите метод register контроллера
      const response = await authController.register(registerDto);

      // Ожидайте, что AuthService.register был вызван с правильными параметрами
      expect(authService.register).toHaveBeenCalledWith(registerDto);

      // Ожидайте, что контроллер вернет ожидаемый результат
      expect(response).toBe(result);
    });
  });
});
