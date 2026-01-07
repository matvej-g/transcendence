export interface Paddle {
    x: number;
    y: number;
    width: number;
    height: number;
    score: number;
}

export interface Ball {
    x: number;
    y: number;
    radius: number;
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
}

export const DEFAULT_CONFIG: GameConfig = {
    canvasWidth: 800, // set max width here
    canvasHeight: 400, // set max height here
    paddleWidth: 12,
    paddleHeight: 60,
    ballRadius: 8,
};