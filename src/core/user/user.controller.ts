import {
  Controller,
  Get,
  Body,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  Query,
  Patch,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { UserService } from './user.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { extname } from 'path';
import { UserRoleEnum } from '../../common/types/enums/user-role.enum';
import { RolesGuard } from '../../common/guards/role.guard';
import { User } from '../../database/entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserRole } from '../../common/decorators/user-roles.decorator';
import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AllResultType } from '../../common/types/results/all-result.type';
import { GetUserListDto } from './dto/get-user-list.dto';

@ApiBearerAuth()
@ApiTags('users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @ApiOperation({ summary: 'Получение списка всех пользователей' })
  @ApiResponse({
    status: 200,
    description: 'Список пользователей.',
    type: AllResultType<User[]>,
  })
  getUserList(@Query() query: GetUserListDto) {
    return this.userService.getUserList(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получение информации о пользователе по ID' })
  @ApiResponse({
    status: 200,
    description: 'Информация о пользователе.',
    type: User,
  })
  getUser(@Param('id') id: string) {
    return this.userService.getUserById(id);
  }

  @Patch(':id')
  @ApiConsumes('multipart/form-data')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('avatar', {
      storage: diskStorage({
        destination: './uploads/avatars',
        filename: (req, file, callback) => {
          const uniqueSuffix = uuidv4();
          const ext = extname(file.originalname);
          const filename = `${uniqueSuffix}${ext}`;
          callback(null, filename);
        },
      }),
    }),
  )
  @ApiBody({
    type: UpdateUserDto,
    required: true,
  })
  @ApiOperation({ summary: 'Обновление пользователя' })
  @ApiResponse({
    status: 200,
    description: 'Пользователь успешно обновлён.',
    type: User,
  })
  updateUser(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @UploadedFile() avatar: Express.Multer.File,
  ) {
    return this.userService.updateUser(id, updateUserDto, avatar);
  }

  @Delete(':id')
  @UserRole(UserRoleEnum.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Удаление пользователя' })
  @ApiResponse({ status: 204, description: 'Пользователь успешно удалён.' })
  deleteUser(@Param('id') id: string) {
    return this.userService.deleteUser(id);
  }
}
