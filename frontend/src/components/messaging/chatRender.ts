import { Conversation, ConversationSummary, Message} from "./types.js";
import type { UserId } from "../../common/types.js";
import { getCurrentUserId, getCurrentUsername } from "../auth/authUtils.js";
import { t } from "../languages/i18n.js";

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
// export function renderMessages(conversation: Conversation, container: HTMLElement, currentUsername: string | null = null) {
// 	container.innerHTML = "";

// 	// todo can we rely on localStorage? maybe if localStorage returns null, we can fetch user data from server 
// 	if (!currentUsername) {
// 		currentUsername = getCurrentUsername() || "";
// 	}

// 	for (const msg of conversation.messages) {
// 		const authorName = msg.author?.username ?? "unknown";
// 		const isMine = authorName === currentUsername;

// 		// outer row controls left/right alignment
// 		const row = document.createElement("div");
// 		row.className = isMine ? "flex justify-end" : "flex justify-start";

// 		const bubble = document.createElement("div");
// 		bubble.className = isMine
// 		? "max-w-md text-right"
// 		: "max-w-md";

// 		bubble.innerHTML = `
// 		<div class="text-sm text-white/60 mb-1">
// 			${isMine ? "you" : authorName}
// 		</div>
// 		<div class="${
// 			isMine ? "bg-blue-600" : "bg-white/10"
// 		} p-3 rounded-lg">
// 			${msg.text}
// 		</div>
// 		`;

// 		row.appendChild(bubble);
// 		container.appendChild(row);
// 	}

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
			const buttonsHtml = !isMine
				? `
					<div class="flex gap-2 mt-3">
						<button
							class="bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-sm"
							data-action="accept-game"
							data-message-id="${msg.id}"
						>
							Accept
						</button>
						<button
							class="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-sm"
							data-action="decline-game"
							data-message-id="${msg.id}"
						>
							Decline
						</button>
					</div>
				`
				: "";

			contentHtml = `
				<div class="${
					isMine ? "bg-blue-600" : "bg-white/10"
				} p-3 rounded-lg">
					<div class="font-semibold">Let’s play</div>
					${buttonsHtml}
				</div>
			`;
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