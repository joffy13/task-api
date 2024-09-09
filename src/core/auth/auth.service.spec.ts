import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import * as bcrypt from 'bcrypt';
import { BadRequestException } from '@nestjs/common';
import { UserRoleEnum } from '../../common/types/enums/user-role.enum';
import { v4 as uuidv4 } from 'uuid';

describe('AuthService', () => {
  let authService: AuthService;
  let userService: UserService;
  let jwtService: JwtService;
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
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('jwt-token'),
          },
        },
        {
          provide: UserService,
          useValue: {
            create: jest.fn(),
            getUserByEmail: jest.fn(),
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
    jwtService = module.get<JwtService>(JwtService);
  });

  describe('register', () => {
    it('должен успешно зарегистрировать пользователя', async () => {
      const dto: RegisterUserDto = {
        email: 'test@example.com',
        password: 'password',
        username: 'username',
        role: UserRoleEnum.USER,
      };
      const mockedUser = mockUser(dto.email);

      jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashed-password' as never);
      jest.spyOn(userService, 'create').mockResolvedValue(mockedUser);

      const result = await authService.register(dto);

      expect(result).toEqual({
        token: 'jwt-token',
        user: mockedUser,
      });
      expect(userService.create).toHaveBeenCalledWith({
        ...dto,
        password: 'hashed-password',
      });
      expect(jwtService.sign).toHaveBeenCalledWith({
        role: mockedUser.role,
        email: mockedUser.email,
        id: mockedUser.id,
      });
    });
  });

  describe('login', () => {
    it('должен успешно залогинить пользователя', async () => {
      const dto: LoginUserDto = {
        email: 'test@example.com',
        password: 'password',
      };
      const mockedUser = mockUser(dto.email);

      jest.spyOn(userService, 'getUserByEmail').mockResolvedValue(mockedUser);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);

      const result = await authService.login(dto);

      expect(result).toEqual({
        token: 'jwt-token',
        user: mockedUser,
      });
      expect(userService.getUserByEmail).toHaveBeenCalledWith(dto.email);
      expect(bcrypt.compare).toHaveBeenCalledWith(
        dto.password,
        mockedUser.password,
      );
      expect(jwtService.sign).toHaveBeenCalledWith({
        role: mockedUser.role,
        email: mockedUser.email,
        id: mockedUser.id,
      });
    });

    it('должен выбросить исключение при неправильном пароле', async () => {
      const dto: LoginUserDto = {
        email: 'test@example.com',
        password: 'wrong-password',
      };
      const mockedUser = mockUser(dto.email);

      jest.spyOn(userService, 'getUserByEmail').mockResolvedValue(mockedUser);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);

      await expect(authService.login(dto)).rejects.toThrow(BadRequestException);
      expect(userService.getUserByEmail).toHaveBeenCalledWith(dto.email);
    });
  });
});
