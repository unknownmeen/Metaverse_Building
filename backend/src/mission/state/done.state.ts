import { MissionStatus } from '@prisma/client';
import { IMissionState } from './mission-state.interface';

export class DoneState implements IMissionState {
  getStatus(): MissionStatus {
    return MissionStatus.DONE;
  }

  canTransitionTo(_target: MissionStatus): boolean {
    return false;
  }

  getAllowedTransitions(): MissionStatus[] {
    return [];
  }
}
