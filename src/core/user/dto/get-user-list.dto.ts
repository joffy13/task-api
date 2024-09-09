import { IsOptional, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { UserRoleEnum } from '../../../common/types/enums/user-role.enum';
import { SortValueEnum } from '../../../common/types/enums/sort-value.enum';
import { UserSortByEnum } from '../../../common/types/enums/user-sort-by.enum';

export class GetUserListDto {
  @ApiPropertyOptional({ description: 'Номер страници', default: 1 })
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({ description: 'Номер страницы', default: 10 })
  @IsOptional()
  perPage?: number;

  @ApiPropertyOptional({
    description: 'Поле по котором идёт сортировка',
    enum: UserSortByEnum,
    default: UserSortByEnum.CREATED_AT,
  })
  @IsEnum(UserSortByEnum)
  @IsOptional()
  sortBy?: UserSortByEnum;

  @ApiPropertyOptional({
    description: 'Порядок сортировки',
    enum: SortValueEnum,
    default: SortValueEnum.ASC,
  })
  @IsEnum(SortValueEnum)
  @IsOptional()
  sortValue?: SortValueEnum;

  @ApiPropertyOptional({ description: 'Фильтр по имени' })
  @IsOptional()
  username?: string;

  @ApiPropertyOptional({ description: 'Фильтр по роли', enum: UserRoleEnum })
  @IsEnum(UserRoleEnum)
  @IsOptional()
  role?: UserRoleEnum;
}
