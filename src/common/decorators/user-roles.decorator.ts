import { SetMetadata } from '@nestjs/common';
import { UserRoleEnum } from '../types/enums/user-role.enum';

export const UserRole = (role: UserRoleEnum) => SetMetadata('role', role);
