import { UserDataPublic } from "../../common/types";

export type ConversationId = string;
type MessageType = "text" | "game";

export interface Message {
  id: string;
  conversationId: ConversationId;
  author: UserDataPublic;
  type: MessageType;
  text: string;
  createdAt: string; // ISO timestamp
}

export interface ConversationSummary {
  id: ConversationId;
  title: string;
  lastMessage: Message;
  hasUnread: boolean;
  participants: UserDataPublic[];
}

export interface Conversation {
  summary: ConversationSummary;
  messages: Message[];
}