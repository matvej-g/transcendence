import { Conversation, ConversationSummary, Message} from "./types.js";
import type { UserId } from "../../common/types.js";
import { getCurrentUserId, getCurrentUsername } from "../auth/authUtils.js";
import { t } from "../languages/i18n.js";
import { sendGameAction } from "./chatPage.js";
type GameText = "invite" | "accept" | "cancel" | "decline";

const chatListEl = document.getElementById("chat-list")!;

// left side: chat list
function getLastMessagePreview(lastMessage?: Message): string {
  if (!lastMessage) return "";
  if (lastMessage.type === "game") return "Let's play"; //todo translate
  return lastMessage.text ?? "";
}

export function renderChatList(list: ConversationSummary[], container: HTMLElement,) {
  container.innerHTML = "";

	if (!list.length) {
		container.innerHTML = `<li class="p-4 text-white/60" data-i18n="chat.no_conversations_yet">${t('chat.no_conversations_yet')}</li>`; // todo i18n
		return;
	}

	const myId = getCurrentUserId(); // todo can we rely on localStorage?

	for (const convo of list) {
		const li = document.createElement("li");
		li.className = "p-4 hover:bg-white/5 cursor-pointer";
		li.dataset.id = String(convo.id);

		// all participants except me
		const others = (convo.participants ?? []).filter((p) => String(p.id) !== myId)
		.map((p) => p.username);

		const displayTitle = (convo.title) || others.join(", ") || t('chat.conversation'); // todo i18n

		const lastText = convo.lastMessage?.text ?? "";
		// const lastText = getLastMessagePreview(convo.lastMessage);

		li.innerHTML = `
		<div class="flex justify-between items-center">
			<div class="font-semibold truncate">${displayTitle}</div>
			${
			convo.unreadCount > 0
				? `<span class="text-xs bg-blue-600 rounded-full px-2">${convo.unreadCount}</span>`
				: ""
			}
		</div>
		<div class="text-sm text-white/60 truncate">
			${lastText}
		</div>
		`;

		container.appendChild(li);
	}
}

export function prependSearchRow(user: any, mode: "open" | "start", convoId?: string) {
	const li = document.createElement("li");
	li.className =
		"p-4 cursor-pointer border-b border-white/10 " +
		(mode === "open" ? "bg-white/10" : "bg-blue-600/20");

	if (mode === "open" && convoId) {
		li.dataset.id = String(convoId);
		li.innerHTML = `
		<div class="font-semibold">${user.username}</div>
		<div class="text-sm text-white/60" data-i18n="chat.open_conversation">${t('chat.open_conversation')}</div>
		`;
	} else {
		li.setAttribute("data-user-id", String(user.id));
		li.setAttribute("data-username", String(user.username));
		li.innerHTML = `
		<div class="font-semibold">${user.username}</div>
		<div class="text-sm text-white/60" data-i18n="chat.start_conversation">${t('chat.start_conversation')}</div>
		`;
	}

	chatListEl.prepend(li);
}

// right side: active chat
export function renderMessages(
	conversation: Conversation,
	container: HTMLElement,
	currentUsername: string | null = null
) {
	container.innerHTML = "";

	if (!currentUsername) {
		currentUsername = getCurrentUsername() || "";
	}

	for (const msg of conversation.messages) {
		const authorName = msg.author?.username ?? "unknown";
		const isMine = authorName === currentUsername;

		// outer row controls left/right alignment
		const row = document.createElement("div");
		row.className = isMine ? "flex justify-end" : "flex justify-start";

		const bubble = document.createElement("div");
		bubble.className = isMine
			? "max-w-md text-right"
			: "max-w-md";

		let contentHtml = "";

		// ---- TEXT MESSAGE (existing behavior) ----
		if (msg.type === "text") {
			contentHtml = `
				<div class="${
					isMine ? "bg-blue-600" : "bg-white/10"
				} p-3 rounded-lg">
					${msg.text ?? ""}
				</div>
			`;
		}

		// ---- GAME MESSAGE ----
		else if (msg.type === "game") {
			contentHtml = renderGameMessage(msg, isMine);
		}

		bubble.innerHTML = `
			<div class="text-sm text-white/60 mb-1">
				${isMine ? "you" : authorName}
			</div>
			${contentHtml}
		`;

		row.appendChild(bubble);
		container.appendChild(row);
	}


	container.scrollTop = container.scrollHeight;
}

function escapeHtml(str: string): string {
	return str
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#039;");
}

function renderInviteGameMessage(msg: Message, isMine: boolean): string {
	const convId = escapeHtml(String(msg.conversationId));
	const msgId = escapeHtml(String(msg.id));

	const buttonsHtml = isMine
		? `
			<div class="flex gap-2 mt-3 justify-end">
				<button
					class="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-sm"
					data-action="cancel-game"
					data-message-id="${msgId}"
					data-conversation-id="${convId}"
				>
					Cancel
				</button>
			</div>
		`
		: `
			<div class="flex gap-2 mt-3">
				<button
					class="bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-sm"
					data-action="accept-game"
					data-message-id="${msgId}"
					data-conversation-id="${convId}"
				>
					Accept
				</button>
				<button
					class="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-sm"
					data-action="decline-game"
					data-message-id="${msgId}"
					data-conversation-id="${convId}"
				>
					Decline
				</button>
			</div>
		`;

	return `
		<div class="${isMine ? "bg-blue-600" : "bg-white/10"} p-3 rounded-lg">
			<div class="font-semibold">Let’s play</div>
			<div class="text-sm text-white/70 mt-1">Game invite</div>
			${buttonsHtml}
		</div>
	`;
}

function renderAcceptGameMessage(_msg: any, isMine: boolean): string {
	return `
		<div class="${isMine ? "bg-blue-600" : "bg-white/10"} p-3 rounded-lg">
			<div class="font-semibold">Game accepted ✅</div>
			<div class="text-sm text-white/70 mt-1">Starting match…</div>
		</div>
	`;
}

function renderCancelGameMessage(_msg: any, isMine: boolean): string {
	return `
		<div class="${isMine ? "bg-blue-600" : "bg-white/10"} p-3 rounded-lg">
			<div class="font-semibold">Invite canceled</div>
		</div>
	`;
}

function renderDeclineGameMessage(_msg: any, isMine: boolean): string {
	return `
		<div class="${isMine ? "bg-blue-600" : "bg-white/10"} p-3 rounded-lg">
			<div class="font-semibold">Invite declined</div>
		</div>
	`;
}

export function renderGameMessage(msg: any, isMine: boolean): string {
	const t = (msg.text ?? "").toLowerCase() as GameText;

	switch (t) {
		case "invite":
			return renderInviteGameMessage(msg, isMine);
		case "accept":
			return renderAcceptGameMessage(msg, isMine);
		case "cancel":
			return renderCancelGameMessage(msg, isMine);
		case "decline":
			return renderDeclineGameMessage(msg, isMine);
		default:
			return `
				<div class="${isMine ? "bg-blue-600" : "bg-white/10"} p-3 rounded-lg">
					<div class="font-semibold">Game</div>
					<div class="text-sm text-white/70 mt-1">
						Unknown game message: ${escapeHtml(String(msg.text ?? ""))}
					</div>
				</div>
			`;
	}
}

export function attachGameMessageHandlers(container: HTMLElement) {
	container.addEventListener("click", (e) => {
		const btn = (e.target as HTMLElement).closest<HTMLButtonElement>(
			"button[data-action][data-message-id][data-conversation-id]"
		);
		if (!btn) return;

		const actionRaw = btn.dataset.action;
		const messageId = btn.dataset.messageId;
		const conversationId = btn.dataset.conversationId;

		if (!actionRaw || !messageId || !conversationId) return;

		const action =
			actionRaw === "accept-game" ? "accept" :
			actionRaw === "decline-game" ? "decline" :
			actionRaw === "cancel-game" ? "cancel" :
			null;

		if (!action) return;

		// Send a "game action" message that references the invite message
		sendGameAction(conversationId, action);

		// optional UX anti-spam
		// btn.disabled = true;
	});
}