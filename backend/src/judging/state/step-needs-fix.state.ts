import { StepStatus } from '@prisma/client';
import { IStepState } from './step-state.interface';

export class StepNeedsFixState implements IStepState {
  getStatus(): StepStatus {
    return StepStatus.NEEDS_FIX;
  }

  canTransitionTo(target: StepStatus): boolean {
    return target === StepStatus.WAITING_JUDGE;
  }

  getAllowedTransitions(): StepStatus[] {
    return [StepStatus.WAITING_JUDGE];
  }
}
