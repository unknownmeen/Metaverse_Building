import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserRole } from '@prisma/client';

@Injectable()
export class UserRepository {
  constructor(private prisma: PrismaService) {}

  async findById(id: number) {
    return this.prisma.user.findUnique({
      where: { id },
      select: { id: true, name: true, phone: true, avatarId: true, role: true, createdAt: true, updatedAt: true },
    });
  }

  async findByPhone(phone: string) {
    return this.prisma.user.findUnique({ where: { phone } });
  }

  async findAll() {
    return this.prisma.user.findMany({
      where: { role: { not: 'OBSERVER' } },
      select: { id: true, name: true, phone: true, avatarId: true, role: true, createdAt: true, updatedAt: true },
      orderBy: { id: 'asc' },
    });
  }

  async update(id: number, data: { name?: string; avatarId?: string; password?: string }) {
    return this.prisma.user.update({
      where: { id },
      data,
      select: { id: true, name: true, phone: true, avatarId: true, role: true, createdAt: true, updatedAt: true },
    });
  }
}