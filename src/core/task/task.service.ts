import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Repository } from 'typeorm';
import { Task } from '../../database/entities/task.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { GetTaskListByAuthorIdDto } from './dto/get-task-list.dto';
import { UserService } from '../user/user.service';
import { UserRoleEnum } from '../../common/types/enums/user-role.enum';

@Injectable()
export class TaskService {
  constructor(
    @InjectRepository(Task) private taskRepository: Repository<Task>,
    private userService: UserService,
  ) {}

  async createTask(
    createTaskDto: CreateTaskDto,
    userId: string,
  ): Promise<Task> {
    const task = await this.taskRepository.save({
      ...createTaskDto,
      author_id: userId,
    });
    return task;
  }

  async getTaskListByAuthorId(id: string, query: GetTaskListByAuthorIdDto) {
    const page = query.page || 1;
    const perPage = query.perPage || 10;

    const filters = {
      author_id: query.authorId ? query.authorId : id,
      ...(query.completed && { completed: query.completed }),
    };

    const [tasks, count] = await this.taskRepository.findAndCount({
      where: filters,
      skip: (page - 1) * perPage,
      take: perPage,
      order: {
        [query.sortBy || 'created_at']: query.sortValue || 'asc',
      },
      relations: { author: true },
    });
    const totalPages = Math.ceil(count / perPage);

    return {
      entities: tasks,
      pagination: { page, perPage, totalItems: count, totalPages },
    };
  }

  async getTask(id: string) {
    const task = await this.taskRepository.findOne({
      where: { id },
      relations: { author: true },
    });
    if (!task) {
      throw new NotFoundException(`Task with id ${id} not found`);
    }
    return task;
  }

  async updateTask(id: string, updateTaskDto: UpdateTaskDto, userId: string) {
    const user = await this.userService.getUserById(userId);
    const task = await this.getTask(id);

    if (!(task.author_id === userId || user.role === UserRoleEnum.ADMIN)) {
      throw new ForbiddenException('У Вас не хватает прав');
    }

    return this.taskRepository.save({ id, ...updateTaskDto });
  }

  async deleteTask(id: string, userId: string) {
    const user = await this.userService.getUserById(userId);
    const task = await this.getTask(id);

    if (!(task.author_id === userId || user.role === UserRoleEnum.ADMIN)) {
      throw new ForbiddenException('У Вас не хватает прав');
    }

    const deleteResult = await this.taskRepository.delete(id);

    if (deleteResult.affected === 0) {
      throw new BadRequestException('Failed to delete the resource');
    }

    return true;
  }
}
