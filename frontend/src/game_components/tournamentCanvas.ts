import { Match, TournamentState, TournamentConfig, DEFAULT_TOURNAMENT_CONFIG } from './gameEntities.js';
import { logger } from '../utils/logger.js';

export class TournamentCanvas {
    private canvas: HTMLCanvasElement | null;
    private renderingContext: CanvasRenderingContext2D | null;
    private config: TournamentConfig;
    private countdownTimeoutId: ReturnType<typeof setTimeout> | null = null;

    // Layout constants
    private readonly MATCH_WIDTH = 160;
    private readonly MATCH_HEIGHT = 50;
    private readonly ROUND_GAP = 100;
    private readonly PADDING = 40;

    constructor(canvasId: string = 'tournamentCanvas', config: TournamentConfig = DEFAULT_TOURNAMENT_CONFIG) {
        this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
        this.renderingContext = this.canvas?.getContext('2d') || null;
        this.config = config;

        if (this.canvas) {
            this.canvas.width = this.config.canvasWidth;
            this.canvas.height = this.config.canvasHeight;
        }
    }

    public clear(): void {
        if (!this.renderingContext || !this.canvas) return;
        this.renderingContext.fillStyle = '#1a1a1a';
        this.renderingContext.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    public render(state: TournamentState): void {
        if (!this.renderingContext || !this.canvas) return;

        this.clear();
        this.drawTitle();
        this.drawRoundLabels(state.rounds.length);
        this.drawConnectorLines(state.rounds);

        // Draw all matches
        state.rounds.forEach((round, roundIndex) => {
            round.forEach((match, matchIndex) => {
                const isCurrentMatch = roundIndex === state.currentRound && !match.winner;
                this.drawMatch(match, roundIndex, matchIndex, state.rounds.length, isCurrentMatch);
            });
        });
    }

    private drawTitle(): void {
        if (!this.renderingContext || !this.canvas) return;

        this.renderingContext.fillStyle = '#ffffff';
        this.renderingContext.font = 'bold 24px Arial';
        this.renderingContext.textAlign = 'center';
        this.renderingContext.fillText('TOURNAMENT', this.canvas.width / 2, 30);
    }

    private drawRoundLabels(totalRounds: number): void {
        if (!this.renderingContext) return;

        this.renderingContext.fillStyle = '#888888';
        this.renderingContext.font = '14px Arial';
        this.renderingContext.textAlign = 'center';

        const labels = this.getRoundLabels(totalRounds);

        labels.forEach((label, i) => {
            const x = this.PADDING + this.MATCH_WIDTH / 2 + i * (this.MATCH_WIDTH + this.ROUND_GAP);
            this.renderingContext!.fillText(label, x, 60);
        });
    }

    private getRoundLabels(totalRounds: number): string[] {
        // For 8 players: 3 rounds -> QF, SF, Final
        if (totalRounds === 3) {
            return ['Quarterfinals', 'Semifinals', 'Final'];
        }
        // For 4 players: 2 rounds -> SF, Final
        if (totalRounds === 2) {
            return ['Semifinals', 'Final'];
        }
        // Generic fallback
        const labels = [];
        for (let i = 0; i < totalRounds; i++) {
            labels.push(`Round ${i + 1}`);
        }
        return labels;
    }

    private getMatchPosition(
        round: number,
        position: number,
        totalRounds: number
    ): { x: number; y: number } {
        const x = this.PADDING + round * (this.MATCH_WIDTH + this.ROUND_GAP);

        const baseY = 80;
        const totalHeight = this.canvas!.height - baseY - this.PADDING;

        // Calculate matches in this round: first round has most, halves each round
        const matchesInFirstRound = Math.pow(2, totalRounds - 1);
        const matchesInThisRound = matchesInFirstRound / Math.pow(2, round);

        const spacing = totalHeight / matchesInThisRound;
        const y = baseY + spacing * position + spacing / 2 - this.MATCH_HEIGHT / 2;

        return { x, y };
    }

    private drawMatch(
        match: Match,
        round: number,
        position: number,
        totalRounds: number,
        isCurrentMatch: boolean
    ): void {
        if (!this.renderingContext) return;

        const pos = this.getMatchPosition(round, position, totalRounds);

        // Match box background
        if (isCurrentMatch) {
            this.renderingContext.fillStyle = '#3a5a3a';
            this.renderingContext.strokeStyle = '#4CAF50';
        } else if (match.winner) {
            this.renderingContext.fillStyle = '#2a2a2a';
            this.renderingContext.strokeStyle = '#444444';
        } else {
            this.renderingContext.fillStyle = '#2a2a2a';
            this.renderingContext.strokeStyle = '#555555';
        }

        this.renderingContext.lineWidth = 2;
        this.renderingContext.beginPath();
        this.renderingContext.roundRect(pos.x, pos.y, this.MATCH_WIDTH, this.MATCH_HEIGHT, 5);
        this.renderingContext.fill();
        this.renderingContext.stroke();

        // Draw player slots
        this.drawPlayerSlot(pos.x, pos.y, match.player1, match.winner === match.player1);
        this.drawPlayerSlot(pos.x, pos.y + this.MATCH_HEIGHT / 2, match.player2, match.winner === match.player2);

        // Divider line
        this.renderingContext.strokeStyle = '#444444';
        this.renderingContext.lineWidth = 1;
        this.renderingContext.beginPath();
        this.renderingContext.moveTo(pos.x + 5, pos.y + this.MATCH_HEIGHT / 2);
        this.renderingContext.lineTo(pos.x + this.MATCH_WIDTH - 5, pos.y + this.MATCH_HEIGHT / 2);
        this.renderingContext.stroke();
    }

    private drawPlayerSlot(
        x: number,
        y: number,
        playerName: string | null,
        isWinner: boolean
    ): void {
        if (!this.renderingContext) return;

        const slotHeight = this.MATCH_HEIGHT / 2;

        this.renderingContext.fillStyle = isWinner ? '#4CAF50' : (playerName ? '#ffffff' : '#666666');
        this.renderingContext.font = isWinner ? 'bold 12px Arial' : '12px Arial';
        this.renderingContext.textAlign = 'left';
        this.renderingContext.textBaseline = 'middle';
        this.renderingContext.fillText(
            playerName || 'TBD',
            x + 10,
            y + slotHeight / 2
        );
    }

    private drawConnectorLines(rounds: Match[][]): void {
        if (!this.renderingContext) return;

        this.renderingContext.strokeStyle = '#444444';
        this.renderingContext.lineWidth = 2;

        const totalRounds = rounds.length;

        // Connect each round to the next
        for (let round = 0; round < totalRounds - 1; round++) {
            const matchesInRound = rounds[round].length;

            for (let i = 0; i < matchesInRound; i += 2) {
                const upper = this.getMatchPosition(round, i, totalRounds);
                const lower = this.getMatchPosition(round, i + 1, totalRounds);
                const target = this.getMatchPosition(round + 1, Math.floor(i / 2), totalRounds);

                this.drawConnector(upper, lower, target);
            }
        }

    }

    private drawConnector(
        upper: { x: number; y: number },
        lower: { x: number; y: number },
        target: { x: number; y: number }
    ): void {
        if (!this.renderingContext) return;

        const midX = upper.x + this.MATCH_WIDTH + this.ROUND_GAP / 2;

        // Draw the complete bracket connector in one path
        this.renderingContext.beginPath();

        // Upper match horizontal line to midpoint
        this.renderingContext.moveTo(upper.x + this.MATCH_WIDTH, upper.y + this.MATCH_HEIGHT / 2);
        this.renderingContext.lineTo(midX, upper.y + this.MATCH_HEIGHT / 2);

        // Vertical line from upper to lower
        this.renderingContext.lineTo(midX, lower.y + this.MATCH_HEIGHT / 2);

        // Lower match horizontal line from midpoint to match
        this.renderingContext.moveTo(lower.x + this.MATCH_WIDTH, lower.y + this.MATCH_HEIGHT / 2);
        this.renderingContext.lineTo(midX, lower.y + this.MATCH_HEIGHT / 2);

        // Vertical line from midpoint to target
        this.renderingContext.moveTo(midX, upper.y + this.MATCH_HEIGHT / 2);
        this.renderingContext.lineTo(midX, target.y + this.MATCH_HEIGHT / 2);

        // Horizontal line to target match
        this.renderingContext.lineTo(target.x, target.y + this.MATCH_HEIGHT / 2);

        this.renderingContext.stroke();
    }

    // Helper to create initial tournament state
    public static createInitialState(players: string[]): TournamentState {
        const numPlayers = players.length;

        if (numPlayers !== 4 && numPlayers !== 8) {
            throw new Error('Tournament requires 4 or 8 players');
        }

        const numRounds = Math.log2(numPlayers);
        const rounds: Match[][] = [];

        // First round with players
        const firstRound: Match[] = [];
        for (let i = 0; i < numPlayers; i += 2) {
            firstRound.push({
                player1: players[i],
                player2: players[i + 1],
                winner: null
            });
        }
        rounds.push(firstRound);

        // Remaining rounds (empty)
        for (let r = 1; r < numRounds; r++) {
            const matchesInRound = numPlayers / Math.pow(2, r + 1);
            const round: Match[] = [];
            for (let i = 0; i < matchesInRound; i++) {
                round.push({ player1: null, player2: null, winner: null });
            }
            rounds.push(round);
        }

        return {
            isRunning: false,
            winner: null,
            rounds,
            players,
            currentRound: 0
        };
    }

    public showSearching(current: number): void {
        if (!this.renderingContext || !this.canvas) return;
		const total = 8;
        this.clear();

        this.renderingContext.fillStyle = '#ffffff';
        this.renderingContext.font = 'bold 48px Arial';
        this.renderingContext.textAlign = 'center';
        this.renderingContext.textBaseline = 'middle';

        const text = `Searching for players... ${current}/${total}`;
        this.renderingContext.fillText(
            text,
            this.canvas.width / 2,
            this.canvas.height / 2
        );
    }

	public showCountdown(
		state: TournamentState,
		callback: () => void,
		count: number = 30
	): void {
        if (!this.renderingContext || !this.canvas) return;
        this.cancelCountdown();
        const showNumber = () => {
            this.render(state);

            // Draw countdown overlay with semi-transparent background
            const message = count > 0 ? `Starting in ${count}` : 'START!';

            this.renderingContext!.font = 'bold 36px Arial';
            this.renderingContext!.textAlign = 'center';
            this.renderingContext!.textBaseline = 'middle';

            const textMetrics = this.renderingContext!.measureText(message);
            const textWidth = textMetrics.width + 40;
            const textHeight = 50;
            const x = this.canvas!.width / 2;
            const y = 100;

            // Draw background box
            this.renderingContext!.fillStyle = 'rgba(0, 0, 0, 0.8)';
            this.renderingContext!.beginPath();
            this.renderingContext!.roundRect(
                x - textWidth / 2,
                y - textHeight / 2,
                textWidth,
                textHeight,
                10
            );
            this.renderingContext!.fill();

            // Draw text
            this.renderingContext!.fillStyle = '#FFD700';
            this.renderingContext!.fillText(message, x, y);

            count--;
            if (count >= 0) {
                this.countdownTimeoutId = setTimeout(showNumber, 1000);
            } else {
                this.countdownTimeoutId = setTimeout(() => {
                    this.countdownTimeoutId = null;
                    callback();
                }, 500);
            }
        };
        showNumber();
    }

    public cancelCountdown(): void {
        if (this.countdownTimeoutId !== null) {
            clearTimeout(this.countdownTimeoutId);
            this.countdownTimeoutId = null;
        }
    }

    public show(): void {
        const container = document.getElementById('tournamentContainer');
		const exit_tButton = document.getElementById('exitTournamentButton');
        container?.classList.remove('hidden');
		exit_tButton?.classList.remove('hidden');
		logger.log('Tournament canvas visible');
    }

    public hide(): void {
        const container = document.getElementById('tournamentContainer');
		const exit_tButton = document.getElementById('exitTournamentButton');
        container?.classList.add('hidden');
		exit_tButton?.classList.add('hidden');
		logger.log('Tournament canvas hidden');
    }
}