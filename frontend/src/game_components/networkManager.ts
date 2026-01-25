import { DEFAULT_GAME_CONFIG, GameState, DEFAULT_TOURNAMENT_CONFIG, TournamentState } from "./gameEntities.js";
import { GameCanvas } from "./gameCanvas";
import { TournamentCanvas } from "./tournamentCanvas.js";
import { logger } from '../utils/logger.js';
//import { reloadMatchHistory, reloadStats } from "../components/profile/profile.js";

export class NetworkManager {
	private canvas: GameCanvas;
	private t_canvas: TournamentCanvas;
	private localGameState: GameState; 
	private localTournamentState: TournamentState;
	private socket: WebSocket | null = null;
	private roomId: string | null = null;
	private playerRole: 'left' | 'right' | null = null;
	private currentGameState: any = null;
	private keydownHandler: ((e: KeyboardEvent) => void) | null = null;
	private keyupHandler: ((e: KeyboardEvent) => void) | null = null;
	private gameMode: 'local' | 'remote' | 'joinT' | 'invite' | null = null;
	private userId: number | null = null;
	private inviteCode: string | null = null;

	constructor(canvas: GameCanvas, t_canvas: TournamentCanvas) {
		this.canvas = canvas;
		this.t_canvas = t_canvas;
		this.localGameState = {} as GameState;
		this.localTournamentState = {} as TournamentState;
		this.resetlocalMatchState();
		this.resetlocalTournamentState();
	}

	public connect(url: string, mode: 'local' | 'remote' | 'joinT' | 'invite' , userId: number, inviteCode?: string): void {
		logger.log(`Connecting to ${url}...`);
		this.gameMode = mode;
		this.userId = userId;
		this.inviteCode = inviteCode ?? null;
		if (mode == 'local') {
			this.canvas.show();
		} else if (mode == 'remote') {
			this.canvas.showSearching();
		} else if (mode == 'joinT') {
			this.t_canvas.show();
		} else if (mode == 'invite') {
			this.canvas.show();
		}
		this.socket = new WebSocket(url);
		this.socket.onopen = () => this.onConnected();
		this.socket.onmessage = (event) => this.onMessage(event);
		this.socket.onclose = () => this.onClose();
		this.socket.onerror = (error) => this.onError(error);
	}

	private onConnected(): void {
		logger.log('Connected to server!');

		// send authenticate message to server using JWT
		const token = localStorage.getItem("authToken");
		this.send({
			type: 'authenticate',
			data: { token }
		});
	}

	private onMessage(event: MessageEvent): void {
		const message = JSON.parse(event.data);

		switch (message.type) {
			case 'connected':
				logger.log('Server confirmed:', message.data);
				//send join after authentication
				if (this.gameMode === 'invite' && this.inviteCode) {
					this.send({
						type: 'invite',
						data: { inviteCode: this.inviteCode }
					});
				} else {
					this.send({
						type: 'join',
						data: { gameMode: this.gameMode }
					});
				}
				if (this.gameMode === 'local' || this.gameMode === 'remote' || this.gameMode === 'invite') {
					this.canvas.show();
				}
				break;
			case 'matchFound':
				logger.log('Match found!');
				this.resetlocalMatchState();
				if (message.data.leftPlayerName) {
					this.localGameState.leftPlayerName = message.data.leftPlayerName;
				}
				if (message.data.rightPlayerName) {
					this.localGameState.rightPlayerName = message.data.rightPlayerName;
				}
				this.canvas.clear();
				this.canvas.showCountdown(() => {
					this.setupInputHandlers();
				});
				break;

			case 'gameUpdate':
				// logger.log('GameUpdate received:', message.data);
				this.localGameState.leftPaddle.y = message.data.leftPaddleY;
				this.localGameState.rightPaddle.y = message.data.rightPaddleY;
				this.localGameState.ball.x = message.data.ballX;
				this.localGameState.ball.y = message.data.ballY;
				//check if message send with a score
				if (message.data.leftScore !== undefined && message.data.rightScore !== undefined) {
					logger.log('Score update:', message.data.leftScore, message.data.rightScore);
					this.localGameState.leftPaddle.score = message.data.leftScore;
					this.localGameState.rightPaddle.score = message.data.rightScore;
				}
				this.canvas.render(this.localGameState);
				break;

			case 'gameOver':
				logger.log('Winner received:', message.data);
				this.canvas.cancelCountdown();
				this.canvas.drawWinner(message.data.winner);
				this.removeInputHandlers();
				window.__profileReload = { stats: true, matchHistory: true };
				break;

			case 'opponentDisconnected':
				logger.log('Opponent disconnected:', message.data);
				this.canvas.cancelCountdown();
				this.canvas.drawWinner(message.data.winner);
				this.removeInputHandlers();
				window.__profileReload = { stats: true, matchHistory: true };
				break;
			case 'alreadyInGame':
				alert(message.data.message);
				window.location.hash = 'profile';
				break;
			case 'alreadySearching':
				alert(message.data.message);
				window.location.hash = 'profile';
				break;
			case 'tournamentStart':
				logger.log('Tournament starting:', message.data);
				this.localTournamentState = {
					isRunning: true,
					winner: null,
					rounds: message.data.rounds,
					players: message.data.players,
					currentRound: 0
				};
				this.t_canvas.show();
				this.t_canvas.render(this.localTournamentState);
				break;
			case 'tournamentQueue':
				logger.log('Tournament queue update:', message.data);
				this.canvas.hide();
				this.t_canvas.show();
				this.t_canvas.showSearching(message.data.waiting);
				break;
			case 'tournamentUpdate':
				logger.log('Tournament update:', message.data);
				this.localTournamentState.rounds = message.data.rounds;
				this.localTournamentState.currentRound = message.data.currentRound;
				if (!this.localGameState.isRunning) {
					this.t_canvas.render(this.localTournamentState);
				}
				break;
			case 'tournamentMatchEnd':
				logger.log('Tournament update:', message.data);
				this.t_canvas.cancelCountdown();
				this.resetlocalMatchState();
				this.localTournamentState.rounds = message.data.rounds;
				this.localTournamentState.currentRound = message.data.currentRound;
				this.removeInputHandlers();
				this.canvas.hide();
				this.t_canvas.show();
				this.t_canvas.render(this.localTournamentState);
				break;
			case 'tournamentMatchAnnounce':
				logger.log('Match announce:', message.data);
				this.resetlocalMatchState();
				this.localGameState.leftPlayerName = message.data.player1;
				this.localGameState.rightPlayerName = message.data.player2;
				this.localTournamentState.rounds = message.data.rounds;
				this.localTournamentState.currentRound = message.data.currentRound;
				this.t_canvas.showCountdown(
					this.localTournamentState,
					() => {
						// wait for countdownFinished signal from Server
					}, 30
				);
				break;
			case 'countdownFinished':
				logger.log('Countdown finished:', message.data);
				this.canvas.show();
				this.t_canvas.hide();
				this.setupInputHandlers();
				break;
			case 'tournamentWin':
				logger.log('Tournament winner:', message.data);
				this.canvas.hide();
				this.t_canvas.show();
				this.localTournamentState.winner = message.data.winner;
				this.localTournamentState.isRunning = false;
				this.t_canvas.render(this.localTournamentState);
				alert(`🏆 Tournament Winner: ${message.data.winner}!`);
				break;
			case 'tournamentDC':
				logger.log('Tournament disconnection:', message.data);
				alert(message.data.message);
				this.canvas.hide();
				this.removeInputHandlers();
				this.localTournamentState = {
					isRunning: false,
					winner: null,
					rounds: [],
					players: [],
					currentRound: 0
				};
				this.t_canvas.hide();
				window.location.hash = 'profile';
				break;
			case 'error':
				logger.error('Server error:', message.data.errorMessage);
				alert(message.data.errorMessage);
				window.location.hash = 'profile';
				break;
		}
	}

	private onError(error: Event): void {
        logger.error('WebSocket error:', error);
    }

    private onClose(): void {
        logger.log('Connection closed');
        this.canvas.hide();
        this.removeInputHandlers();
		this.localGameState.leftPaddle.score = 0;
		this.localGameState.rightPaddle.score = 0;
    }

	private send(data: any): void {
        if (this.socket?.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify(data));
        }
    }

	public disconnect(): void {
		this.removeInputHandlers();
		this.canvas.cancelCountdown();
		this.t_canvas.cancelCountdown();
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

	private resetlocalMatchState(): void {
		this.localGameState = {
			leftPaddle: {
				x: 20,
				y: DEFAULT_GAME_CONFIG.canvasHeight / 2 - DEFAULT_GAME_CONFIG.paddleHeight / 2,
				width: DEFAULT_GAME_CONFIG.paddleWidth,
				height: DEFAULT_GAME_CONFIG.paddleHeight,
				score: 0
			},
			rightPaddle: {
				x: DEFAULT_GAME_CONFIG.canvasWidth - 20 - DEFAULT_GAME_CONFIG.paddleWidth,
				y: DEFAULT_GAME_CONFIG.canvasHeight / 2 - DEFAULT_GAME_CONFIG.paddleHeight / 2,
				width: DEFAULT_GAME_CONFIG.paddleWidth,
				height: DEFAULT_GAME_CONFIG.paddleHeight,
				score: 0
			},
			ball: {
				x: DEFAULT_GAME_CONFIG.canvasWidth / 2,
				y: DEFAULT_GAME_CONFIG.canvasHeight / 2,
				radius: DEFAULT_GAME_CONFIG.ballRadius
			},
			isRunning: false,
			winner: null,
			leftPlayerName: undefined,
			rightPlayerName: undefined
		};
	}

	private resetlocalTournamentState(): void {
		this.localTournamentState = {
			isRunning: false,
			winner: null,
			rounds: [],
			players: [],
			currentRound: 0
		};
	}
}
