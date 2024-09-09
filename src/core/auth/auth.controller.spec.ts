import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { User } from '../../database/entities/user.entity';
import { v4 as uuidv4 } from 'uuid';
import { UserRoleEnum } from 'src/common/types/enums/user-role.enum';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;

  const mockUser = (email: string) => {
    return {
      id: uuidv4(),
      email,
      password: 'hashed-password',
      username: 'username',
      role: UserRoleEnum.USER,
      tasks: [],
      avatar: 'some url',
      created_at: new Date(),
    };
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            register: jest.fn(),
            login: jest.fn(),
          },
        },
      ],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  describe('register', () => {
    it('должен успешно зарегистрировать пользователя', async () => {
      const dto: RegisterUserDto = {
        email: 'test@example.com',
        password: 'password',
        role: UserRoleEnum.USER,
        username: 'user',
      };
      const mockedUser: User = mockUser(dto.email);

      const result = { token: 'jwt-token', user: mockedUser };
      jest.spyOn(authService, 'register').mockResolvedValue(result);

      const response = await authController.register(dto);
      expect(response).toEqual(result);
      expect(authService.register).toHaveBeenCalledWith(dto);
    });
  });

  describe('login', () => {
    it('должен успешно логинить пользователя', async () => {
      const dto: LoginUserDto = {
        email: 'test@example.com',
        password: 'password',
      };
      const mockedUser: User = mockUser(dto.email);

      const result = { token: 'jwt-token', user: mockedUser };
      jest.spyOn(authService, 'login').mockResolvedValue(result);

      const response = await authController.login(dto);
      expect(response).toEqual(result);
      expect(authService.login).toHaveBeenCalledWith(dto);
    });
  });
});
