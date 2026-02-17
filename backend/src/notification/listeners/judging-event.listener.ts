import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { NotificationType } from '@prisma/client';
import { StepStatus } from '@prisma/client';
import { JUDGING_STEP_UPDATED, JudgingStepUpdatedEvent } from '../../common/events/judging.events';
import { NotificationService } from '../notification.service';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class JudgingEventListener {
  constructor(
    private notificationService: NotificationService,
    private prisma: PrismaService,
  ) {}

  @OnEvent(JUDGING_STEP_UPDATED)
  async onJudgingStepUpdated(payload: JudgingStepUpdatedEvent) {
    const mission = await this.prisma.mission.findUnique({
      where: { id: payload.missionId },
      select: { assigneeId: true },
    });
    if (!mission) return;

    if (payload.newStatus === StepStatus.WAITING_JUDGE) {
      const step = await this.prisma.judgingStep.findUnique({
        where: { id: payload.stepId },
        select: { judgeId: true, title: true },
      });
      if (!step) return;
      await this.notificationService.create({
        type: NotificationType.APPROVAL,
        text: `گام «${step.title}» برای داوری ارسال شده است`,
        userId: step.judgeId,
        senderId: mission.assigneeId,
        missionId: payload.missionId,
        stepId: payload.stepId,
      });
    } else if (payload.newStatus === StepStatus.APPROVED || payload.newStatus === StepStatus.NEEDS_FIX) {
      const text =
        payload.newStatus === StepStatus.APPROVED
          ? 'داور گام را تأیید کرد'
          : 'داور گام را نیازمند اصلاح اعلام کرد';
      const type = payload.newStatus === StepStatus.APPROVED ? NotificationType.APPROVAL : NotificationType.FIX;
      await this.notificationService.create({
        type,
        text,
        userId: mission.assigneeId,
        senderId: payload.judgeId,
        missionId: payload.missionId,
        stepId: payload.stepId,
      });
    }
  }
}