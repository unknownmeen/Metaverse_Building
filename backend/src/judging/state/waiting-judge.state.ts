import { StepStatus } from '@prisma/client';
import { IStepState } from './step-state.interface';

export class WaitingJudgeState implements IStepState {
  getStatus(): StepStatus {
    return StepStatus.WAITING_JUDGE;
  }

  canTransitionTo(target: StepStatus): boolean {
    return target === StepStatus.APPROVED || target === StepStatus.NEEDS_FIX;
  }

  getAllowedTransitions(): StepStatus[] {
    return [StepStatus.APPROVED, StepStatus.NEEDS_FIX];
  }
}
