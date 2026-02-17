import { MissionStatus } from '@prisma/client';
import { IMissionState } from './mission-state.interface';

export class JudgingState implements IMissionState {
  getStatus(): MissionStatus {
    return MissionStatus.JUDGING;
  }

  canTransitionTo(target: MissionStatus): boolean {
    return target === MissionStatus.NEEDS_FIX || target === MissionStatus.DONE;
  }

  getAllowedTransitions(): MissionStatus[] {
    return [MissionStatus.NEEDS_FIX, MissionStatus.DONE];
  }
}
