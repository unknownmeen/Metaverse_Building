import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ChatRepository {
  constructor(private prisma: PrismaService) {}

  async findByMissionId(missionId: string, stepId?: string) {
    return this.prisma.chatMessage.findMany({
      where: {
        missionId,
        ...(stepId ? { stepId } : {}),
      },
      include: { sender: { select: { id: true, name: true, phone: true, avatarId: true, role: true } } },
      orderBy: { createdAt: 'asc' },
    });
  }

  async create(data: {
    id: string;
    text: string;
    senderId: number;
    missionId: string;
    stepId?: string;
    fileName?: string;
    fileUrl?: string;
  }) {
    return this.prisma.chatMessage.create({
      data,
      include: { sender: { select: { id: true, name: true, phone: true, avatarId: true, role: true } } },
    });
  }
}
