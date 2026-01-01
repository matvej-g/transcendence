import type { ConversationId, Conversation, ConversationSummary, Message } from "./types.js";

// fetches lightweight summaries
export async function fetchConversations(): Promise<ConversationSummary[]> {
  const res = await fetch("/api/conversations", {
    method: "GET",
    headers: { Accept: "application/json" },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch conversations: HTTP ${res.status}`);
  }

  return (await res.json()) as ConversationSummary[];
}

// fetches full conversation by ID
export async function fetchConversation(id: ConversationId): Promise<Conversation> {
  const res = await fetch(`/api/conversations/${encodeURIComponent(String(id))}`, {
    method: "GET",
    headers: { Accept: "application/json" },
  });

  if (!res.ok) {
    throw new Error(`Conversation not found: HTTP ${res.status}`);
  }

  return (await res.json()) as Conversation;
}

// sends a new message in an existing conversation
export async function sendMessage(message: Message): Promise<Message> {
  // Assumes Message contains conversationId (or you can change function signature to accept it explicitly)
  const conversationId =
    (message as any).conversationId ?? (message as any).conversation_id;

  if (!conversationId) {
    throw new Error("sendMessage: message is missing conversationId");
  }

  const res = await fetch(
    `/api/conversations/${encodeURIComponent(String(conversationId))}/messages`,
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(message),
    },
  );

  if (!res.ok) {
    throw new Error(`Failed to send message: HTTP ${res.status}`);
  }

  return (await res.json()) as Message;
}

// creates a new conversation with initial message
export async function createConversation(
  participantIds: string[],
  message: Message,
): Promise<Message> {
  const res = await fetch("/api/conversations", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ participantIds, message }),
  });

  if (!res.ok) {
    throw new Error(`Failed to create conversation: HTTP ${res.status}`);
  }

  return (await res.json()) as Message;
}

// edit message
export async function editMessage(message: Message): Promise<Message> {
  const id =
    (message as any).id ?? (message as any).messageId ?? (message as any).message_id;

  if (!id) {
    throw new Error("editMessage: message is missing id");
  }

  const res = await fetch(`/api/messages/${encodeURIComponent(String(id))}`, {
    method: "PATCH",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(message),
  });

  if (!res.ok) {
    throw new Error(`Failed to edit message: HTTP ${res.status}`);
  }

  return (await res.json()) as Message;
}



// // fetches lightweight summaries
// export async function fetchConversations(): Promise<ConversationSummary[]> {
//   const res = await {}; // fetch('/api/conversations') ...
//   if (!res) {
// 	throw new Error("Failed to fetch conversations");
//   }
//   return res as Promise<ConversationSummary[]>; //res.json();
// }

// //maybe add scoped fetch later (like fetch the last 20 messages, and fetch more on scroll)
// //fetches full conversation by ID
// export async function fetchConversation(id: ConversationId): Promise<Conversation> {
//   const res = await {}; // fetch(`/api/conversations/${id}`) ...
//   if (!res) {
//     throw new Error("Conversation not found");
//   }
//   return res as Promise<Conversation>; //res.json();
// }

// // sends a new message in an existing conversation
// export async function sendMessage(message: Message): Promise<Message> {
// 	const res = await {}; // POST to `/api/conversations/${message.conversationId}/messages` ...
// 	if (!res) {
// 		throw new Error("Failed to send message");
// 	}
// 	return res as Promise<Message>; //res.json();
// }

// // creates a new conversation with initial message
// // not sure if we should create with oi without initial message
// // i though creating without message may cause backend race if users create and send simultaneously
// // also like this we dont have to deal with empty conversations
// export async function createConversation(participantIds: string[], message: Message): Promise<Message> { 
// 	const res = await {}; // POST to `/api/conversations` ...
// 	if (!res) {
// 		throw new Error("Failed to create conversation");
// 	}
// 	return res as Promise<Message>; //res.json();
// }

// // edit message
// // absolute least importance feature
// export async function editMessage(message: Message): Promise<Message> {
// 	const res = await {}; // POST?PUT
// 	if (!res) {
// 		throw new Error("Failed to edit message");
// 	}
// 	return res as Promise<Message>;
// }