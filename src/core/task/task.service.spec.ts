import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TaskService } from './task.service';
import { Task } from '../../database/entities/task.entity';
import { UserService } from '../user/user.service';
import { UserRoleEnum } from '../../common/types/enums/user-role.enum';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { GetTaskListByAuthorIdDto } from './dto/get-task-list.dto';
import { v4 as uuidv4 } from 'uuid';
import { DeleteResult } from 'typeorm/query-builder/result/DeleteResult';
import { User } from '../../database/entities/user.entity';

describe('TaskService', () => {
  let taskService: TaskService;
  let taskRepository: jest.Mocked<Repository<Task>>;
  let userService: jest.Mocked<UserService>;

  const mockTaskRepository = {
    save: jest.fn(),
    findAndCount: jest.fn(),
    findOne: jest.fn(),
    delete: jest.fn(),
  };

  const mockUserService = {
    getUserById: jest.fn(),
  };

  const mockTask = (authorId: string): Task =>
    ({
      id: uuidv4(),
      description: 'Test Description',
      author_id: authorId,
      author: {
        id: authorId,
        username: 'test_user',
        role: UserRoleEnum.USER,
        email: 'test@example.com',
        password: 'password',
        tasks: [],
        avatar: null,
        created_at: new Date(),
        updated_at: new Date(),
      } as User,
      completed: false,
      created_at: new Date(),
      updated_at: new Date(),
    }) as Task;

  const mockUser = (
    userId: string,
    role: UserRoleEnum = UserRoleEnum.USER,
  ): User =>
    ({
      id: userId,
      username: 'test_user',
      role,
      email: 'test@example.com',
      password: 'password',
      tasks: [],
      avatar: null,
      created_at: new Date(),
      updated_at: new Date(),
    }) as User;

  const mockDeleteResult = (affected: number): DeleteResult => ({
    raw: {},
    affected,
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TaskService,
        {
          provide: getRepositoryToken(Task),
          useValue: mockTaskRepository,
        },
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    }).compile();

    taskService = module.get<TaskService>(TaskService);
    taskRepository = module.get<Repository<Task>>(
      getRepositoryToken(Task),
    ) as jest.Mocked<Repository<Task>>;
    userService = module.get<UserService>(
      UserService,
    ) as jest.Mocked<UserService>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('должен быть определен', () => {
    expect(taskService).toBeDefined();
  });

  describe('createTask', () => {
    it('должен создавать новую задачу', async () => {
      const createTaskDto: CreateTaskDto = { description: 'Test Description' };
      const userId = uuidv4();
      const task = mockTask(userId);

      taskRepository.save.mockResolvedValue(task);

      expect(await taskService.createTask(createTaskDto, userId)).toEqual(task);
      expect(taskRepository.save).toHaveBeenCalledWith({
        ...createTaskDto,
        author_id: userId,
      });
    });
  });

  describe('getTaskListByAuthorId', () => {
    it('должен возвращать список задач с пагинацией', async () => {
      const authorId = uuidv4();
      const tasks = [mockTask(authorId)];
      const count = 1;

      taskRepository.findAndCount.mockResolvedValue([tasks, count]);

      const query: GetTaskListByAuthorIdDto = { page: 1, perPage: 10 };
      const result = await taskService.getTaskListByAuthorId(authorId, query);

      expect(result).toEqual({
        entities: tasks,
        pagination: { page: 1, perPage: 10, totalItems: count, totalPages: 1 },
      });
      expect(taskRepository.findAndCount).toHaveBeenCalled();
    });
  });

  describe('getTask', () => {
    it('должен возвращать задачу по id', async () => {
      const task = mockTask(uuidv4());

      taskRepository.findOne.mockResolvedValue(task);

      expect(await taskService.getTask(task.id)).toEqual(task);
      expect(taskRepository.findOne).toHaveBeenCalledWith({
        where: { id: task.id },
        relations: { author: true },
      });
    });

    it('должен выбрасывать исключение если задача не найдена', async () => {
      const taskId = uuidv4();
      taskRepository.findOne.mockResolvedValue(null);

      await expect(taskService.getTask(taskId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateTask', () => {
    it('должен обновлять задачу если пользователь автор или администратор', async () => {
      const updateTaskDto: UpdateTaskDto = {
        description: 'Updated Description',
      };
      const userId = uuidv4();
      const task = mockTask(userId);
      const user = mockUser(userId, UserRoleEnum.USER);

      userService.getUserById.mockResolvedValue(user);
      taskRepository.findOne.mockResolvedValue(task);
      taskRepository.save.mockResolvedValue({ ...task, ...updateTaskDto });

      const result = await taskService.updateTask(
        task.id,
        updateTaskDto,
        userId,
      );

      const expectedTask = { id: task.id, ...updateTaskDto };

      expect(result).toEqual({ ...task, ...updateTaskDto });
      expect(taskRepository.save).toHaveBeenCalledWith(expectedTask);
    });

    it('должен выбрасывать исключение если пользователь не автор и не администратор', async () => {
      const updateTaskDto: UpdateTaskDto = {
        description: 'Updated Description',
      };
      const userId = uuidv4();
      const otherUserId = uuidv4();
      const task = mockTask(otherUserId);
      const user = mockUser(userId, UserRoleEnum.USER);

      userService.getUserById.mockResolvedValue(user);
      taskRepository.findOne.mockResolvedValue(task);

      await expect(
        taskService.updateTask(task.id, updateTaskDto, userId),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('deleteTask', () => {
    it('должен удалять задачу если пользователь автор или администратор', async () => {
      const userId = uuidv4();
      const task = mockTask(userId);
      const user = mockUser(userId, UserRoleEnum.USER);

      userService.getUserById.mockResolvedValue(user);
      taskRepository.findOne.mockResolvedValue(task);
      taskRepository.delete.mockResolvedValue(mockDeleteResult(1));

      expect(await taskService.deleteTask(task.id, userId)).toEqual(true);
      expect(taskRepository.delete).toHaveBeenCalledWith(task.id); // Here it should be string id, not an object
    });

    it('должен выбрасывать исключение если пользователь не автор и не администратор', async () => {
      const userId = uuidv4();
      const otherUserId = uuidv4();
      const task = mockTask(otherUserId);
      const user = mockUser(userId, UserRoleEnum.USER);

      userService.getUserById.mockResolvedValue(user);
      taskRepository.findOne.mockResolvedValue(task);

      await expect(taskService.deleteTask(task.id, userId)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('должен выбрасывать исключение если удаление не удалось', async () => {
      const userId = uuidv4();
      const task = mockTask(userId);
      const user = mockUser(userId, UserRoleEnum.USER);

      userService.getUserById.mockResolvedValue(user);
      taskRepository.findOne.mockResolvedValue(task);
      taskRepository.delete.mockResolvedValue(mockDeleteResult(0));

      await expect(taskService.deleteTask(task.id, userId)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
