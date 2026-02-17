import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { AttachmentEntity } from './entities/attachment.entity';
import { AttachmentService } from './attachment.service';
import { CreateAttachmentInput } from './dto/create-attachment.input';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Resolver(() => AttachmentEntity)
export class AttachmentResolver {
  constructor(private attachmentService: AttachmentService) {}

  @Mutation(() => AttachmentEntity)
  @UseGuards(JwtAuthGuard)
  async createAttachment(@Args('input') input: CreateAttachmentInput) {
    return this.attachmentService.create(input);
  }

  @Query(() => [AttachmentEntity])
  @UseGuards(JwtAuthGuard)
  async attachmentsByProduct(@Args('productId') productId: string) {
    return this.attachmentService.findByProduct(productId);
  }

  @Query(() => [AttachmentEntity])
  @UseGuards(JwtAuthGuard)
  async attachmentsByMission(@Args('missionId') missionId: string) {
    return this.attachmentService.findByMission(missionId);
  }

  @Mutation(() => Boolean)
  @UseGuards(JwtAuthGuard)
  async deleteAttachment(@Args('id') id: string) {
    await this.attachmentService.delete(id);
    return true;
  }
}
