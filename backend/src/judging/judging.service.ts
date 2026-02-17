import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { v4 as uuidv4 } from 'uuid';
import { StepStatus } from '@prisma/client';
import { JudgingRepository } from './judging.repository';
import { StepStateMachine } from './state/step-state-machine';
import { CreateJudgingStepInput } from './dto/create-judging-step.input';
import { JUDGING_STEP_UPDATED, JudgingStepUpdatedEvent } from '../common/events/judging.events';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class JudgingService {
  private stateMachine = new StepStateMachine();

  constructor(
    private judgingRepo: JudgingRepository,
    private eventEmitter: EventEmitter2,
    private prisma: PrismaService,
  ) {}

  async findById(id: string) {
    return this.judgingRepo.findById(id);
  }

  async create(input: CreateJudgingStepInput, userId: number) {
    const mission = await this.prisma.mission.findUnique({ where: { id: input.missionId } });
    if (!mission) throw new NotFoundException('ماموریت یافت نشد');
    const order = (await this.judgingRepo.getMaxOrder(input.missionId)) + 1;
    const id = `js-${uuidv4().slice(0, 8)}`;
    return this.judgingRepo.create({
      id,
      title: input.title,
      order,
      judgeId: input.judgeId,
      missionId: input.missionId,
    });
  }

  async updateStepStatus(stepId: string, newStatus: StepStatus, userId: number) {
    const step = await this.judgingRepo.findById(stepId);
    if (!step) throw new NotFoundException('گام داوری یافت نشد');

    const mission = await this.prisma.mission.findUnique({
      where: { id: step.missionId },
      include: { judgingSteps: { orderBy: { order: 'asc' } } },
    });
    if (!mission) throw new NotFoundException('ماموریت یافت نشد');

    const isAssignee = mission.assigneeId === userId;
    const isJudge = step.judgeId === userId;

    if (newStatus === StepStatus.WAITING_JUDGE) {
      if (!isAssignee) {
        throw new ForbiddenException('فقط انجام‌دهنده مأموریت می‌تواند گام را برای داوری ارسال کند');
      }
    } else {
      if (!isJudge) {
        throw new ForbiddenException('فقط داور این گام می‌تواند وضعیت را تغییر دهد');
      }
    }

    this.stateMachine.validateTransition(step.status, newStatus);
    const previousStatus = step.status;
    const updated = await this.judgingRepo.updateStatus(stepId, newStatus);

    const allSteps = mission.judgingSteps;
    const stepsWithNewStatus = allSteps.map((s) =>
      s.id === stepId ? newStatus : s.status
    );
    const missionStatus = this.deriveMissionStatusFromSteps(stepsWithNewStatus);
    if (missionStatus) {
      await this.prisma.mission.update({
        where: { id: step.missionId },
        data: { status: missionStatus },
      });
    }

    this.eventEmitter.emit(JUDGING_STEP_UPDATED, {
      stepId,
      missionId: step.missionId,
      previousStatus,
      newStatus,
      judgeId: isJudge ? userId : step.judgeId,
    } as JudgingStepUpdatedEvent);

    return updated;
  }

  private deriveMissionStatusFromSteps(
    stepStatuses: StepStatus[],
  ): 'DONE' | 'NEEDS_FIX' | 'JUDGING' | 'IN_PROGRESS' | null {
    if (!stepStatuses.length) return null;
    const hasNeedsFix = stepStatuses.some((s) => s === StepStatus.NEEDS_FIX);
    const hasWaitingJudge = stepStatuses.some((s) => s === StepStatus.WAITING_JUDGE);
    const allApproved = stepStatuses.every((s) => s === StepStatus.APPROVED);
    if (allApproved) return 'DONE';
    if (hasNeedsFix) return 'NEEDS_FIX';
    if (hasWaitingJudge) return 'JUDGING';
    return 'IN_PROGRESS';
  }
}