import { Conversation, ConversationSummary } from "./types.js";
import type { UserId } from "../../common/types.js";

// left side: chat list
export function renderChatList(
  list: ConversationSummary[],
  container: HTMLElement,
) {
  container.innerHTML = "";

  for (const convo of list) {
    const li = document.createElement("li");
    li.className = "p-4 hover:bg-white/5 cursor-pointer";
    li.dataset.id = String(convo.id);

    li.innerHTML = `
      <div class="flex justify-between items-center">
        <div class="font-semibold">${convo.title}</div>
        ${
          convo.unreadCount > 0
            ? `<span class="text-xs bg-blue-600 rounded-full px-2">${convo.unreadCount}</span>`
            : ""
        }
      </div>
      <div class="text-sm text-white/60 truncate">
        ${convo.lastMessage?.text ?? ""}
      </div>
    `;

    container.appendChild(li);
  }
}

// right side: active chat
export function renderMessages(conversation: Conversation, container: HTMLElement, currentUsername: string | null = null) {
  container.innerHTML = "";
  if (!currentUsername) {
	if (conversation.messages.length > 0) {
		currentUsername = conversation.messages[0].author.username;
	}
  }

  for (const msg of conversation.messages) {
    const isMine = msg.author.username === currentUsername;

    const wrapper = document.createElement("div");
    wrapper.className = isMine
      ? "max-w-md ml-auto text-right"
      : "max-w-md";

    wrapper.innerHTML = `
      <div class="text-sm text-white/60">
        ${isMine ? "you" : msg.author}
      </div>
      <div class="${
        isMine ? "bg-blue-600" : "bg-white/10"
      } p-3 rounded-lg">
        ${msg.text}
      </div>
    `;

    container.appendChild(wrapper);
  }

  container.scrollTop = container.scrollHeight;
}