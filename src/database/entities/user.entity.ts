import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
} from 'typeorm';
import { Task } from './task.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ description: 'ID пользователя' })
  id: string;

  @Column()
  @ApiProperty({ description: 'Имя пользователя' })
  username: string;

  @Column({ unique: true })
  @ApiProperty({ description: 'Email пользователя' })
  email: string;

  @Column()
  @ApiProperty({ description: 'Пароль пользователя' })
  password: string;

  @OneToMany(() => Task, (task) => task.author)
  @ApiProperty({ type: () => [Task], description: 'Список задач пользователя' })
  tasks: Task[];

  @Column({ nullable: true })
  @ApiProperty({ description: 'URL к аватару пользователя (если есть)' })
  avatar: string;

  @Column({ default: 'USER' })
  @ApiProperty({ description: 'Роль пользователя (по умолчанию "USER")' })
  role: string;

  @CreateDateColumn()
  created_at: Date;
}
