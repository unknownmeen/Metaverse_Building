import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { MissionStatus, NotificationType } from '@prisma/client';
import {
  MISSION_STATUS_UPDATED,
  MissionStatusUpdatedEvent,
  MISSION_ASSIGNED,
  MissionAssignedEvent,
} from '../../common/events/mission.events';
import { NotificationService } from '../notification.service';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class MissionEventListener {
  constructor(
    private notificationService: NotificationService,
    private prisma: PrismaService,
  ) {}

  @OnEvent(MISSION_STATUS_UPDATED)
  async onMissionStatusUpdated(payload: MissionStatusUpdatedEvent) {
    if (payload.newStatus !== MissionStatus.NEEDS_FIX && payload.newStatus !== MissionStatus.DONE) return;
    const mission = await this.prisma.mission.findUnique({
      where: { id: payload.missionId },
      select: { assigneeId: true },
    });
    if (!mission || mission.assigneeId == null) return;
    const text = this.getStatusUpdatedText(payload.newStatus);
    await this.notificationService.create({
      type: payload.newStatus === MissionStatus.NEEDS_FIX ? NotificationType.FIX : NotificationType.APPROVAL,
      text,
      userId: mission.assigneeId,
      senderId: payload.userId,
      missionId: payload.missionId,
    });
  }

  private getStatusUpdatedText(status: MissionStatus): string {
    const labels: Record<MissionStatus, string> = {
      [MissionStatus.PENDING]: 'وضعیت ماموریت به «در انتظار پذیرفتن» تغییر کرد',
      [MissionStatus.IN_PROGRESS]: 'وضعیت ماموریت به «در حال انجام» تغییر کرد',
      [MissionStatus.JUDGING]: 'وضعیت ماموریت به «در حال داوری» تغییر کرد',
      [MissionStatus.NEEDS_FIX]: 'مأموریت نیازمند اصلاح است',
      [MissionStatus.DONE]: 'مأموریت تأیید شد',
    };
    return labels[status] ?? 'وضعیت ماموریت تغییر کرد';
  }

  @OnEvent(MISSION_ASSIGNED)
  async onMissionAssigned(payload: MissionAssignedEvent) {
    const mission = await this.prisma.mission.findUnique({
      where: { id: payload.missionId },
      select: { creatorId: true },
    });
    if (!mission?.creatorId) return;
    await this.notificationService.create({
      type: NotificationType.ASSIGNMENT,
      text: 'مأموریت توسط انجام‌دهنده پذیرفته شد',
      userId: mission.creatorId,
      senderId: payload.newAssigneeId,
      missionId: payload.missionId,
    });
  }
}