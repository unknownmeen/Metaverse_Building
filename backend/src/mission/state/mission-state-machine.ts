import { BadRequestException } from '@nestjs/common';
import { MissionStatus } from '@prisma/client';
import { IMissionState } from './mission-state.interface';
import { PendingState } from './pending.state';
import { InProgressState } from './in-progress.state';
import { JudgingState } from './judging.state';
import { NeedsFixState } from './needs-fix.state';
import { DoneState } from './done.state';

export class MissionStateMachine {
  private readonly states: Map<MissionStatus, IMissionState> = new Map([
    [MissionStatus.PENDING, new PendingState()],
    [MissionStatus.IN_PROGRESS, new InProgressState()],
    [MissionStatus.JUDGING, new JudgingState()],
    [MissionStatus.NEEDS_FIX, new NeedsFixState()],
    [MissionStatus.DONE, new DoneState()],
  ]);

  validateTransition(current: MissionStatus, target: MissionStatus): void {
    const state = this.states.get(current);
    if (!state) {
      throw new BadRequestException(`وضعیت نامعتبر: ${current}`);
    }
    if (!state.canTransitionTo(target)) {
      throw new BadRequestException(
        `انتقال از ${current} به ${target} مجاز نیست. وضعیت‌های مجاز: ${state.getAllowedTransitions().join(', ')}`,
      );
    }
  }
}
