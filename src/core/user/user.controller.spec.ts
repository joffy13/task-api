import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { User } from '../../database/entities/user.entity';
import { GetUserListDto } from './dto/get-user-list.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { v4 as uuidv4 } from 'uuid';
import { ListResultType } from '../../common/types/results/list-result.type';

describe('UserController', () => {
  let userController: UserController;
  let userService: jest.Mocked<UserService>;

  const mockUserService = {
    getUserList: jest.fn(),
    getUserById: jest.fn(),
    updateUser: jest.fn(),
    deleteUser: jest.fn(),
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
      role: 'USER',
      ...overrides,
    }) as User;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    }).compile();

    userController = module.get<UserController>(UserController);
    userService = module.get<UserService>(
      UserService,
    ) as jest.Mocked<UserService>;
    jest.clearAllMocks();
  });

  describe('getUserList', () => {
    it('должен возвращать список пользователей', async () => {
      const query: GetUserListDto = { page: 1, perPage: 10 };
      const users: User[] = [mockUser()];
      const result: ListResultType<User> = {
        entities: users,
        pagination: { page: 1, perPage: 10, totalItems: 1, totalPages: 1 },
      };

      userService.getUserList.mockResolvedValue(result);

      const response = await userController.getUserList(query);

      expect(response).toEqual(result);
      expect(userService.getUserList).toHaveBeenCalledWith(query);
    });
  });

  describe('getUser', () => {
    it('должен возвращать пользователя по id', async () => {
      const user = mockUser();
      userService.getUserById.mockResolvedValue(user);

      const response = await userController.getUser(user.id);

      expect(response).toEqual(user);
      expect(userService.getUserById).toHaveBeenCalledWith(user.id);
    });
  });

  describe('updateUser', () => {
    it('должен обновлять пользователя и возвращать обновлённые данные', async () => {
      const user = mockUser();
      const updateUserDto: UpdateUserDto = { username: 'updatedUser' };
      const mockFile = { filename: 'avatar.png' } as Express.Multer.File;

      const updatedUser = {
        ...user,
        username: 'updatedUser',
        avatar: `http://localhost:8000/uploads/avatars/${mockFile.filename}`,
      };

      userService.updateUser.mockResolvedValue(updatedUser);

      const response = await userController.updateUser(
        user.id,
        updateUserDto,
        mockFile,
      );

      expect(response).toEqual(updatedUser);
      expect(userService.updateUser).toHaveBeenCalledWith(
        user.id,
        updateUserDto,
        mockFile,
      );
    });
  });

  describe('deleteUser', () => {
    it('должен удалять пользователя по id', async () => {
      const userId = uuidv4();
      userService.deleteUser.mockResolvedValue(true);

      const response = await userController.deleteUser(userId);

      expect(response).toEqual(true);
      expect(userService.deleteUser).toHaveBeenCalledWith(userId);
    });
  });
});
