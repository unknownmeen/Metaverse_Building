import { MissionStatus } from '@prisma/client';
import { IMissionState } from './mission-state.interface';

export class NeedsFixState implements IMissionState {
  getStatus(): MissionStatus {
    return MissionStatus.NEEDS_FIX;
  }

  canTransitionTo(target: MissionStatus): boolean {
    return target === MissionStatus.JUDGING;
  }

  getAllowedTransitions(): MissionStatus[] {
    return [MissionStatus.JUDGING];
  }
}
