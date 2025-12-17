import type { ConversationId, Conversation, ConversationSummary, Message } from "./types.js";

// fetches lightweight summaries
export async function fetchConversations(): Promise<ConversationSummary[]> {
  const res = await {}; // fetch('/api/conversations') ...
  if (!res) {
	throw new Error("Failed to fetch conversations");
  }
  return res as Promise<ConversationSummary[]>; //res.json();
}

//maybe add scoped fetch later (like fetch the last 20 messages, and fetch more on scroll)
//fetches full conversation by ID
export async function fetchConversation(id: ConversationId): Promise<Conversation> {
  const res = await {}; // fetch(`/api/conversations/${id}`) ...
  if (!res) {
    throw new Error("Conversation not found");
  }
  return res as Promise<Conversation>; //res.json();
}

// sends a new message in an existing conversation
export async function sendMessage(message: Message): Promise<Message> {
	const res = await {}; // POST to `/api/conversations/${message.conversationId}/messages` ...
	if (!res) {
		throw new Error("Failed to send message");
	}
	return res as Promise<Message>; //res.json();
}

// creates a new conversation with initial message
// not sure if we should create with oi without initial message
// i though creating without message may cause backend race if users create and send simultaneously
// also like this we dont have to deal with empty conversations
export async function createConversation(participantIds: string[], message: Message): Promise<Message> { 
	const res = await {}; // POST to `/api/conversations` ...
	if (!res) {
		throw new Error("Failed to create conversation");
	}
	return res as Promise<Message>; //res.json();
}

// edit message
// absolute least importance feature
export async function editMessage(message: Message): Promise<Message> {
	const res = await {}; // POST?PUT
	if (!res) {
		throw new Error("Failed to edit message");
	}
	return res as Promise<Message>;
}