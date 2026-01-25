// Utility to sanitize strings (defense-in-depth)
function sanitizeString(str: string): string {
  const temp = document.createElement('div');
  temp.textContent = str;
  return temp.innerHTML;
}

import {
  fetchConversations,
  fetchConversation,
  createConversation,
  sendMessage,
  fetchUserByUsername,
} from "./api.js";

import { renderChatList, renderMessages, prependSearchRow, attachGameMessageHandlers } from "./chatRender.js";
import { Conversation, ConversationSummary } from "./types.js";
import { UserDataPublic } from "../../common/types.js";
import { getCurrentUserId, getCurrentUsername } from "../auth/authUtils.js";
import { appWs } from "../../ws/appWs.js";
import { gameManager } from "../../game_components/gameManager.js";
import { logger } from "../../utils/logger.js";
import { loadFriendProfile } from "../friendProfile/friendProfile.js";

const chatListEl = document.getElementById("chat-list")!;
const chatHeaderEl = document.getElementById("chat-header")!;
const messagesEl = document.getElementById("chat-messages")!;
const formEl = document.getElementById("chat-form")!;
const inputEl = document.getElementById("chat-input") as HTMLInputElement | null;
const searchEl = document.getElementById("chat-search") as HTMLInputElement;
const inviteToPlayBtn = document.getElementById("invite-to-play-btn-chat") as HTMLButtonElement | null;
const viewProfileBtn = document.getElementById("view-profile-btn") as HTMLButtonElement | null;

let activeConversation: Conversation | null = null;
let conversations: ConversationSummary[] = [];
let pendingUser: UserDataPublic | null = null;

logger.log("chatPage loading");

// events start
function handleChatMessageCreated(ev: any) {
	if (ev.type !== "message.created") {
		logger.log("handleChatMessageCreated: ignoring event type", ev.type);
		return;
	}

	logger.log("handleChatMessageCreated: event", ev);

	const cid = String(ev.data?.conversationId ?? "");
	const msg = ev.data?.message;

	if (!cid || !msg) {
		logger.warn("handleChatMessageCreated: missing cid or message in event", ev);
		return;
	}

	// 1) If message belongs to currently open conversation -> append + rerender
	const activeId = activeConversation?.summary?.id ? String(activeConversation.summary.id) : null;

	if (activeConversation && activeId === cid) {
		const mid = String((msg as any).id ?? "");
		if (!mid) return;

		// de-dupe
		if (activeConversation.messages.some((m: any) => String(m.id) === mid)) return;

		activeConversation.messages.push(msg);
		renderMessages(activeConversation, messagesEl, getCurrentUsername());
		
	// 	// Update chat list preview without incrementing unread count // milena
		let idx = conversations.findIndex((c) => String(c.id) === cid);
		if (idx !== -1) {
			const summary = conversations[idx];
			summary.lastMessage = msg as any;
			if (idx > 0) {
				conversations.splice(idx, 1);
				conversations.unshift(summary);
			}
			renderChatList(conversations, chatListEl);
		}
	}

	// 2) Update chat list preview + move convo to top (or create it if missing)
	let idx = conversations.findIndex((c) => String(c.id) === cid);

	if (idx === -1) {
		// convo not in list yet (e.g. list not loaded, or "new convo" case)
		// Create a minimal summary from the WS payload.
		const minimalSummary: any = {
			id: cid,
			title: "", // title get's filled in when render happens
			lastMessage: msg,
			// unreadCount: 1,
			hasUnread: true,
			participants: [ev.data?.message?.author],
		};

		conversations.unshift(minimalSummary);
		renderChatList(conversations, chatListEl);
		return;
	}

	// Existing conversation: update preview, bump to top, and mark as unread
	const summary = conversations[idx];
	summary.lastMessage = msg as any;
	
	// Mark as unread if message is from someone else //milena
	const currentUserId = getCurrentUserId();
	const messageAuthorId = String(msg.author?.id ?? '');
	if (messageAuthorId && String(currentUserId) !== messageAuthorId) {
		summary.hasUnread = true;
	}

	if (idx > 0) {
		conversations.splice(idx, 1);
		conversations.unshift(summary);
	}

	renderChatList(conversations, chatListEl);

	if (ev.data?.message?.type === "game") {
		console.log("Handling game message:", ev.data?.message?.text);
		if (ev.data?.message?.text.startsWith("accept")) {
			let inviteCode = ev.data?.message?.text.split(".")[1];
			logger.log("Starting game from accepted invite with code:", inviteCode);
			window.location.hash = `#game`;
			gameManager.startInviteGame(inviteCode);
		}
	}
}

appWs.on(handleChatMessageCreated);
// events end

// todo move this to (include in) central router section
function onHashChange() { 
	appWs.connect(); // fail-safe connect/re-connect
	logger.log("hash changed to", window.location.hash);
	if (window.location.hash === "#chat") {
		loadConversations();
	}
}

window.addEventListener("hashchange", onHashChange);

if (window.location.hash === "#chat") {
	appWs.connect();
 	loadConversations();
}

async function loadConversations() {
  const userId = getCurrentUserId();
  if (!userId) return;

  conversations.splice(0, conversations.length, ...(await fetchConversations()));
  renderChatList(conversations, chatListEl);
  for (const convo of conversations) {
	appWs.joinConversation(convo.id);
  }
}

chatListEl.addEventListener("click", async (e) => {
	const li = (e.target as HTMLElement).closest("li");
	if (!li) return;

	// 1) User search result clicked
	const userId = li.getAttribute("data-user-id");
	if (userId) {
		const username = li.getAttribute("data-username") ?? "";

		pendingUser = { id: userId, username } as any;
		activeConversation = null;

		chatHeaderEl.textContent = username || "New conversation";
		messagesEl.innerHTML = "";
		return;
	}

	// 2) Existing conversation clicked
	const convoId = li.dataset.id;
	if (!convoId) return;

	const convo = await fetchConversation(convoId);
	logger.log("FETCHED CONVO", convo);
	activeConversation = convo;
	pendingUser = null;

	// Reset unread indicator when opening conversation //milena
	const summary = conversations.find(c => String(c.id) === convoId);
	if (summary) {
		summary.hasUnread = false;
		renderChatList(conversations, chatListEl);
	}

	// Display the other user's username in the header
	const myId = getCurrentUserId();
	const otherUser = convo.summary.participants.find(p => String(p.id) !== String(myId));
	chatHeaderEl.textContent = otherUser?.username || convo.summary.title;
	renderMessages(convo, messagesEl, getCurrentUsername());
});

inviteToPlayBtn?.addEventListener("click", async () => {
	if (!activeConversation) {
		alert("Select a conversation to invite to play."); // todo translate
		return;
	}
	const userIds = (activeConversation.summary?.participants ?? []).map(p => p.id);
	if (userIds.length !== 2) {
		alert("Can only invite to play in one-on-one conversations."); // todo translate
		return; 
	}
	const otherUserId = userIds.find(id => String(id) !== String(getCurrentUserId()));
	if (!otherUserId) {
		alert("Could not determine the other user to invite."); // todo translate
		return;
	}

	sendGameInvite(activeConversation,otherUserId);
	alert("Game invite sent!"); // todo translate
});

viewProfileBtn?.addEventListener("click", () => {
	if (!activeConversation) {
		alert("Select a conversation to view profile."); // todo translate
		return;
	}
	const userIds = (activeConversation.summary?.participants ?? []).map(p => p.id);
	if (userIds.length !== 2) {
		alert("Can only view profile in one-on-one conversations."); // todo translate
		return; 
	}
	const otherUserId = userIds.find(id => String(id) !== String(getCurrentUserId()));
	if (!otherUserId) {
		alert("Could not determine the other user to view."); // todo translate
		return;
	}
	loadFriendProfile(Number(otherUserId));
	
});

function sendGameInvite(activeConversation: Conversation, userId: string) {
	// For now, just send a special "game" message in the current conversation
	if (!activeConversation) return;

	sendMessage({conversationId: activeConversation.summary.id, type: "game", text: "invite"} as any)
};

export function sendGameAction(convoId: string, action: "accept" | "decline" | "cancel") {
	const userId = getCurrentUserId();
	if (!userId) return;

	sendMessage({
		conversationId: convoId,
		type: "game",
		text: action,
		author: {
			id: userId,
			username: getCurrentUsername() ?? "you",
		},
	} as any);
}
	

formEl.addEventListener("submit", async (e) => {
	e.preventDefault();
	if (!inputEl) return;
	const textInput = inputEl.value.trim();
	if (!textInput) return;

	// 1) Existing conversation -> send message
	if (activeConversation) {
		const msg = await sendMessage({
		conversationId: activeConversation.summary.id,
		type: "text",
		text: textInput,
		} as any);
		renderMessages(activeConversation, messagesEl, getCurrentUsername());
		inputEl.value = "";
		return;
	}

	// 2) No active convo, but we selected a user -> create convo with first message
	if (pendingUser) {
		const createdMsg = await createConversation( [pendingUser.id], { type: "text", text: textInput } as any );
		// Open the newly created conversation
		const convo = await fetchConversation(createdMsg.conversationId);
		activeConversation = convo;
		
		// Display the other user's username in the header
		const myId = getCurrentUserId();
		const otherUser = convo.summary.participants.find(p => String(p.id) !== String(myId));
		chatHeaderEl.textContent = otherUser?.username || convo.summary.title;
		
		// Reload conversation list to include the new conversation
		await loadConversations();
		
		pendingUser = null;
		renderMessages(convo, messagesEl, getCurrentUsername());
		inputEl.value = "";
		return;
	}
});

// seaerch user
document.addEventListener("DOMContentLoaded", () => {
	const searchEl = document.getElementById("chat-search") as HTMLInputElement | null;
	if (!searchEl) {
		logger.error("chat-search not found in DOM"); // todo silence /remove
		return;
	}

	searchEl.addEventListener("keydown", async (e) => {
		logger.log("keydown", e.key);
		if (e.key !== "Enter") return;

		const q = searchEl.value.trim();

		// empty query -> restore conversations
		if (!q) {
			pendingUser = null;
			conversations.splice(0, conversations.length, ...(await fetchConversations()));
			renderChatList(conversations, chatListEl);
			return;
		}

		try {
		const user = await fetchUserByUsername(q);

		//todo this needs better flow, kinda pointless right now
		// 1) check for convo locally
		let existingConvoId = findExistingDmConversationId(String(user.id));
		// 2) refresh conversations from server and check again
		if (!existingConvoId) {
			conversations.splice(0, conversations.length, ...(await fetchConversations()));
			existingConvoId = findExistingDmConversationId(String(user.id));
		}

		// 3) render all convos, then highlight/prepend
		renderChatList(conversations, chatListEl);

		if (existingConvoId) {
			const existingLi = chatListEl.querySelector(
			`li[data-id="${existingConvoId}"]`,
			) as HTMLElement | null;

			if (existingLi) existingLi.classList.add("bg-white/10");

			prependSearchRow(user, "open", existingConvoId);
			pendingUser = null;
		} else {
			prependSearchRow(user, "start");
			pendingUser = { id: String(user.id), username: user.username } as any;
		}
		} catch {
		pendingUser = null;
		chatListEl.innerHTML = `<li class="p-4 text-white/60">No user found</li>`; // todo translate
		}
	});
});

function findExistingDmConversationId(userId: string): string | null {
	const myId = String(getCurrentUserId());
	const otherId = String(userId);

	for (const convo of conversations) {
		const ids = (convo.participants ?? []).map((p) => String(p.id));
		if (ids.length !== 2) continue;
		if (ids.includes(myId) && ids.includes(otherId)) return String(convo.id);
	}
	return null;
}
