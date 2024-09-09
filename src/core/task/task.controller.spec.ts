import { Test, TestingModule } from '@nestjs/testing';
import { TaskController } from './task.controller';
import { TaskService } from './task.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { GetTaskListByAuthorIdDto } from './dto/get-task-list.dto';
import { v4 as uuidv4 } from 'uuid';

describe('TaskController', () => {
  let taskController: TaskController;
  // let taskService: TaskService;

  const mockTaskService = {
    createTask: jest.fn(),
    getTaskListByAuthorId: jest.fn(),
    getTask: jest.fn(),
    updateTask: jest.fn(),
    deleteTask: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TaskController],
      providers: [
        {
          provide: TaskService,
          useValue: mockTaskService,
        },
      ],
    }).compile();

    taskController = module.get<TaskController>(TaskController);
    // taskService = module.get<TaskService>(TaskService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('должен быть определен', () => {
    expect(taskController).toBeDefined();
  });

  describe('createTask', () => {
    it('должен создавать новую задачу', async () => {
      const createTaskDto: CreateTaskDto = { description: 'Test Description' };
      const userId = uuidv4();
      const result = { id: uuidv4(), ...createTaskDto, author_id: userId };

      mockTaskService.createTask.mockResolvedValue(result);

      expect(await taskController.createTask(createTaskDto, userId)).toEqual(
        result,
      );
      expect(mockTaskService.createTask).toHaveBeenCalledWith(
        createTaskDto,
        userId,
      );
    });
  });

  describe('getTaskListByAuthorId', () => {
    it('должен возвращать список задач для автора с пагинацией', async () => {
      const userId = uuidv4();
      const query: GetTaskListByAuthorIdDto = { page: 1, perPage: 10 };
      const result = {
        entities: [],
        pagination: { page: 1, perPage: 10, totalItems: 0, totalPages: 0 },
      };

      mockTaskService.getTaskListByAuthorId.mockResolvedValue(result);

      expect(await taskController.getTaskListByAuthorId(userId, query)).toEqual(
        result,
      );
      expect(mockTaskService.getTaskListByAuthorId).toHaveBeenCalledWith(
        userId,
        query,
      );
    });
  });

  describe('getTask', () => {
    it('должен возвращать задачу по id', async () => {
      const taskId = uuidv4();
      const result = {
        id: taskId,
        title: 'Test Task',
        description: 'Test Description',
        author_id: uuidv4(),
      };

      mockTaskService.getTask.mockResolvedValue(result);

      expect(await taskController.getTask(taskId)).toEqual(result);
      expect(mockTaskService.getTask).toHaveBeenCalledWith(taskId);
    });
  });

  describe('updateTask', () => {
    it('должен обновлять задачу', async () => {
      const taskId = uuidv4();
      const updateTaskDto: UpdateTaskDto = {
        description: 'Updated Description',
      };
      const userId = uuidv4();
      const result = { id: taskId, ...updateTaskDto, author_id: userId };

      mockTaskService.updateTask.mockResolvedValue(result);

      expect(
        await taskController.updateTask(taskId, updateTaskDto, userId),
      ).toEqual(result);
      expect(mockTaskService.updateTask).toHaveBeenCalledWith(
        taskId,
        updateTaskDto,
        userId,
      );
    });
  });

  describe('deleteTask', () => {
    it('должен удалять задачу', async () => {
      const taskId = uuidv4();
      const userId = uuidv4();

      mockTaskService.deleteTask.mockResolvedValue(true);

      expect(await taskController.deleteTask(taskId, userId)).toEqual(true);
      expect(mockTaskService.deleteTask).toHaveBeenCalledWith(taskId, userId);
    });
  });
});
