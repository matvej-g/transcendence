import { GameState, GameConfig, DEFAULT_CONFIG } from './gameEntities.js';

export class GameCanvas {
    private canvas: HTMLCanvasElement | null;
    private renderingContext: CanvasRenderingContext2D | null;
    private config: GameConfig;

    constructor(canvasId: string = 'gameCanvas', config: GameConfig = DEFAULT_CONFIG) {
        this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
        this.renderingContext = this.canvas?.getContext('2d') || null;
        this.config = config;

        if (this.canvas) {
            this.canvas.width = this.config.canvasWidth;
            this.canvas.height = this.config.canvasHeight;
        }

        console.log('GameCanvas initialized');
    }

	// Clear entire canvas
    public clear(): void {
        if (!this.renderingContext || !this.canvas) return;
        this.renderingContext.fillStyle = '#1a1a1a';
        this.renderingContext.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }



	/*
	* Drawing functions inside Canvas
	*/

	// Render game screen
	public render(state: GameState): void {
		if (!this.renderingContext || !this.canvas) return;

		this.clear();
		this.drawCenterLine();
		this.drawPaddle(state.leftPaddle);
        this.drawPaddle(state.rightPaddle);
        this.drawBall(state.ball);
        this.drawScore(
            state.leftPaddle.score, state.rightPaddle.score,
            state.leftPlayerName, state.rightPlayerName
        );
	}

	// Draw center Line
	private drawCenterLine(): void {
        if (!this.renderingContext || !this.canvas) return;

        this.renderingContext.strokeStyle = '#444444';
        this.renderingContext.lineWidth = 2;
        this.renderingContext.setLineDash([10, 10]);
        this.renderingContext.beginPath();
        this.renderingContext.moveTo(this.canvas.width / 2, 0);
        this.renderingContext.lineTo(this.canvas.width / 2, this.canvas.height);
        this.renderingContext.stroke();
        this.renderingContext.setLineDash([]); // Reset
    }

	// draw Paddle
	private drawPaddle(paddle: { x: number; y: number; width: number; height: number }): void {
        if (!this.renderingContext) return;

        this.renderingContext.fillStyle = '#ffffff';
        this.renderingContext.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
    }

	// draw Ball
	private drawBall(ball: { x: number; y: number; radius: number }): void {
        if (!this.renderingContext) return;

        this.renderingContext.fillStyle = '#ffffff';
        this.renderingContext.beginPath();
        this.renderingContext.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
        this.renderingContext.fill();
    }

    // draw Score
    private drawScore(leftScore: number, rightScore: number,
        leftPlayerName?: string, rightPlayerName?: string
    ): void {
        if (!this.renderingContext || !this.canvas) return;

        this.renderingContext.fillStyle = '#ffffff';
        this.renderingContext.textAlign = 'center';
        this.renderingContext.textBaseline = 'top';

        //draw Player Names
        this.renderingContext.font = '12px Arial';
        if (leftPlayerName) {
            this.renderingContext.fillText(
                leftPlayerName,
                this.canvas.width / 4,
                10
            );
        }
        if (rightPlayerName) {
            this.renderingContext.fillText(
                rightPlayerName,
                (this.canvas.width * 3) / 4,
                10
            );
        }
        this.renderingContext.font = '24px Arial';
        // Left score
        this.renderingContext.fillText(
            leftScore.toString(),
            this.canvas.width / 4,
            30
        );
        // Right score
        this.renderingContext.fillText(
            rightScore.toString(),
            (this.canvas.width * 3) / 4,
            30
        );
    }

    //draw Winner
    public drawWinner(winner: 'left' | 'right'): void {
        if (!this.renderingContext || !this.canvas) return;

        // Semi-transparent overlay
        this.renderingContext.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.renderingContext.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Winner text
        this.renderingContext.fillStyle = '#ffffff';
        this.renderingContext.font = 'bold 64px Arial';
        this.renderingContext.textAlign = 'center';
        this.renderingContext.fillText(
            `${winner.toUpperCase()} WINS!`,
            this.canvas.width / 2,
            this.canvas.height / 2
        );
    }

	/*
	* Public Helper functions
	*/

	// Get canvas size
	public getCanvasSize(): { width: number; height: number } {
        return {
            width: this.canvas?.width || 0,
            height: this.canvas?.height || 0
        };
    }

	// Show game container
    public show(): void {
        const container = document.getElementById('gameContainer');
        const exitButton = document.getElementById('exitGameButton');
        container?.classList.remove('hidden');
        exitButton?.classList.remove('hidden');
        console.log('Game canvas visible');
    }

    
    // Hide game container
    public hide(): void {
        const container = document.getElementById('gameContainer');
        const exitButton = document.getElementById('exitGameButton');
        container?.classList.add('hidden');
        exitButton?.classList.add('hidden');
        console.log('Game canvas hidden');
    }

    // for remote Play
    public showSearching(): void {
        if (!this.renderingContext || !this.canvas) return;

        this.clear();

        this.renderingContext.fillStyle = '#ffffff';
        this.renderingContext.font = 'bold 48px Arial';
        this.renderingContext.textAlign = 'center';
        this.renderingContext.textBaseline = 'middle';

        this.renderingContext.fillText(
            'Searching for players...',
            this.canvas.width / 2,
            this.canvas.height / 2
        );
    }

    // Show countdown timer (3, 2, 1, GO!)
    public showCountdown(callback: () => void): void {
        if (!this.renderingContext || !this.canvas) return;
        let count = 3;
        const showNumber = () => {
            this.clear();
            this.renderingContext!.fillStyle = '#ffffff';
            this.renderingContext!.font = 'bold 120px Arial';
            this.renderingContext!.textAlign = 'center';
            this.renderingContext!.textBaseline = 'middle';
            if (count > 0) {
                this.renderingContext!.fillText(
                    count.toString(),
                    this.canvas!.width / 2,
                    this.canvas!.height / 2
                );
            } else {
                this.renderingContext!.fillText(
                    'GO!',
                    this.canvas!.width / 2,
                    this.canvas!.height / 2
                );
            }
            count--;
            if (count >= 0) {
                setTimeout(showNumber, 1000);
            } else {
                setTimeout(() => {
                    callback();
                }, 500);
            }
        };
        showNumber();
    }
}