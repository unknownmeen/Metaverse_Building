import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { NotificationType } from '@prisma/client';
import { CHAT_MESSAGE_SENT, ChatMessageSentEvent } from '../../common/events/chat.events';
import { NotificationService } from '../notification.service';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ChatEventListener {
  constructor(
    private notificationService: NotificationService,
    private prisma: PrismaService,
  ) {}

  @OnEvent(CHAT_MESSAGE_SENT)
  async onChatMessageSent(payload: ChatMessageSentEvent) {
    const sender = await this.prisma.user.findUnique({
      where: { id: payload.senderId },
      select: { name: true },
    });
    const senderName = sender?.name ?? 'کاربر';
    for (const recipientId of payload.recipientIds) {
      await this.notificationService.create({
        type: NotificationType.CHAT,
        text: `${senderName} پیام جدیدی ارسال کرد`,
        userId: recipientId,
        senderId: payload.senderId,
        missionId: payload.missionId,
      });
    }
  }
}