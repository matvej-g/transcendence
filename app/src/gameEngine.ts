import { GameState, Paddle, Ball, GameConfig, DEFAULT_CONFIG } from './gameEntities.js';
import { GameCanvas } from './gameCanvas.js';

export class GameEngine {
    private gameState: GameState;
    private config: GameConfig;
    private canvas: GameCanvas;
    private animationId: number | null = null;
    private lastTime: number = 0;
    private isLocalGame: boolean = true;
    private inputHandler?: () => { [key: string]: boolean};

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
                speed: 550,
                score: 0
            },
            rightPaddle: {
                x: dimensions.width - 20 - this.config.paddleWidth,
                y: (dimensions.height - this.config.paddleHeight) / 2,
                width: this.config.paddleWidth,
                height: this.config.paddleHeight,
                speed: 550,
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

    //
    public setInputHandler(handler: () => {[key: string]: boolean}): void {
        this.inputHandler = handler;
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

    // Render everything
    private render(): void {
		this.canvas.render(this.gameState);
        if (this.gameState.winner) {
            this.canvas.drawWinner(this.gameState.winner);
        }
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
        if (this.inputHandler) {
            this.handleInput(this.inputHandler(), deltaTime);
        }

        this.updateBall(deltaTime);
        this.checkCollision();
        this.checkScore();
    }

    // handle Keyboard input
    private handleInput(keyState: {[key: string]: boolean}, deltaTime: number): void {
        // left Paddle (w/s)
        if (keyState['w'] || keyState['W']) {
            this.movePaddle('left', 'up', deltaTime);
        }
        if (keyState['s'] || keyState['S']) {
            this.movePaddle('left', 'down', deltaTime);
        }

        // right paddle (arrow keys)
        if (keyState['ArrowUp']) {
            this.movePaddle('right', 'up', deltaTime);
        }
        if (keyState['ArrowDown']) {
            this.movePaddle('right', 'down', deltaTime);
        }
    }

    // update ball position
    private updateBall(deltaTime: number): void {
        const ball = this.gameState.ball;

        ball.x += ball.velocityX * ball.speed * deltaTime;
        ball.y += ball.velocityY * ball.speed * deltaTime;
    }

    //PUBLIC: move paddle 
    public movePaddle(paddle: 'left' | 'right', direction: 'up' | 'down', deltaTime:number): void {
        const targetPaddle = paddle === 'left' ? this.gameState.leftPaddle : this.gameState.rightPaddle;
        const dimensions = this. canvas.getCanvasSize();

        const movement = targetPaddle.speed * deltaTime;

        if (direction === 'up') {
            targetPaddle.y = Math.max(0, targetPaddle.y - movement);
        } else {
            targetPaddle.y = Math.min(dimensions.height - targetPaddle.height, targetPaddle.y + movement);
        }
    }
    
    // Collision check
    private checkCollision(): void {
        const ball = this.gameState.ball;
        const dimensions = this.canvas.getCanvasSize();

        //top/bottom wall
        if (ball.y - ball.radius <= 0 || ball.y + ball.radius >= dimensions.height) {
            ball.velocityY *= -1;
        }

        //paddle collison
        this.checkPaddleCollision(this.gameState.leftPaddle);
        this.checkPaddleCollision(this.gameState.rightPaddle);
    }

    //check paddle collision
    private checkPaddleCollision(paddle: Paddle): void {
        const ball = this.gameState.ball;
        if (ball.x - ball.radius <= paddle.x + paddle.width &&
            ball.x + ball.radius >= paddle.x &&
            ball.y >= paddle.y &&
            ball.y <= paddle.y + paddle.height)
            {
                //hitPosition between 0 and 1 (0 = top, 1 = bottom)
                const hitPosition = (ball.y - paddle.y) / paddle.height;
                //convert it to -1 and 1 (-1 top, 1 = bottom)
                const relativeHitPosition = (hitPosition - 0.5) * 2
                const maxAngle = Math.PI / 3; //60 degrees
                const angle = relativeHitPosition * maxAngle;
                //calc new speed
                const speed = Math.sqrt(ball.velocityX * ball.velocityX + ball.velocityY * ball.velocityY)
                const newVelocityX = -ball.velocityX;
                const newVelocityY = Math.tan(angle) * Math.abs(newVelocityX);

                //normalize speed
                const magnitude = Math.sqrt(newVelocityX * newVelocityX + newVelocityY * newVelocityY);
                ball.velocityX = (newVelocityX / magnitude) * speed;
                ball.velocityY = (newVelocityY / magnitude) * speed;
                
                //increase speed on each hit
                ball.speed *= 1.05;

                //prevent stuck in paddle
                if (ball.velocityX > 0) {
                    ball.x = paddle.x + paddle.width + ball.radius;
                } else {
                    ball.x = paddle.x - ball.radius;
                }
            }
    }

    //check scoring
    private checkScore(): void {
        const ball = this.gameState.ball;
        const dimensions = this.canvas.getCanvasSize();

        //left side check (right player scores)
        if (ball.x - ball.radius <= 0) {
            this.gameState.rightPaddle.score++;
            this.resetBall();
        }

        //right side check (left player scores)
        if (ball.x + ball.radius >= dimensions.width) {
            this.gameState.leftPaddle.score++;
            this.resetBall();
        }

        //check for winner
        if (this.gameState.leftPaddle.score == this.config.maxScore) {
            this.endGame('left');
        }
        if (this.gameState.rightPaddle.score == this.config.maxScore) {
            this.endGame('right');
        }
    }

    //reset Ball
    private resetBall(): void {
        const dimensions = this.canvas.getCanvasSize();
        this.gameState.ball.x = dimensions.width / 2;
        this.gameState.ball.y = dimensions.height / 2;
        this.gameState.ball.speed = 60;
        this.gameState.ball.velocityY = (Math.random() > 0.5 ? 1 : -1) * 5,
        this.gameState.ball. velocityX *= -1;
    }

    //end Game with winner
    private endGame(winner: 'left' | 'right'): void {
        this.gameState.winner = winner;
        this.gameState.isRunning = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        this.canvas.render(this.gameState);
    }
}