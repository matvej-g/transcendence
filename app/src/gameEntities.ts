export interface Paddle {
    x: number;
    y: number;
    width: number;
    height: number;
    speed: number;
    score: number;
}

export interface Ball {
    x: number;
    y: number;
    radius: number;
    velocityX: number;
    velocityY: number;
    speed: number;
}

export interface GameState {
    leftPaddle: Paddle;
    rightPaddle: Paddle;
    ball: Ball;
    isRunning: boolean;
    winner: 'left' | 'right' | null;
}

export interface GameConfig {
    canvasWidth: number;
    canvasHeight: number;
    paddleWidth: number;
    paddleHeight: number;
    ballRadius: number;
    maxScore: number;
}

export const DEFAULT_CONFIG: GameConfig = {
    canvasWidth: 800,
    canvasHeight: 600,
    paddleWidth: 15,
    paddleHeight: 100,
    ballRadius: 10,
    maxScore: 5
};