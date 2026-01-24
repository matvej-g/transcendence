/*
    For Game Canvas
*/
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
    leftPlayerName?: string;
    rightPlayerName?: string;
}

export interface GameConfig {
    canvasWidth: number;
    canvasHeight: number;
    paddleWidth: number;
    paddleHeight: number;
    ballRadius: number;
}

export const DEFAULT_GAME_CONFIG: GameConfig = {
    canvasWidth: 800, // set max width here
    canvasHeight: 400, // set max height here
    paddleWidth: 10,
    paddleHeight: 60,
    ballRadius: 8,
};

/*
    For Tournament Canvas
*/
export interface Match {
    player1: string | null;
    player2: string | null;
    winner: string | null;
}

export interface TournamentState {
    isRunning: boolean;
    winner: string | null;
    rounds: Match[][];
    players: string[];
    currentRound: number;
}

export interface TournamentConfig {
    canvasWidth: number;
    canvasHeight: number;
    maxPlayers: number;
}

export const DEFAULT_TOURNAMENT_CONFIG: TournamentConfig = {
    canvasWidth: 800,
    canvasHeight: 400,
    maxPlayers: 8,
};