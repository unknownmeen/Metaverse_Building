import { MissionStatus } from '@prisma/client';
import { IMissionState } from './mission-state.interface';

export class InProgressState implements IMissionState {
  getStatus(): MissionStatus {
    return MissionStatus.IN_PROGRESS;
  }

  canTransitionTo(target: MissionStatus): boolean {
    return target === MissionStatus.JUDGING;
  }

  getAllowedTransitions(): MissionStatus[] {
    return [MissionStatus.JUDGING];
  }
}
