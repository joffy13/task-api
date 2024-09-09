import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { TaskService } from './task.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { GetTaskListByAuthorIdDto } from './dto/get-task-list.dto';
import { UserId } from '../../common/decorators/user-id.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AllResultType } from '../../common/types/results/all-result.type';
import { Task } from '../../database/entities/task.entity';

@ApiTags('task')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('task')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}
  @ApiOperation({ summary: 'Создание новой задачи' })
  @ApiResponse({
    status: 201,
    description: 'Задача успешно создана.',
    type: AllResultType<Task>,
  })
  @Post()
  createTask(@Body() createTaskDto: CreateTaskDto, @UserId() userId: string) {
    return this.taskService.createTask(createTaskDto, userId);
  }

  @ApiOperation({ summary: 'Получение списка задач по автору' })
  @ApiResponse({
    status: 200,
    description: 'Список задач автора успешно получен.',
    type: AllResultType<Task>,
  })
  @Get('by-author')
  getTaskListByAuthorId(
    @UserId() id: string,
    @Query() query: GetTaskListByAuthorIdDto,
  ) {
    return this.taskService.getTaskListByAuthorId(id, query);
  }

  @ApiOperation({ summary: 'Получение задачи по ID' })
  @ApiResponse({
    status: 200,
    description: 'Задача успешно получена.',
    type: AllResultType<Task>,
  })
  @Get(':id')
  getTask(@Param('id') id: string) {
    return this.taskService.getTask(id);
  }

  @ApiOperation({ summary: 'Обновление задачи' })
  @ApiResponse({
    status: 200,
    description: 'Задача успешно обновлена.',
    type: AllResultType<Task>,
  })
  @Patch(':id')
  updateTask(
    @Param('id') id: string,
    @Body() updateTaskDto: UpdateTaskDto,
    @UserId() userId: string,
  ) {
    return this.taskService.updateTask(id, updateTaskDto, userId);
  }

  @ApiOperation({ summary: 'Удаление задачи' })
  @ApiResponse({
    status: 200,
    description: 'Задача успешно удалена.',
    type: AllResultType<Task>,
  })
  @Delete(':id')
  deleteTask(@Param('id') id: string, @UserId() userId: string) {
    return this.taskService.deleteTask(id, userId);
  }
}
