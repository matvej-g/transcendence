import { UserDataPublic } from "../../common/types";

export type ConversationId = string;

export interface Message {
  id: string;
  conversationId: ConversationId;
  author: UserDataPublic;
  text: string;
  createdAt: string; // ISO timestamp
}

export interface ConversationSummary {
  id: ConversationId;
  title: string;
  lastMessage: Message;
  unreadCount: number;
  participants: UserDataPublic[];
}

export interface Conversation {
  summary: ConversationSummary;
  messages: Message[];
}