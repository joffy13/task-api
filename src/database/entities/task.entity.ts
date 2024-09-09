import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class Task {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ description: 'ID задачи' })
  id: string;

  @Column()
  @ApiProperty({ description: 'Описание задачи' })
  description: string;

  @ManyToOne(() => User, (user) => user.tasks)
  @JoinColumn({ referencedColumnName: 'id', name: 'author_id' })
  @ApiProperty({
    type: () => User,
    description: 'Пользователь, которому принадлежит задача',
  })
  author: User;

  @Column()
  @ApiProperty({
    type: String,
    description: 'ID пользователя, которому принадлежит задача',
  })
  author_id: string;

  @Column({ default: false })
  @ApiProperty({ description: 'Статус выполнения задачи (по умолчанию false)' })
  completed: boolean;

  @CreateDateColumn()
  created_at: Date;
}
