import { Module } from '@nestjs/common';
import { ChatResolver } from './chat.resolver';
import { ChatService } from './chat.service';
import { ChatRepository } from './chat.repository';

@Module({
  providers: [ChatResolver, ChatService, ChatRepository],
  exports: [ChatService],
})
export class ChatModule {}
