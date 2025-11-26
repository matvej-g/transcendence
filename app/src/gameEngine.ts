import { GameState, Paddle, Ball, GameConfig, DEFAULT_CONFIG } from './gameEntities.js';
import { GameCanvas } from './gameCanvas.js';

export class GameEngine {
    private gameState: GameState;
    private config: GameConfig;
    private canvas: GameCanvas;
    private animationId: number | null = null;
    private lastTime: number = 0;
    private isLocalGame: boolean = true;

    constructor(canvas: GameCanvas, config: GameConfig = DEFAULT_CONFIG, isLocalGame: boolean = true) {
        this.canvas = canvas;
        this.config = config;
        this.isLocalGame = isLocalGame;
        this.gameState = this.initializeGameState();
    }

    // Init GameState
    private initializeGameState(): GameState {
        const dimensions = this.canvas.getCanvasSize();
        
        return {
            leftPaddle: {
                x: 20,
                y: (dimensions.height - this.config.paddleHeight) / 2,
                width: this.config.paddleWidth,
                height: this.config.paddleHeight,
                speed: 5,
                score: 0
            },
            rightPaddle: {
                x: dimensions.width - 20 - this.config.paddleWidth,
                y: (dimensions.height - this.config.paddleHeight) / 2,
                width: this.config.paddleWidth,
                height: this.config.paddleHeight,
                speed: 5,
                score: 0
            },
            ball: {
                x: dimensions.width / 2,
                y: dimensions.height / 2,
                radius: this.config.ballRadius,
                velocityX: (Math.random() > 0.5 ? 1 : -1) * 5,
                velocityY: (Math.random() > 0.5 ? 1 : -1) * 5,
                speed: 60
            },
            isRunning: false,
            winner: null
        };
    }

    // start game state
    public start(): void {
        this.gameState.isRunning = true;
        this.lastTime = performance.now();
        this.gameLoop();
        console.log('Game started');
    }

    // stop game state
    public stop(): void {
        this.gameState.isRunning = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        this.gameState.isRunning = false;
        this.reset();
        console.log('Game stopped');
    }

    public reset(): void {
        this.gameState = this.initializeGameState();
        this.lastTime = 0;
    }

    // Game Loop
    private gameLoop = (): void => {
        if (!this.gameState.isRunning) return;

        const currentTime = performance.now();
        const deltaTime = (currentTime - this.lastTime) / 1000; // in seconds
        this.lastTime = currentTime;

        // for Local game state
        if (this.isLocalGame) {
            this.update(deltaTime);
        }

        //TODO: for remote game state

        // Draw everything
        this.render();

        // Continue loop
        if (this.gameState.isRunning) {
            this.animationId = requestAnimationFrame(this.gameLoop);
        }
            
    };

    // update local game logic 
    private update(deltaTime: number): void {
        this.updateBall(deltaTime);
    }

    // update ball position
    private updateBall(deltaTime: number): void {
        const ball = this.gameState.ball;

        ball.x += ball.velocityX * ball.speed * deltaTime;
        ball.y += ball.velocityY * ball.speed * deltaTime;
    }

    // Render everything
    private render(): void {
		this.canvas.render(this.gameState);
    }

}