import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { ChatMessageEntity } from './entities/chat-message.entity';
import { ChatService } from './chat.service';
import { SendMessageInput } from './dto/send-message.input';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Resolver(() => ChatMessageEntity)
export class ChatResolver {
  constructor(private chatService: ChatService) {}

  @Query(() => [ChatMessageEntity])
  @UseGuards(JwtAuthGuard)
  async chatMessages(
    @Args('missionId') missionId: string,
    @Args('stepId', { nullable: true }) stepId?: string,
  ) {
    return this.chatService.getMessages(missionId, stepId);
  }

  @Mutation(() => ChatMessageEntity)
  @UseGuards(JwtAuthGuard)
  async sendMessage(
    @CurrentUser('id') senderId: number,
    @Args('input') input: SendMessageInput,
  ) {
    return this.chatService.sendMessage(senderId, {
      missionId: input.missionId,
      text: input.text,
      stepId: input.stepId,
      fileName: input.fileName,
      fileUrl: input.fileUrl,
    });
  }
}
