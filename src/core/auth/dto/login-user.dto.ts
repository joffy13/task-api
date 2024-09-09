import { IsEmail, IsStrongPassword } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginUserDto {
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
}
