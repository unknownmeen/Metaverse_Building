import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAttachmentInput } from './dto/create-attachment.input';
import { v4 as uuid } from 'uuid';

@Injectable()
export class AttachmentService {
  constructor(private prisma: PrismaService) {}

  async create(input: CreateAttachmentInput) {
    return this.prisma.attachment.create({
      data: {
        id: uuid(),
        name: input.name,
        url: input.url,
        type: input.type,
        productId: input.productId || null,
        missionId: input.missionId || null,
      },
    });
  }

  async findByProduct(productId: string) {
    return this.prisma.attachment.findMany({
      where: { productId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByMission(missionId: string) {
    return this.prisma.attachment.findMany({
      where: { missionId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async delete(id: string) {
    return this.prisma.attachment.delete({ where: { id } });
  }
}
