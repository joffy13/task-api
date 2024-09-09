import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, TypeORMError } from 'typeorm';
import { UserService } from './user.service';
import { User } from '../../database/entities/user.entity';
import { ConfigService } from '@nestjs/config';
import { RegisterUserDto } from '../auth/dto/register-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ListResultType } from '../../common/types/results/list-result.type';
import { GetUserListDto } from './dto/get-user-list.dto';
import { v4 as uuidv4 } from 'uuid';
import { UserRoleEnum } from '../../common/types/enums/user-role.enum';

describe('UserService', () => {
  let userService: UserService;
  let userRepository: jest.Mocked<Repository<User>>;
  let configService: jest.Mocked<ConfigService>;

  const mockUserRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    findAndCount: jest.fn(),
    delete: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  const mockUser = (overrides = {}): User =>
    ({
      id: uuidv4(),
      email: 'test@example.com',
      username: 'testuser',
      password: 'password',
      tasks: [],
      created_at: new Date(),
      updated_at: new Date(),
      avatar: '',
      role: UserRoleEnum.USER,
      ...overrides,
    }) as User;

  let existingUser: User;
  let registerUserDto: RegisterUserDto;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
    userRepository = module.get<Repository<User>>(
      getRepositoryToken(User),
    ) as jest.Mocked<Repository<User>>;
    configService = module.get<ConfigService>(
      ConfigService,
    ) as jest.Mocked<ConfigService>;

    existingUser = mockUser();
    registerUserDto = {
      email: 'test@example.com',
      password: 'password',
      username: 'testuser',
      role: UserRoleEnum.USER,
    };
    jest.clearAllMocks();
  });

  it('должен быть определен', () => {
    expect(userService).toBeDefined();
  });

  describe('create', () => {
    it('должен выбрасывать ConflictException при попытке создать пользователя с существующим email', async () => {
      userRepository.findOne.mockResolvedValue(existingUser);

      await expect(userService.create(registerUserDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('должен успешно создавать нового пользователя', async () => {
      userRepository.findOne.mockResolvedValue(null);
      const newUser = mockUser({ id: uuidv4(), ...registerUserDto });
      userRepository.create.mockReturnValue(newUser);
      userRepository.save.mockResolvedValue(newUser);

      const result = await userService.create(registerUserDto);

      expect(result).toEqual(newUser);
      expect(userRepository.create).toHaveBeenCalledWith(registerUserDto);
      expect(userRepository.save).toHaveBeenCalledWith(newUser);
    });
  });

  describe('getUserList', () => {
    it('должен возвращать список пользователей с пагинацией', async () => {
      const users = [existingUser];
      const count = 1;
      userRepository.findAndCount.mockResolvedValue([users, count]);

      const query: GetUserListDto = { page: 1, perPage: 10 };
      const result: ListResultType<User> = await userService.getUserList(query);

      expect(result).toEqual({
        entities: users,
        pagination: { page: 1, perPage: 10, totalItems: count, totalPages: 1 },
      });
      expect(userRepository.findAndCount).toHaveBeenCalledWith({
        where: {},
        skip: 0,
        take: 10,
        order: { created_at: 'asc' },
      });
    });
  });

  describe('getUserById', () => {
    it('должен возвращать пользователя по id', async () => {
      userRepository.findOne.mockResolvedValue(existingUser);

      const result = await userService.getUserById(existingUser.id);
      expect(result).toEqual(existingUser);
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: existingUser.id },
      });
    });

    it('должен выбрасывать исключение если пользователь не найден', async () => {
      userRepository.findOne.mockResolvedValue(null);
      const userId = uuidv4();
      await expect(userService.getUserById(userId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getUserByEmail', () => {
    it('должен возвращать пользователя по email', async () => {
      userRepository.findOne.mockResolvedValue(existingUser);

      const result = await userService.getUserByEmail(existingUser.email);
      expect(result).toEqual(existingUser);
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { email: existingUser.email },
      });
    });
  });

  describe('updateUser', () => {
    it('должен обновлять пользователя с аватаром', async () => {
      const appUrl = configService.get('APP_URL');
      userRepository.findOne.mockResolvedValue(existingUser);
      configService.get.mockReturnValue(appUrl);

      const updateUserDto: UpdateUserDto = { username: 'updatedUser' };
      const mockFile = { filename: 'avatar.png' } as Express.Multer.File;

      const updatedUser = {
        ...existingUser,
        username: updateUserDto.username,
        avatar: `${appUrl}/uploads/avatars/${mockFile.filename}`,
      };

      userRepository.save.mockResolvedValue(updatedUser);

      const result = await userService.updateUser(
        existingUser.id,
        updateUserDto,
        mockFile,
      );

      existingUser.username = updateUserDto.username;
      existingUser.avatar = updatedUser.avatar;

      expect(result).toEqual(updatedUser);
      expect(userRepository.save).toHaveBeenCalledWith({
        id: existingUser.id,
        ...updateUserDto,
        avatar: updatedUser.avatar,
      });
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: existingUser.id },
      });
    });

    it('должен обновлять пользователя без аватара', async () => {
      userRepository.findOne.mockResolvedValue(existingUser);
      configService.get.mockReturnValue('http://localhost:8000');

      const updateUserDto: UpdateUserDto = { username: 'updatedUser' };

      const updatedUser = {
        ...existingUser,
        username: updateUserDto.username,
      };

      userRepository.save.mockResolvedValue(updatedUser);

      const result = await userService.updateUser(
        existingUser.id,
        updateUserDto,
      );

      existingUser.username = updateUserDto.username;

      expect(result).toEqual(updatedUser);
      expect(userRepository.save).toHaveBeenCalledWith({
        id: existingUser.id,
        ...updateUserDto,
      });
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: existingUser.id },
      });
    });

    it('должен выбрасывать TypeORMError если обновление не удалось', async () => {
      userRepository.findOne.mockResolvedValue(existingUser);
      configService.get.mockReturnValue('http://localhost');
      const updateUserDto: UpdateUserDto = { username: 'updatedUser' };
      const mockFile = { filename: 'avatar.png' } as Express.Multer.File;

      userRepository.save.mockRejectedValue(
        new TypeORMError('User update failed'),
      );

      await expect(
        userService.updateUser(existingUser.id, updateUserDto, mockFile),
      ).rejects.toThrow(TypeORMError);
    });
  });

  describe('deleteUser', () => {
    it('должен удалять пользователя', async () => {
      const userId = uuidv4();
      userRepository.delete.mockResolvedValue({ affected: 1, raw: {} });

      const result = await userService.deleteUser(userId);
      expect(result).toEqual(true);
      expect(userRepository.delete).toHaveBeenCalledWith({ id: userId });
    });
  });
});
