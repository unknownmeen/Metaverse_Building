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

const DEFAULT_JWT_EXPIRES_IN = '7d';

function parseExpiresInToSeconds(value?: string): number {
  const raw = (value || DEFAULT_JWT_EXPIRES_IN).trim();
  const numeric = Number(raw);
  if (Number.isFinite(numeric) && numeric > 0) {
    return Math.floor(numeric);
  }

  const match = raw.match(/^(\d+)\s*([smhd])$/i);
  if (!match) {
    return 7 * 24 * 60 * 60;
  }

  const amount = Number(match[1]);
  const unit = match[2].toLowerCase();
  const multipliers: Record<string, number> = {
    s: 1,
    m: 60,
    h: 60 * 60,
    d: 24 * 60 * 60,
  };

  return amount * (multipliers[unit] || 1);
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
    const expiresInConfig = process.env.JWT_EXPIRES_IN || DEFAULT_JWT_EXPIRES_IN;
    const payload: JwtPayload = { sub: user.id, phone: user.phone };
    const accessToken = this.jwtService.sign(payload, { expiresIn: expiresInConfig });
    return {
      accessToken,
      expiresIn: parseExpiresInToSeconds(expiresInConfig),
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
