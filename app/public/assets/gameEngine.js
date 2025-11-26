import { DEFAULT_CONFIG } from './gameEntities.js';
export class GameEngine {
    constructor(canvas, config = DEFAULT_CONFIG, isLocalGame = true) {
        this.animationId = null;
        this.lastTime = 0;
        this.isLocalGame = true;
        // Game Loop
        this.gameLoop = () => {
            if (!this.gameState.isRunning)
                return;
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
        this.canvas = canvas;
        this.config = config;
        this.isLocalGame = isLocalGame;
        this.gameState = this.initializeGameState();
    }
    // Init GameState
    initializeGameState() {
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
    start() {
        this.gameState.isRunning = true;
        this.lastTime = performance.now();
        this.gameLoop();
        console.log('Game started');
    }
    // stop game state
    stop() {
        this.gameState.isRunning = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        this.gameState.isRunning = false;
        this.reset();
        console.log('Game stopped');
    }
    reset() {
        this.gameState = this.initializeGameState();
        this.lastTime = 0;
    }
    // update local game logic 
    update(deltaTime) {
        this.updateBall(deltaTime);
    }
    // update ball position
    updateBall(deltaTime) {
        const ball = this.gameState.ball;
        ball.x += ball.velocityX * ball.speed * deltaTime;
        ball.y += ball.velocityY * ball.speed * deltaTime;
    }
    // Render everything
    render() {
        this.canvas.render(this.gameState);
    }
}
