import { BadRequestException, Injectable } from '@nestjs/common';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private userService: UserService,
  ) {}
  async register(dto: RegisterUserDto) {
    dto.password = await bcrypt.hash(dto.password, 10);
    const newUser = await this.userService.create(dto);

    const payload = {
      role: newUser.role,
      email: newUser.email,
      id: newUser.id,
    };
    return { token: this.jwtService.sign(payload), user: newUser };
  }
  async login(dto: LoginUserDto) {
    const user = await this.userService.getUserByEmail(dto.email);

    const compareResult = await bcrypt.compare(dto.password, user.password);

    if (!user || !compareResult) {
      throw new BadRequestException('Неправильный email или пароль');
    }
    const payload = { role: user.role, email: user.email, id: user.id };
    return { token: this.jwtService.sign(payload), user: user };
  }
}
