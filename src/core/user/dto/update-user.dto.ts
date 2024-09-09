import { IsOptional, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { UserRoleEnum } from '../../../common/types/enums/user-role.enum';

export class UpdateUserDto {
  @ApiPropertyOptional({ description: 'Имя пользователя' })
  @IsOptional()
  username?: string;

  @ApiPropertyOptional({ description: 'Email пользователя' })
  @IsOptional({ always: true })
  email?: string;

  @ApiPropertyOptional({ description: 'Роль пользователя', enum: UserRoleEnum })
  @IsOptional()
  @IsEnum(UserRoleEnum)
  role?: UserRoleEnum;

  @ApiPropertyOptional({
    type: 'array',
    items: {
      type: 'string',
      format: 'binary',
    },
    required: false,
  })
  avatar?: Express.Multer.File | string;
}
