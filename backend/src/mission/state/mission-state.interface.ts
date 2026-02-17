import { MissionStatus } from '@prisma/client';

export interface IMissionState {
  getStatus(): MissionStatus;
  canTransitionTo(target: MissionStatus): boolean;
  getAllowedTransitions(): MissionStatus[];
}
