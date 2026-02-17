import { StepStatus } from '@prisma/client';

export interface IStepState {
  getStatus(): StepStatus;
  canTransitionTo(target: StepStatus): boolean;
  getAllowedTransitions(): StepStatus[];
}
