import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsStrongPassword,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRoleEnum } from '../../../common/types/enums/user-role.enum';

export class RegisterUserDto {
  @ApiProperty({ description: 'Имя пользователя' })
  @IsNotEmpty()
  username: string;

  @ApiProperty({ description: 'Email пользователя' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Пароль пользователя', minLength: 6 })
  @IsStrongPassword({
    minLength: 8,
    minNumbers: 1,
    minUppercase: 1,
    minSymbols: 0,
  })
  password: string;

  @ApiPropertyOptional({ description: 'Роль пользователя' })
  @IsOptional()
  @IsEnum(UserRoleEnum)
  role: UserRoleEnum;
}
