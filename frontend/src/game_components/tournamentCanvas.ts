import { TournamentState, TournamentConfig, DEFAULT_TOURNAMENT_CONFIG } from './gameEntities.js';

export class TournamentCanvas {
	private canvas: HTMLCanvasElement | null;
	private renderingContext: CanvasRenderingContext2D | null;
	private config: TournamentConfig;

	constructor(canvasId: string = 'tournamentCanvas', config: TournamentConfig = DEFAULT_TOURNAMENT_CONFIG) {
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

	// Show tournament container
    public show(): void {
        const container = document.getElementById('tournamentContainer');
        const exitButton = document.getElementById('exitTournamentButton');
        container?.classList.remove('hidden');
        exitButton?.classList.remove('hidden');
        console.log('Tournament canvas visible');
    }

	// Hide tournament container
    public hide(): void {
        const container = document.getElementById('tournamentContainer');
        const exitButton = document.getElementById('exitTournamentButton');
        container?.classList.add('hidden');
        exitButton?.classList.add('hidden');
        console.log('Tournament canvas hidden');
    }

	// Render tournament window
	public render(state: TournamentState): void {
		if (!this.renderingContext || !this.canvas) return;

		this.clear();
	}
}
 