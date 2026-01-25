import type { ConversationId, Conversation, ConversationSummary, Message } from "./types.js";
import type { UserDataPublic } from "../../common/types.js";
import { getCurrentUserId } from "../auth/authUtils.js";
import { logger } from '../../utils/logger.js';

// fetches lightweight summaries
export async function fetchConversations(): Promise<ConversationSummary[]> {
	const myId = getCurrentUserId();
	if (!myId) {
		throw new Error("fetchConversations: no current user id in localStorage");
	}
	const res = await fetch("/api/conversations", {
		method: "GET",
		headers: { Accept: "application/json", "X-User-Id": myId },
	});

	if (!res.ok) {
		throw new Error(`Failed to fetch conversations: HTTP ${res.status}`);
	}

	return (await res.json()) as ConversationSummary[];
}

// fetches full conversation by ID
export async function fetchConversation(id: ConversationId): Promise<Conversation> {
	const myId = getCurrentUserId();
	if (!myId) {
		throw new Error("createConversation: no current user id in localStorage");
	}
	const res = await fetch(`/api/conversations/${encodeURIComponent(String(id))}`, {
		method: "GET",
		headers: { Accept: "application/json", "X-User-Id": myId },
	});

	if (!res.ok) {
		throw new Error(`Conversation not found: HTTP ${res.status}`);
	}

	return (await res.json()) as Conversation;
}

// sends a new message in an existing conversation
export async function sendMessage(message: Message): Promise<Message> {

	const myId = getCurrentUserId();
	if (!myId) {
		throw new Error("sendMessage: no current user id in localStorage");
	}
	const conversationId = (message as any).conversationId ?? (message as any).conversation_id;

	if (!conversationId) {
		throw new Error("sendMessage: message is missing conversationId");
	}
	// console.log("sendMessage called with message:", message);
	const res = await fetch(
		`/api/conversations/${encodeURIComponent(String(conversationId))}/messages`,
		{
		method: "POST",
		headers: {
			Accept: "application/json",
			"Content-Type": "application/json",
			"X-User-Id": myId,
		},
		body: JSON.stringify(message),
		},
	);

	const ct = res.headers.get("content-type") ?? "";
	const raw = await res.text(); // <-- read as text first ALWAYS

	if (!res.ok) {
		logger.error("sendMessage failed:", res.status, ct, raw.slice(0, 400));
		throw new Error(`Failed to send message: HTTP ${res.status}`);
	}

	try {
		return JSON.parse(raw) as Message;
	} catch (e) {
		logger.error("sendMessage: expected JSON but got:", ct, raw.slice(0, 400));
		throw e;
	}
}

// creates a new conversation with initial message
export async function createConversation(participantIds: string[], message: Message,): Promise<Message> {
	const myId = getCurrentUserId();
	if (!myId) {
		throw new Error("createConversation: no current user id in localStorage");
	} else if (!participantIds.includes(myId)) {
		participantIds.push(myId);
	}
  const res = await fetch("/api/conversations", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "X-User-Id": myId,
    },
    body: JSON.stringify({ participantIds, message }),
  });

  if (!res.ok) {
	const body = await res.text().catch(() => "");
    throw new Error(`Failed to create conversation: HTTP ${res.status} ${body}`);
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

/**
 * Fetch a single user by exact username.
 * Uses backend route: GET /api/user/{username}
 */
export async function fetchUserByUsername(
  username: string,
): Promise<UserDataPublic> {
  const name = username.trim();
  if (!name) {
    throw new Error("Username is empty");
  }

  const res = await fetch(`/api/user/${encodeURIComponent(name)}`, {
    method: "GET",
    headers: { Accept: "application/json" },
  });

  if (!res.ok) {
    throw new Error(`User not found: HTTP ${res.status}`);
  }

  return (await res.json()) as UserDataPublic;
}
