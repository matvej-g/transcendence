import type { ConversationId, Conversation, ConversationSummary, Message } from "./types.js";

export async function fetchConversations(): Promise<ConversationSummary[]> {
  // fetch("/api/conversations") ...
}

export async function fetchConversation(id: ConversationId): Promise<Conversation> {
  const res = await {}; // fetch(`/api/conversations/${id}`) ...
  if (!res) {
    throw new Error("Conversation not found");
  }
  return res as Promise<Conversation>; //res.json();
}

export async function sendMessage(message: Message): Promise<Message> {
	const res = await {}; // POST to `/api/conversations/${message.conversationId}/messages` ...
	if (!res) {
		throw new Error("Failed to send message");
	}
	return res as Promise<Message>; //res.json();
}

export async function createConversation(participantIds: string[], message: Message): Promise<Message> { 
	const res = await {}; // POST to `/api/conversations` ...
	if (!res) {
		throw new Error("Failed to create conversation");
	}
	return res as Promise<Message>; //res.json();
}

export async function editMessage(message: Message): Promise<Message> {
	const res = await {}; // POST?PUT
	if (!res) {
		throw new Error("Failed to edit message");
	}
	return res as Promise<Message>;
}