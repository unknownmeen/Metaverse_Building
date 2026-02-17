import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationType } from '@prisma/client';

@Injectable()
export class NotificationRepository {
  constructor(private prisma: PrismaService) {}

  async findByUserId(userId: number) {
    return this.prisma.notification.findMany({
      where: { userId },
      include: { sender: { select: { id: true, name: true, phone: true, avatarId: true, role: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async countUnread(userId: number) {
    return this.prisma.notification.count({
      where: { userId, read: false },
    });
  }

  async create(data: {
    id: string;
    type: NotificationType;
    text: string;
    userId: number;
    senderId?: number;
    missionId?: string;
    stepId?: string;
  }) {
    return this.prisma.notification.create({
      data,
      include: { sender: { select: { id: true, name: true, phone: true, avatarId: true, role: true } } },
    });
  }

  async findByIdAndUser(id: string, userId: number) {
    return this.prisma.notification.findFirst({
      where: { id, userId },
    });
  }

  async markRead(id: string, userId: number) {
    return this.prisma.notification.updateMany({
      where: { id, userId },
      data: { read: true },
    });
  }

  async markAllRead(userId: number) {
    return this.prisma.notification.updateMany({
      where: { userId },
      data: { read: true },
    });
  }
}