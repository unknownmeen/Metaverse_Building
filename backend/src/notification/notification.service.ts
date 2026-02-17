import { Injectable, NotFoundException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { NotificationType } from '@prisma/client';
import { NotificationRepository } from './notification.repository';

@Injectable()
export class NotificationService {
  constructor(private notificationRepo: NotificationRepository) {}

  async getNotifications(userId: number) {
    return this.notificationRepo.findByUserId(userId);
  }

  async getUnreadCount(userId: number) {
    return this.notificationRepo.countUnread(userId);
  }

  async create(data: {
    type: NotificationType;
    text: string;
    userId: number;
    senderId?: number;
    missionId?: string;
    stepId?: string;
  }) {
    const id = `n-${uuidv4().slice(0, 8)}`;
    return this.notificationRepo.create({ id, ...data });
  }

  async markRead(id: string, userId: number) {
    const notification = await this.notificationRepo.findByIdAndUser(id, userId);
    if (!notification) {
      throw new NotFoundException('اعلان یافت نشد');
    }
    await this.notificationRepo.markRead(id, userId);
    return { success: true };
  }

  async markAllRead(userId: number) {
    await this.notificationRepo.markAllRead(userId);
    return { success: true };
  }
}