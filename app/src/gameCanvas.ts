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
    private clear(): void {
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
        container?.classList.remove('hidden');

        console.log('Game canvas visible');
    }

    
    // Hide game container
    public hide(): void {
        const container = document.getElementById('gameContainer');
        container?.classList.add('hidden');

        console.log('Game canvas hidden');
    }
}