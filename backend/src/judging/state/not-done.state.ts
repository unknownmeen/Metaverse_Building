import { StepStatus } from '@prisma/client';
import { IStepState } from './step-state.interface';

export class NotDoneState implements IStepState {
  getStatus(): StepStatus {
    return StepStatus.NOT_DONE;
  }

  canTransitionTo(target: StepStatus): boolean {
    return target === StepStatus.WAITING_JUDGE;
  }

  getAllowedTransitions(): StepStatus[] {
    return [StepStatus.WAITING_JUDGE];
  }
}
