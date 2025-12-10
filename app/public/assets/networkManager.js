import { DEFAULT_CONFIG } from "./gameEntities.js";
export class NetworkManager {
    constructor(canvas) {
        this.socket = null;
        this.roomId = null;
        this.playerRole = null;
        this.currentGameState = null;
        this.keydownHandler = null;
        this.keyupHandler = null;
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
    connect(url) {
        console.log(`Connecting to ${url}...`);
        this.canvas.showSearching();
        this.socket = new WebSocket(url);
        this.socket.onopen = () => this.onConnected();
        this.socket.onmessage = (event) => this.onMessage(event);
        this.socket.onclose = () => this.onClose();
        this.socket.onerror = (error) => this.onError(error);
    }
    onConnected() {
        console.log('Connected to server!');
        this.send({
            type: 'join',
            data: { gameMode: 'remote' }
        });
    }
    onMessage(event) {
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
<<<<<<< HEAD
            case 'gameState':
                //console.log('GameState received:', message.data);
                this.canvas.render(message.data);
=======
            case 'gameUpdate':
                // console.log('GameUpdate received:', message.data);
                // console.log('leftScore:', message.data.leftScore, 'type:', typeof message.data.leftScore);
                // console.log('rightScore:', message.data.rightScore, 'type:', typeof message.data.rightScore);
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
>>>>>>> 34e7fc8 (removed localEngine.ts, optimized server logic)
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
    onError(error) {
        console.error('WebSocket error:', error);
    }
    onClose() {
        console.log('Connection closed');
        this.canvas.hide();
        this.removeInputHandlers();
    }
    send(data) {
        if (this.socket?.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify(data));
        }
    }
    disconnect() {
        this.removeInputHandlers();
        this.socket?.close();
    }
    setupInputHandlers() {
        this.removeInputHandlers();
        const pressedKeys = new Set();
        this.keydownHandler = (e) => {
            // Prevent scrolling for arrow keys and WASD
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
                e.preventDefault();
            }
            //prevent repeated keydown events when holding key
            if (pressedKeys.has(e.key))
                return;
            pressedKeys.add(e.key);
            let direction = '';
            if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
                direction = 'up';
            }
            else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
                direction = 'down';
            }
            if (direction) {
                this.send({
                    type: 'input',
                    data: {
                        action: 'keydown',
                        direction
                    }
                });
            }
        };
        this.keyupHandler = (e) => {
            // Prevent scrolling for arrow keys and WASD
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
                e.preventDefault();
            }
            pressedKeys.delete(e.key);
            let direction = '';
            if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
                direction = 'up';
            }
            else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
                direction = 'down';
            }
            if (direction) {
                this.send({
                    type: 'input',
                    data: {
                        action: 'keyup',
                        direction
                    }
                });
            }
        };
        document.addEventListener('keydown', this.keydownHandler);
        document.addEventListener('keyup', this.keyupHandler);
    }
    removeInputHandlers() {
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
