import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, MaxLength, MinLength } from 'class-validator';

export class CreateTaskDto {
  @ApiProperty({
    description: 'Описание задачи',
    maxLength: 256,
    minLength: 6,
    type: String,
  })
  @MinLength(6)
  @MaxLength(256)
  @IsNotEmpty()
  description: string;
}
