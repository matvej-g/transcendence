import { GameState } from "./gameEntities";
import { GameCanvas } from "./gameCanvas";

export class NetworkManager {
	private canvas: GameCanvas;
	private socket: WebSocket | null = null;
	private roomId: string | null = null;
	private playerRole: 'left' | 'right' | null = null;

	constructor(canvas: GameCanvas) {
		this.canvas = canvas;
	}

	public connect(url: string): void {
		console.log(`Connecting to ${url}...`);
		this.canvas.showSearching();

		this.socket = new WebSocket(url);
		this.socket.onopen = () => this.onConnected();
		this.socket.onmessage = (event) => this.onMessage(event);
		this.socket.onclose = () => this.onClose();
		this.socket.onerror = (error) => this.onError(error);
	}

	private onConnected(): void {
		console.log('Connected to server!');
		this.send({
			type: 'join',
			data: { gameMode: 'remote' }
		});
	}

	private onMessage(event: MessageEvent): void {
		const message = JSON.parse(event.data);

		switch (message.type) {
			case 'connected':
				console.log('Server confirmed:', message.data);
				this.canvas.show();
				break;
			
			case 'matchFound':
				console.log('Match found!');
				this.canvas.clear();
				this.setupInputHandlers();
				break;

			case 'gameState':
				//console.log('GameState recived:', message.data);
				this.canvas.render(message.data);
				break;
			
			case 'gameOver':
				this.canvas.drawWinner(message.data.winner);
				break;

			case 'opponentDisconnected':
				console.log('Opponent disconnected:', message.data);

				this.canvas.drawWinner(message.data.winner);
				break;
		}
	}

	private onError(error: Event): void {
        console.error('WebSocket error:', error);
    }

    private onClose(): void {
        console.log('Connection closed');
        this.canvas.hide();
    }

	private send(data: any): void {
        if (this.socket?.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify(data));
        }
    }

	public disconnect(): void {
		this.socket?.close();
	}

	private setupInputHandlers(): void {
		// Keydown - Spieler drückt Taste
		document.addEventListener('keydown', (e) => {
			let direction = '';
			
			if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
				direction = 'up';
			} else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
				direction = 'down';
			}
			
			if (direction) {
				this.send({
					type: 'input',
					data: { direction }
				});
			}
		});
	}
}