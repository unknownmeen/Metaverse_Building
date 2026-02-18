import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StepStatus } from '@prisma/client';

@Injectable()
export class JudgingRepository {
  constructor(private prisma: PrismaService) {}

  async findById(id: string) {
    return this.prisma.judgingStep.findUnique({
      where: { id },
      include: { judge: { select: { id: true, name: true, phone: true, avatarId: true, role: true } }, mission: true },
    });
  }

  async create(data: { id: string; title: string; order: number; judgeId: number; missionId: string }) {
    return this.prisma.judgingStep.create({
      data: { ...data, status: StepStatus.NOT_DONE },
      include: { judge: { select: { id: true, name: true, phone: true, avatarId: true, role: true } } },
    });
  }

  async updateStatus(id: string, status: StepStatus) {
    return this.prisma.judgingStep.update({
      where: { id },
      data: { status },
      include: { judge: { select: { id: true, name: true, phone: true, avatarId: true, role: true } }, mission: true },
    });
  }

  async update(id: string, data: { title?: string; judgeId?: number }) {
    return this.prisma.judgingStep.update({
      where: { id },
      data,
      include: { judge: { select: { id: true, name: true, phone: true, avatarId: true, role: true } }, mission: true },
    });
  }

  async getMaxOrder(missionId: string) {
    const last = await this.prisma.judgingStep.findFirst({
      where: { missionId },
      orderBy: { order: 'desc' },
      select: { order: true },
    });
    return last?.order ?? 0;
  }
}
