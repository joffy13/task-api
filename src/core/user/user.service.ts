import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { RegisterUserDto } from '../auth/dto/register-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, TypeORMError } from 'typeorm';
import { User } from '../../database/entities/user.entity';
import { ConfigService } from '@nestjs/config';
import { ListResultType } from '../../common/types/results/list-result.type';
import { GetUserListDto } from './dto/get-user-list.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    private configService: ConfigService,
  ) {}

  async create(dto: RegisterUserDto): Promise<User> {
    const existingUser = await this.getUserByEmail(dto.email);

    if (existingUser) {
      throw new ConflictException(
        `User with email ${dto.email} already exists`,
      );
    }
    const newUser: any = this.userRepository.create(dto);

    return this.userRepository.save(newUser);
  }

  async getUserList(query: GetUserListDto): Promise<ListResultType<User>> {
    const page = query.page || 1;
    const perPage = query.perPage || 10;

    const filters = {
      ...(query.username && { username: query.username }),
      ...(query.role && { role: query.role }),
    };

    const [users, count] = await this.userRepository.findAndCount({
      where: filters,
      skip: (page - 1) * perPage,
      take: perPage,
      order: {
        [query.sortBy || 'created_at']: query.sortValue || 'asc',
      },
    });
    const totalPages = Math.ceil(count / perPage);

    return {
      entities: users,
      pagination: { page, perPage, totalItems: count, totalPages },
    };
  }

  async getUserById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    return user;
  }

  async getUserByEmail(email: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { email } });
    return user;
  }

  async updateUser(
    id: string,
    data: UpdateUserDto,
    avatar?: Express.Multer.File,
  ): Promise<User> {
    let avatarUrl;
    if (avatar) {
      avatarUrl = `${this.configService.get('APP_URL')}/uploads/avatars/${avatar.filename}`;
    }
    try {
      await this.userRepository.save({ id, ...data, avatar: avatarUrl });
    } catch (error) {
      throw new TypeORMError('User update failed');
    }
    return this.getUserById(id);
  }

  async deleteUser(id: string): Promise<boolean> {
    await this.userRepository.delete({ id });
    return true;
  }
}
