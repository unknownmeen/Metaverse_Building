import { MissionStatus } from '@prisma/client';
import { IMissionState } from './mission-state.interface';

export class PendingState implements IMissionState {
  getStatus(): MissionStatus {
    return MissionStatus.PENDING;
  }

  canTransitionTo(target: MissionStatus): boolean {
    return target === MissionStatus.IN_PROGRESS;
  }

  getAllowedTransitions(): MissionStatus[] {
    return [MissionStatus.IN_PROGRESS];
  }
}
