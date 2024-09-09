import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRoleEnum } from '../types/enums/user-role.enum';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRole = this.reflector.get<UserRoleEnum>(
      'role',
      context.getHandler(),
    );
    if (!requiredRole) {
      return true;
    }
    const req = context.switchToHttp().getRequest();
    console.log(req.user);
    if (requiredRole != req.user.role) {
      throw new ForbiddenException('У Вас не хватает прав');
    }
    return true;
  }
}
