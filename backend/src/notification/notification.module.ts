import { Module } from '@nestjs/common';
import { NotificationResolver } from './notification.resolver';
import { NotificationService } from './notification.service';
import { NotificationRepository } from './notification.repository';
import { MissionEventListener } from './listeners/mission-event.listener';
import { JudgingEventListener } from './listeners/judging-event.listener';
import { ChatEventListener } from './listeners/chat-event.listener';

@Module({
  providers: [
    NotificationResolver,
    NotificationService,
    NotificationRepository,
    MissionEventListener,
    JudgingEventListener,
    ChatEventListener,
  ],
  exports: [NotificationService],
})
export class NotificationModule {}