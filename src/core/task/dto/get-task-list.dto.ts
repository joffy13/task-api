import { IsOptional, IsEnum, IsUUID } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { SortValueEnum } from '../../../common/types/enums/sort-value.enum';
import { TaskSortByEnum } from '../../../common/types/enums/task-sort-by.enum';

export class GetTaskListByAuthorIdDto {
  @ApiPropertyOptional({ description: 'Номер страници', default: 1 })
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({ description: 'Номер страницы', default: 10 })
  @IsOptional()
  perPage?: number;

  @ApiPropertyOptional({
    description: 'Поле по котором идёт сортировка',
    enum: TaskSortByEnum,
    default: TaskSortByEnum.CREATED_AT,
  })
  @IsEnum(TaskSortByEnum)
  @IsOptional()
  sortBy?: TaskSortByEnum;

  @ApiPropertyOptional({
    description: 'Порядок сортировки',
    enum: SortValueEnum,
    default: SortValueEnum.ASC,
  })
  @IsEnum(SortValueEnum)
  @IsOptional()
  sortValue?: SortValueEnum;

  @ApiPropertyOptional({ description: 'Фильтр по выполненым задачам' })
  @IsOptional()
  completed?: boolean;

  @ApiPropertyOptional({
    description: 'Если указан id то будут таски этого пользователя',
  })
  @IsUUID()
  @IsOptional()
  authorId?: string;
}
