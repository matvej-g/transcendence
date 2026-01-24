// frontend/src/ws/appWs.ts
//
// Minimal WebSocket client for "app" events (messages, friends, notifications).
// Connects to nginx route:  /ws/app
// Automatically chooses ws:// or wss:// based on current page protocol.

import { logger } from '../utils/logger.js';

logger.log('AppWs module loaded');

export type AppWsEvent = {
  /** Event type, e.g. "message.created" */
  type: string;
  /** Event payload (shape depends on event type) */
  data?: any;
};

/** Callback signature for event listeners */
type Handler = (ev: AppWsEvent) => void;

/**
 * WebSocket URL.
 * - http  -> ws://<host>/wsapp
 * - https -> wss://<host>/wsapp
 */
const APP_WS_URL: string =
  (location.protocol === "https:" ? "wss://" : "ws://") +
  location.host +
  "/wsapp";

/**
 * AppWs manages a single WebSocket connection to the "app" WS backend.
 * Responsibilities:
 *  - maintain the socket
 *  - auto-reconnect on disconnect
 *  - fan-out incoming events to listeners
 *  - manage "conversation.join" messages
 */
export class AppWs {
  /** Active WebSocket instance (null if disconnected) */
  private ws: WebSocket | null = null;

  /** Registered event handlers */
  private handlers: Set<Handler> = new Set();

  /** Conversations this client has joined (used to re-join after reconnect) */
  private joinedConversations: Set<string> = new Set();

  /** Reconnect timer handle (null when not scheduled) */
  private reconnectTimer: number | null = null;

  /** Delay (ms) before attempting reconnect */
  private reconnectDelayMs = 500;

  /**
   * Establishes the WebSocket connection if not already connected.
   *
   * Safe to call multiple times:
   * - If already OPEN or CONNECTING, it does nothing.
   * - On successful connection, automatically re-joins all conversations.
   */
  connect(): void {
	logger.log("AppWs connecting to", APP_WS_URL);
	if (
		this.ws &&
		(this.ws.readyState === WebSocket.OPEN ||
			this.ws.readyState === WebSocket.CONNECTING)) {
		return;
	}

	this.ws = new WebSocket(APP_WS_URL);

		// Fired when the socket is successfully opened
	this.ws.onopen = () => {
		logger.log("AppWs open");

		// register user with ws_app server //todo use jwt // or register through backend
		const userId = localStorage.getItem("userId");
		if (userId) {
			this.send({type: "auth", data: { userId: Number(userId) },});
		}
		// Re-join all conversations after reconnect
		for (const cid of this.joinedConversations) {
			this.joinConversation(cid);
		}
	};

    // Fired for each incoming message from the server
    this.ws.onmessage = (e: MessageEvent<string>) => {
		logger.log("AppWs raw message:", e.data);
      let ev: AppWsEvent;
      try {
        ev = JSON.parse(e.data) as AppWsEvent;
      } catch {
        // Ignore invalid / non-JSON payloads
        return;
      }
	  let i = 0;
      // Dispatch event to all registered handlers
      for (const h of this.handlers) 
		{
			logger.log("AppWs dispatching event to handler", ++i, ev);
			h(ev);
		}
    };

    // Fired on low-level socket errors
    this.ws.onerror = () => {
      // Intentionally empty:
      // onclose will handle reconnect logic
    };

    // Fired when the socket closes (server restart, network loss, etc.)
    this.ws.onclose = () => {
		logger.log("AppWs close");
      this.ws = null;
      this.scheduleReconnect();
    };
  }

  /**
   * Schedules a reconnect attempt after a short delay.
   *
   * Ensures only one reconnect timer is active at a time.
   */
  private scheduleReconnect(): void {
    if (this.reconnectTimer !== null) return;

    this.reconnectTimer = window.setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, this.reconnectDelayMs);
  }

  /**
   * Registers an event handler.
   *
   * @param handler - callback invoked for every incoming AppWsEvent
   * @returns function to unsubscribe the handler
   */
  on(handler: Handler): () => void {
    this.handlers.add(handler);
    return () => this.handlers.delete(handler);
  }

  /**
   * Sends a raw object over the WebSocket as JSON.
   *
   * @param obj - any JSON-serializable object
   * @returns true if sent, false if socket is not OPEN
   */
  send(obj: unknown): boolean {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return false;
    this.ws.send(JSON.stringify(obj));
    return true;
  }

  /**
   * Joins a conversation room on the server.
   *
   * The server will start sending events (e.g. message.created)
   * for this conversation.
   *
   * @param conversationId - conversation identifier
   */
  joinConversation(conversationId: string | number): void {
    const cid = String(conversationId);
    this.joinedConversations.add(cid);

    this.send({
      type: "conversation.join",
      data: { conversationId: cid },
    });
  }

  /**
   * Leaves a conversation locally.
   *
   * Currently this only stops auto re-join after reconnect.
   * Implement server-side support if you want to actually unsubscribe.
   *
   * @param conversationId - conversation identifier
   */
  leaveConversation(conversationId: string | number): void {
    const cid = String(conversationId);
    this.joinedConversations.delete(cid);

    // Uncomment only if backend supports it:
    // this.send({ t: "conversation.leave", d: { conversationId: cid } });
  }
}

/**
 * Singleton instance used by the frontend.
 *
 * Typical usage:
 *   import { appWs } from "./ws/appWs";
 *   appWs.connect();
 *   appWs.joinConversation(42);
 *   appWs.on(ev => { ... });
 */
export const appWs = new AppWs();
