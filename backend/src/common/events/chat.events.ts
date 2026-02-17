export const CHAT_MESSAGE_SENT = 'chat.message.sent';

export class ChatMessageSentEvent {
  messageId: string;
  missionId: string;
  senderId: number;
  text: string;
  recipientIds: number[];
}
