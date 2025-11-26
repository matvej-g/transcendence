import { GameState, Paddle, Ball, GameConfig, DEFAULT_CONFIG } from './gameEntities.js';
import { GameCanvas } from './gameCanvas.js';

export class GameEngine {
    private gameState: GameState;
    private config: GameConfig;
    private canvas: GameCanvas;
    private animationId: number | null = null;

    constructor(canvas: GameCanvas, config: GameConfig = DEFAULT_CONFIG) {
        this.canvas = canvas;
        this.config = config;
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
                velocityX: 5,
                velocityY: 5,
                speed: 5
            },
            isRunning: false,
            winner: null
        };
    }

    // start game state
    public start(): void {
        this.gameState.isRunning = true;
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
        console.log('Game stopped');
    }

    // Game Loop
    private gameLoop = (): void => {
        if (!this.gameState.isRunning) return;

        // Draw everything
        this.render();

        // Continue loop
        this.animationId = requestAnimationFrame(this.gameLoop);
    };

    // Render everything
    private render(): void {
		this.canvas.render(this.gameState);
    }

}