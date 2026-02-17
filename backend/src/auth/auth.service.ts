import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { UserRole } from '@prisma/client';

export interface JwtPayload {
  sub: number;
  phone: string;
}

export interface UserFromJwt {
  id: number;
  phone: string;
  role: UserRole;
}

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async validateUser(phone: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { phone } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return null;
    }
    const { password: _, ...result } = user;
    return result;
  }

  async login(phone: string, password: string) {
    const user = await this.validateUser(phone, password);
    if (!user) {
      throw new UnauthorizedException('نام کاربری یا رمز عبور اشتباه است');
    }
    const payload: JwtPayload = { sub: user.id, phone: user.phone };
    const accessToken = this.jwtService.sign(payload);
    return {
      accessToken,
      expiresIn: 3600,
    };
  }

  async getUserFromPayload(payload: JwtPayload): Promise<UserFromJwt | null> {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, phone: true, role: true },
    });
    return user;
  }
}
