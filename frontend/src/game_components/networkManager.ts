import { DEFAULT_CONFIG, GameState } from "./gameEntities.js";
import { GameCanvas } from "./gameCanvas";

export class NetworkManager {
	private canvas: GameCanvas;
	private localGameState: GameState; 
	private socket: WebSocket | null = null;
	private roomId: string | null = null;
	private playerRole: 'left' | 'right' | null = null;
	private currentGameState: any = null;
	private keydownHandler: ((e: KeyboardEvent) => void) | null = null;
	private keyupHandler: ((e: KeyboardEvent) => void) | null = null;
	private gameMode: 'local' | 'remote' | null = null;

	constructor(canvas: GameCanvas) {
		this.canvas = canvas;

		this.localGameState = {
			leftPaddle: {
				x: 20,
				y: DEFAULT_CONFIG.canvasHeight / 2 - DEFAULT_CONFIG.paddleHeight / 2,
				width: DEFAULT_CONFIG.paddleWidth,
				height: DEFAULT_CONFIG.paddleHeight,
				score: 0
			},
			rightPaddle: {
				x: DEFAULT_CONFIG.canvasWidth - 20 - DEFAULT_CONFIG.paddleWidth,
				y: DEFAULT_CONFIG.canvasHeight / 2 - DEFAULT_CONFIG.paddleHeight / 2,
				width: DEFAULT_CONFIG.paddleWidth,
				height: DEFAULT_CONFIG.paddleHeight,
				score: 0
			},
			ball: {
				x: DEFAULT_CONFIG.canvasWidth / 2,
				y: DEFAULT_CONFIG.canvasHeight / 2,
				radius: DEFAULT_CONFIG.ballRadius
			},
			isRunning: false,
			winner: null
		};
	}

	public connect(url: string, mode: 'local' | 'remote'): void {
		console.log(`Connecting to ${url}...`);
		this.gameMode = mode;
		if (mode == 'local') {
			this.canvas.show();
		} else if (mode == 'remote') {
			this.canvas.showSearching();
		}
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
			data: { gameMode: this.gameMode }
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

			case 'gameUpdate':
				console.log('GameUpdate received:', message.data);
				this.localGameState.leftPaddle.y = message.data.leftPaddleY;
				this.localGameState.rightPaddle.y = message.data.rightPaddleY;
				this.localGameState.ball.x = message.data.ballX;
				this.localGameState.ball.y = message.data.ballY;
				//check if message send with a score
				if (message.data.leftScore !== undefined && message.data.rightScore !== undefined) {
					//console.log('Score update:', message.data.leftScore, message.data.rightScore);
					this.localGameState.leftPaddle.score = message.data.leftScore;
					this.localGameState.rightPaddle.score = message.data.rightScore;
				}
				this.canvas.render(this.localGameState);
				break;

			case 'gameOver':
				console.log('Winner received:', message.data);
				this.canvas.drawWinner(message.data.winner);
				this.removeInputHandlers();
				break;

			case 'opponentDisconnected':
				console.log('Opponent disconnected:', message.data);
				this.canvas.drawWinner(message.data.winner);
				this.removeInputHandlers();
				break;
		}
	}

	private onError(error: Event): void {
        console.error('WebSocket error:', error);
    }

    private onClose(): void {
        console.log('Connection closed');
        this.canvas.hide();
        this.removeInputHandlers();
    }

	private send(data: any): void {
        if (this.socket?.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify(data));
        }
    }

	public disconnect(): void {
		this.removeInputHandlers();
		this.socket?.close();
	}

	private setupInputHandlers(): void {
		this.removeInputHandlers();

		const pressedKeys = new Set<string>();
		this.keydownHandler = (e: KeyboardEvent) => {
			let paddle: 'left' | 'right' | undefined;
			let direction: 'up' | 'down' | undefined;
			//prevent scrolling with arrowkeys and space
			if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
				e.preventDefault();
			}

			if (e.key === 'w' || e.key === 'W' || e.key === 'ArrowUp') {
				direction = 'up';
			} else if (e.key === 's' || e.key === 'S' || e.key === 'ArrowDown') {
				direction = 'down';
			}
			//add paddle info in local mode
			if (this.gameMode === 'local') {
				if (e.key === 'w' || e.key === 'W' || e.key === 's' || e.key === 'S') {
					paddle = 'left';
				} else if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
					paddle = 'right';
				}
			}

			if (direction) {
				//prevent repeated keydown events when holding key
				if (pressedKeys.has(e.key)) return;
				pressedKeys.add(e.key);

				const inputData: any = {
					action: 'keydown',
					direction: direction
				};
				//add paddle info in local mode
				if (paddle) {
					inputData['paddle'] = paddle;
				}
				this.send({
					type: 'input',
					data: inputData
				});
			}
		};

		this.keyupHandler = (e: KeyboardEvent) => {
			let paddle: 'left' | 'right' | undefined;

			if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
				e.preventDefault();
			}

			// Check if this is a game key
			const isGameKey = ['w', 'W', 's', 'S', 'ArrowUp', 'ArrowDown'].includes(e.key);

			if (isGameKey) {
				pressedKeys.delete(e.key);
				//for local mode send paddle side
				if (this.gameMode === 'local') {
					if (e.key === 'w' || e.key === 'W' || e.key === 's' || e.key === 'S') {
						paddle = 'left';
					} else if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
						paddle = 'right';
					}
				}
				const inputData: any = {
					action: 'keyup'
				};
				//add paddle info in local mode
				if (paddle) {
					inputData['paddle'] = paddle;
				}
				this.send({
					type: 'input',
					data: inputData
				});
			}
		};
		document.addEventListener('keydown', this.keydownHandler);
		document.addEventListener('keyup', this.keyupHandler);
	}

	private removeInputHandlers(): void {
		if (this.keydownHandler) {
			document.removeEventListener('keydown', this.keydownHandler);
			this.keydownHandler = null;
		}
		if (this.keyupHandler) {
			document.removeEventListener('keyup', this.keyupHandler);
			this.keyupHandler = null;
		}
	}
}