import { BadRequestException } from '@nestjs/common';
import { StepStatus } from '@prisma/client';
import { IStepState } from './step-state.interface';
import { NotDoneState } from './not-done.state';
import { WaitingJudgeState } from './waiting-judge.state';
import { StepNeedsFixState } from './step-needs-fix.state';
import { ApprovedState } from './approved.state';

export class StepStateMachine {
  private readonly states: Map<StepStatus, IStepState> = new Map([
    [StepStatus.NOT_DONE, new NotDoneState()],
    [StepStatus.WAITING_JUDGE, new WaitingJudgeState()],
    [StepStatus.NEEDS_FIX, new StepNeedsFixState()],
    [StepStatus.APPROVED, new ApprovedState()],
  ]);

  validateTransition(current: StepStatus, target: StepStatus): void {
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
