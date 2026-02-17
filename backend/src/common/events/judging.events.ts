import { StepStatus } from '@prisma/client';

export const JUDGING_STEP_UPDATED = 'judging.step.updated';

export class JudgingStepUpdatedEvent {
  stepId: string;
  missionId: string;
  previousStatus: StepStatus;
  newStatus: StepStatus;
  judgeId: number;
}
