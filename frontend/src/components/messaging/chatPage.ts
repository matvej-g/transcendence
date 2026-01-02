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

const chatListEl = document.getElementById("chat-list")!;
const chatHeaderEl = document.getElementById("chat-header")!;
const messagesEl = document.getElementById("chat-messages")!;
const formEl = document.getElementById("chat-form")!;
const inputEl = document.getElementById("chat-input") as HTMLInputElement | null;
const searchEl = document.getElementById("chat-search") as HTMLInputElement;

let activeConversation: Conversation | null = null;
let conversations: ConversationSummary[] = [];
let pendingUser: UserDataPublic | null = null;

console.log("chatPage loading");

function onHashChange() {
	console.log("hash changed to", window.location.hash);
	if (window.location.hash === "#chat") {
		loadConversations();
	}
}

window.addEventListener("hashchange", onHashChange);

if (window.location.hash === "#chat") {
 	loadConversations();
}

async function loadConversations() {
  const userId = getCurrentUserId();
  if (!userId) return;

  conversations.splice(0, conversations.length, ...(await fetchConversations()));
  renderChatList(conversations, chatListEl);
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
		console.error("chat-search not found in DOM");
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
		chatListEl.innerHTML = `<li class="p-4 text-white/60">No user found</li>`;
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
