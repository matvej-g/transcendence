
import {
  fetchConversations,
  fetchConversation,
  sendMessage,
} from "./api.js";
import { renderChatList, renderMessages } from "./chatRender.js";
import { Conversation, ConversationSummary } from "./types.js";
import { getCurrentUsername } from "./helper.js";

const chatListEl = document.getElementById("chat-list")!;
const chatHeaderEl = document.getElementById("chat-header")!;
const messagesEl = document.getElementById("chat-messages")!;
const formEl = document.getElementById("chat-form")!;
const inputEl = document.getElementById("chat-input") as HTMLInputElement | null;
const searchEl = document.getElementById("chat-search")!;

let activeConversation: Conversation | null = null;
let conversations: ConversationSummary[] = [];

// initial load
(async () => {
  conversations.splice(0, conversations.length, ...(await fetchConversations()));
  renderChatList(conversations, chatListEl);
})();

chatListEl.addEventListener("click", async (e) => {
  const li = (e.target as HTMLElement).closest("li");
  if (!li) return;

  const id = li.dataset.id!;
  const convo = await fetchConversation(id);

  chatHeaderEl.textContent = convo.summary.title;
  renderMessages(convo, messagesEl, getCurrentUsername());

  activeConversation = convo;
});


formEl.addEventListener("submit", async (e) => {
  e.preventDefault();

  if (!activeConversation) return;
  if (!inputEl) return;

  const text = inputEl.value.trim();
  if (!text) return;

  const msg = await sendMessage({
    conversationId: activeConversation.summary.id,
    text,
  } as any);

  activeConversation.messages.push(msg);
  renderMessages(activeConversation, messagesEl);

  inputEl.value = "";
});