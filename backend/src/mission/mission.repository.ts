import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MissionStatus, Priority } from '@prisma/client';

@Injectable()
export class MissionRepository {
  constructor(private prisma: PrismaService) {}

  async findById(id: string) {
    return this.prisma.mission.findUnique({
      where: { id },
      include: {
        assignee: { select: { id: true, name: true, phone: true, avatarId: true, role: true } },
        judgingSteps: { include: { judge: { select: { id: true, name: true, phone: true, avatarId: true, role: true } } }, orderBy: { order: 'asc' } },
        chatMessages: { include: { sender: { select: { id: true, name: true, phone: true, avatarId: true, role: true } } }, orderBy: { createdAt: 'asc' } },
        attachments: true,
      },
    });
  }

  async findByProductId(productId: string) {
    return this.prisma.mission.findMany({
      where: { productId },
      include: { assignee: { select: { id: true, name: true, phone: true, avatarId: true, role: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(data: {
    id: string;
    title: string;
    description: string;
    status: MissionStatus;
    priority: Priority;
    dueDate: Date;
    assigneeId: number;
    productId: string;
    creatorId?: number;
  }) {
    return this.prisma.mission.create({
      data,
      include: { assignee: { select: { id: true, name: true, phone: true, avatarId: true, role: true } } },
    });
  }

  async update(id: string, data: { title?: string; description?: string; priority?: Priority; dueDate?: Date }) {
    return this.prisma.mission.update({
      where: { id },
      data,
      include: { assignee: { select: { id: true, name: true, phone: true, avatarId: true, role: true } } },
    });
  }

  async updateStatus(id: string, status: MissionStatus) {
    return this.prisma.mission.update({
      where: { id },
      data: { status },
      include: { assignee: { select: { id: true, name: true, phone: true, avatarId: true, role: true } } },
    });
  }

  async updateAssignee(id: string, assigneeId: number) {
    return this.prisma.mission.update({
      where: { id },
      data: { assigneeId },
      include: { assignee: { select: { id: true, name: true, phone: true, avatarId: true, role: true } } },
    });
  }

  async updateAssigneeAndStatus(id: string, assigneeId: number, status: MissionStatus) {
    return this.prisma.mission.update({
      where: { id },
      data: { assigneeId, status },
      include: { assignee: { select: { id: true, name: true, phone: true, avatarId: true, role: true } } },
    });
  }
}