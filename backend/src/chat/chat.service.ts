import { Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { v4 as uuidv4 } from 'uuid';
import { ChatRepository } from './chat.repository';
import { CHAT_MESSAGE_SENT, ChatMessageSentEvent } from '../common/events/chat.events';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ChatService {
  constructor(
    private chatRepo: ChatRepository,
    private eventEmitter: EventEmitter2,
    private prisma: PrismaService,
  ) {}

  async getMessages(missionId: string, stepId?: string) {
    if (stepId) {
      const step = await this.prisma.judgingStep.findFirst({
        where: { id: stepId, missionId },
        select: { id: true },
      });
      if (!step) throw new NotFoundException('گام داوری یافت نشد');
    }
    return this.chatRepo.findByMissionId(missionId, stepId);
  }

  async sendMessage(
    senderId: number,
    input: { missionId: string; text: string; stepId?: string; fileName?: string; fileUrl?: string },
  ) {
    const mission = await this.prisma.mission.findUnique({
      where: { id: input.missionId },
      select: { id: true, assigneeId: true, judgingSteps: { select: { judgeId: true } } },
    });
    if (!mission) throw new NotFoundException('ماموریت یافت نشد');

    let stepJudgeId: number | null = null;
    if (input.stepId) {
      const step = await this.prisma.judgingStep.findFirst({
        where: { id: input.stepId, missionId: input.missionId },
        select: { id: true, judgeId: true },
      });
      if (!step) throw new NotFoundException('گام داوری یافت نشد');
      stepJudgeId = step.judgeId;
    }

    const id = `c-${uuidv4().slice(0, 8)}`;
    const message = await this.chatRepo.create({
      id,
      text: input.text,
      senderId,
      missionId: input.missionId,
      stepId: input.stepId,
      fileName: input.fileName,
      fileUrl: input.fileUrl,
    });

    const recipientIds = Array.from(
      new Set([
        mission.assigneeId,
        ...(stepJudgeId ? [stepJudgeId] : mission.judgingSteps.map((s) => s.judgeId)),
      ]),
    ).filter((id) => id !== senderId);

    this.eventEmitter.emit(CHAT_MESSAGE_SENT, {
      messageId: id,
      missionId: input.missionId,
      senderId,
      text: input.text,
      recipientIds,
    } as ChatMessageSentEvent);

    return message;
  }
}
