import { GameState } from "./gameEntities";

export class NetworkManager {
	private socket: WebSocket | null = null;
	private roomId: string | null = null;
	private playerRole: 'left' | 'right' | null = null;
}