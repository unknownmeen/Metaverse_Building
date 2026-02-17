import { StepStatus } from '@prisma/client';
import { IStepState } from './step-state.interface';

export class ApprovedState implements IStepState {
  getStatus(): StepStatus {
    return StepStatus.APPROVED;
  }

  canTransitionTo(_target: StepStatus): boolean {
    return false;
  }

  getAllowedTransitions(): StepStatus[] {
    return [];
  }
}
