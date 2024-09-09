import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, MaxLength, MinLength } from 'class-validator';

export class UpdateTaskDto {
  @ApiPropertyOptional({
    description: 'Описание задачи',
    maxLength: 256,
    minLength: 6,
    type: String,
  })
  @MinLength(6)
  @MaxLength(256)
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: 'Статус выполнения задачи',
    type: Boolean,
  })
  @IsBoolean()
  @IsOptional()
  completed?: boolean;
}
