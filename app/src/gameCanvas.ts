import { GameState, GameConfig, DEFAULT_CONFIG } from './gameEntities.js';

export class GameCanvas {
    private canvas: HTMLCanvasElement | null;
    private renderingContext: CanvasRenderingContext2D | null;
    private config: GameConfig;
    private resizeHandler: (() => void) | null = null;

    constructor(canvasId: string = 'gameCanvas', config: GameConfig = DEFAULT_CONFIG) {
        this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
        this.renderingContext = this.canvas?.getContext('2d') || null;
        this.config = config;

        console.log('GameCanvas initialized');
    }

    // Resize canvas based on viewport size
    private resizeCanvas(): void {
        if (!this.canvas) return;

        // Canvas size
    	const maxWidth = this.config.canvasWidth; //set this in gameEnteties
    	const maxHeight = this.config.canvasHeight; //set this in gameEnteties
    	const viewportWidth = window.innerWidth * 0.85;
    	const viewportHeight = window.innerHeight * 0.7;

        // keep between min - max
        let width = Math.min(viewportWidth, maxWidth);
        let height = Math.min(viewportHeight, maxHeight);

        const aspectRatio = 2 / 1;
        if (width / height > aspectRatio) {
            width = height * aspectRatio;
        } else {
            height = width / aspectRatio;
        }

        this.canvas.width = width;
        this.canvas.height = height;

        console.log(`Canvas resized to: ${this.canvas.width}x${this.canvas.height}`);
        
        this.clear();
    }

    // Clear entire canvas
    private clear(): void {
        if (!this.renderingContext || !this.canvas) return;
        this.renderingContext.fillStyle = '#1a1a1a';
        this.renderingContext.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    // Show game container
    public show(): void {
        const container = document.getElementById('gameContainer');
        container?.classList.remove('hidden');
        
        // set initial Canvas Size
        this.resizeCanvas();
		this.render();

        // set the rezise Listener
        this.resizeHandler = () => {
    	    this.resizeCanvas();
        	this.render();
    	};

        window.addEventListener('resize', this.resizeHandler);
        console.log('Game canvas visible');
    }

    
    // Hide game container
    public hide(): void {
        const container = document.getElementById('gameContainer');
        container?.classList.add('hidden');
        
        // remove resize Listener
        if (this.resizeHandler) {
            window.removeEventListener('resize', this.resizeHandler);
            this.resizeHandler = null;
        }
        
        console.log('Game canvas hidden');
    }

	/*
	* Drawing inside Canvas
	*/

	private render(): void {
		if (!this.renderingContext || !this.canvas) return;

		this.clear();
		this.drawCenterLine();
		this.drawLeftPaddle(); //remove later and use GameState
		this.drawRightPaddle(); //remove later and use Gamestate
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

	// !!! draw left Paddle  (need remove)
	private drawLeftPaddle(): void {
		if (!this.renderingContext || !this.canvas) return;
		
		const x = 20; // 20px from left edge
		const y = (this.canvas.height - this.config.paddleHeight) / 2;
		
		this.renderingContext.fillStyle = '#ffffff';
		this.renderingContext.fillRect(x, y, this.config.paddleWidth, this.config.paddleHeight);
	}
	// !!! draw eight Paddle  (need remove)
	private drawRightPaddle(): void {
		if (!this.renderingContext || !this.canvas) return;
		
		const x = this.canvas.width - 20 - this.config.paddleWidth;
		const y = (this.canvas.height - this.config.paddleHeight) / 2;
		
		this.renderingContext.fillStyle = '#ffffff';
		this.renderingContext.fillRect(x, y, this.config.paddleWidth, this.config.paddleHeight);
	}

}