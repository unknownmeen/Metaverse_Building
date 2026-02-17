import { MissionStatus } from '@prisma/client';

export const MISSION_STATUS_UPDATED = 'mission.status.updated';
export const MISSION_ASSIGNED = 'mission.assigned';

export class MissionStatusUpdatedEvent {
  missionId: string;
  previousStatus: MissionStatus;
  newStatus: MissionStatus;
  userId: number;
}

export class MissionAssignedEvent {
  missionId: string;
  previousAssigneeId: number;
  newAssigneeId: number;
  assignedById: number;
}
