import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { v4 as uuidv4 } from 'uuid';
import { MissionStatus, Priority, UserRole } from '@prisma/client';
import { MissionRepository } from './mission.repository';
import { MissionStateMachine } from './state/mission-state-machine';
import { CreateMissionInput } from './dto/create-mission.input';
import { UpdateMissionInput } from './dto/update-mission.input';
import {
  MISSION_STATUS_UPDATED,
  MissionStatusUpdatedEvent,
  MISSION_ASSIGNED,
  MissionAssignedEvent,
} from '../common/events/mission.events';
import { UserService } from '../user/user.service';

@Injectable()
export class MissionWriteService {
  private stateMachine = new MissionStateMachine();

  constructor(
    private missionRepo: MissionRepository,
    private eventEmitter: EventEmitter2,
    private userService: UserService,
  ) {}

  private async ensureAssigneeNotObserver(assigneeId: number) {
    const user = await this.userService.findById(assigneeId);
    if (user?.role === UserRole.OBSERVER) {
      throw new BadRequestException('کاربر مانیتور نمی‌تواند انجام‌دهنده تسک باشد');
    }
  }

  async create(input: CreateMissionInput, creatorId: number) {
    if (input.assigneeId != null) {
      await this.ensureAssigneeNotObserver(input.assigneeId);
    }
    const id = `m-${uuidv4().slice(0, 8)}`;
    const hasAssignee = input.assigneeId != null;
    const created = await this.missionRepo.create({
      id,
      title: input.title,
      description: input.description ?? '',
      status: MissionStatus.PENDING,
      priority: input.priority ?? 'NORMAL',
      dueDate: new Date(input.dueDate),
      assigneeId: input.assigneeId ?? null,
      productId: input.productId,
      creatorId,
    });
    if (hasAssignee && input.assigneeId) {
      this.eventEmitter.emit(MISSION_ASSIGNED, {
        missionId: id,
        previousAssigneeId: 0,
        newAssigneeId: input.assigneeId,
        assignedById: creatorId,
      } as MissionAssignedEvent);
    }
    return created;
  }

  async update(id: string, input: UpdateMissionInput) {
    const existing = await this.missionRepo.findById(id);
    if (!existing) throw new NotFoundException('ماموریت یافت نشد');
    const data: { title?: string; description?: string; priority?: Priority; dueDate?: Date; assigneeId?: number; status?: MissionStatus } = {};
    if (input.title != null) data.title = input.title;
    if (input.description != null) data.description = input.description;
    if (input.priority != null) data.priority = input.priority;
    if (input.dueDate != null) data.dueDate = new Date(input.dueDate);
    if (input.assigneeId != null) {
      await this.ensureAssigneeNotObserver(input.assigneeId);
      data.assigneeId = input.assigneeId;
      this.eventEmitter.emit(MISSION_ASSIGNED, {
        missionId: id,
        previousAssigneeId: existing.assigneeId,
        newAssigneeId: input.assigneeId,
        assignedById: input.assigneeId,
      } as MissionAssignedEvent);
    }
    return this.missionRepo.update(id, data);
  }

  async delete(id: string) {
    const existing = await this.missionRepo.findById(id);
    if (!existing) throw new NotFoundException('ماموریت یافت نشد');
    return this.missionRepo.delete(id);
  }

  async updateStatus(id: string, newStatus: MissionStatus, userId: number) {
    const existing = await this.missionRepo.findById(id);
    if (!existing) throw new NotFoundException('ماموریت یافت نشد');
    this.stateMachine.validateTransition(existing.status, newStatus);
    const previousStatus = existing.status;
    const updated = await this.missionRepo.updateStatus(id, newStatus);

    this.eventEmitter.emit(MISSION_STATUS_UPDATED, {
      missionId: id,
      previousStatus,
      newStatus,
      userId,
    } as MissionStatusUpdatedEvent);

    return updated;
  }

  async takeMission(id: string, userId: number) {
    const user = await this.userService.findById(userId);
    if (user?.role === UserRole.OBSERVER) {
      throw new BadRequestException('کاربر مانیتور نمی‌تواند تسک بگیرد');
    }
    const existing = await this.missionRepo.findById(id);
    if (!existing) throw new NotFoundException('ماموریت یافت نشد');
    if (existing.status !== MissionStatus.PENDING) {
      throw new NotFoundException('این مأموریت قبلاً پذیرفته شده است');
    }
    const previousAssigneeId = existing.assigneeId ?? 0;
    const updated = await this.missionRepo.updateAssigneeAndStatus(id, userId, MissionStatus.IN_PROGRESS);

    this.eventEmitter.emit(MISSION_ASSIGNED, {
      missionId: id,
      previousAssigneeId,
      newAssigneeId: userId,
      assignedById: userId,
    } as MissionAssignedEvent);

    return updated;
  }
}