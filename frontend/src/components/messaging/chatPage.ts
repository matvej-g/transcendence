import {
  fetchConversations,
  fetchConversation,
  createConversation,
  sendMessage,
  fetchUserByUsername,
} from "./api.js";

import { renderChatList, renderMessages, prependSearchRow } from "./chatRender.js";
import { Conversation, ConversationSummary } from "./types.js";
import { UserDataPublic } from "../../common/types.js";
import { getCurrentUserId, getCurrentUsername } from "../auth/authUtils.js";
import { appWs } from "../../ws/appWs.js";

const chatListEl = document.getElementById("chat-list")!;
const chatHeaderEl = document.getElementById("chat-header")!;
const messagesEl = document.getElementById("chat-messages")!;
const formEl = document.getElementById("chat-form")!;
const inputEl = document.getElementById("chat-input") as HTMLInputElement | null;
const searchEl = document.getElementById("chat-search") as HTMLInputElement;
const inviteToPlayBtn = document.getElementById("invite-to-play-btn-chat") as HTMLButtonElement | null;

let activeConversation: Conversation | null = null;
let conversations: ConversationSummary[] = [];
let pendingUser: UserDataPublic | null = null;

console.log("chatPage loading");

// events start
function handleChatMessageCreated(ev: any) {
	if (ev.type !== "message.created") {
		console.log("handleChatMessageCreated: ignoring event type", ev.type);
		return;
	}

	console.log("handleChatMessageCreated: event", ev);

	const cid = String(ev.data?.conversationId ?? "");
	const msg = ev.data?.message;

	if (!cid || !msg) {
		console.warn("handleChatMessageCreated: missing cid or message in event", ev);
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
			unreadCount: 1,
			participants: [ev.data?.message?.author],
		};

		conversations.unshift(minimalSummary);
		renderChatList(conversations, chatListEl);
		return;
	}

	// Existing conversation: update preview, bump to top
	const summary = conversations[idx];
	summary.lastMessage = msg as any;

	if (idx > 0) {
		conversations.splice(idx, 1);
		conversations.unshift(summary);
	}

	renderChatList(conversations, chatListEl);
}

appWs.on(handleChatMessageCreated);
// events end

// todo move this to (include in) central router section
function onHashChange() { 
	appWs.connect(); // fail-safe connect/re-connect
	console.log("hash changed to", window.location.hash);
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
	console.log("FETCHED CONVO", convo);
	activeConversation = convo;
	pendingUser = null;

	chatHeaderEl.textContent = convo.summary.title; // todo maybe handle null title
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

	// todo Send game invite via WebSocket or API 
	alert("Game invite sent!"); // todo translate
});

formEl.addEventListener("submit", async (e) => {
	e.preventDefault();
	if (!inputEl) return;
	const text = inputEl.value.trim();
	if (!text) return;

	// 1) Existing conversation -> send message
	if (activeConversation) {
		const msg = await sendMessage({
		conversationId: activeConversation.summary.id,
		text,
		} as any);

		activeConversation.messages.push(msg);
		renderMessages(activeConversation, messagesEl, getCurrentUsername());
		inputEl.value = "";
		return;
	}

	// 2) No active convo, but we selected a user -> create convo with first message
	if (pendingUser) {
		const createdMsg = await createConversation(
		[pendingUser.id],
		{ text } as any,
		);

		// Open the newly created conversation
		const convo = await fetchConversation(createdMsg.conversationId);
		activeConversation = convo;
		pendingUser = null;

		chatHeaderEl.textContent = convo.summary.title;
		renderMessages(convo, messagesEl, getCurrentUsername());
		inputEl.value = "";
		return;
	}
});

// seaerch user
document.addEventListener("DOMContentLoaded", () => {
	const searchEl = document.getElementById("chat-search") as HTMLInputElement | null;
	if (!searchEl) {
		console.error("chat-search not found in DOM"); // todo silence /remove
		return;
	}

	searchEl.addEventListener("keydown", async (e) => {
		console.log("keydown", e.key);
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
