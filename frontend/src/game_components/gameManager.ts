// Make this file a module so 'declare global' works
export {};

import { GameCanvas } from './gameCanvas.js';
import { TournamentCanvas } from './tournamentCanvas.js';
import { NetworkManager } from './networkManager.js';
import { getCurrentUserIdNumber } from '../components/auth/authUtils.js';

// Game Manager Class
class GameManager {
    private gameModeMenu: HTMLElement | null;
    private playLocalButton: HTMLElement | null;
    private playRemoteButton: HTMLElement | null;
    private playTournamentButton: HTMLElement | null;
    private exitGameButton: HTMLElement | null;
    private exitTournamentButton: HTMLElement | null;
    
    private gameCanvas: GameCanvas;
    private tournamentCanvas: TournamentCanvas;
    private networkManager: NetworkManager;
    private keyState: {[key: string]: boolean} = {};
    private isGameActive: boolean = false; 

    //document.getElementById('') searches for an Element inside the HTML  
    constructor() {
        this.gameModeMenu = document.getElementById('gameModeMenu');
        this.playLocalButton = document.getElementById('playLocalButton');
        this.playRemoteButton = document.getElementById('playRemoteButton');
        this.playTournamentButton = document.getElementById('playTournamentButton');
        this.exitGameButton = document.getElementById('exitGameButton');
        this.exitTournamentButton = document.getElementById('exitTournamentButton');
        this.gameCanvas = new GameCanvas();
        this.tournamentCanvas = new TournamentCanvas('tournamentCanvas');
        this.networkManager = new NetworkManager(this.gameCanvas, this.tournamentCanvas);

        this.initEventListeners();
    }
    
    private initEventListeners(): void {
        this.playLocalButton?.addEventListener('click', () => this.startLocalGame());
        this.playRemoteButton?.addEventListener('click', () => this.startRemoteGame());
        this.playTournamentButton?.addEventListener('click', () => this.startTournament());
        this.exitGameButton?.addEventListener('click', () => this.exitGame());
        this.exitTournamentButton?.addEventListener('click', () => this.exitTournament());

        const handleHashChange = () => {
            if (window.location.hash === '#game') {
                if (!this.isGameActive) {
                    this.gameModeMenu?.classList.remove('hidden');
                }
            }
        };
        window.addEventListener('hashchange', handleHashChange);
        handleHashChange();

        //Keyboard events
        window.addEventListener('keydown', (e) => this.keyState[e.key] = true);
        window.addEventListener('keyup', (e) => this.keyState[e.key] = false);
    }

	private getWebSocketUrl(): string {
		const { protocol, host } = window.location;
		const wsProtocol = protocol === 'https:' ? 'wss:' : 'ws:';
		return `${wsProtocol}//${host}/ws`;
	}

    private startLocalGame(): void {
        console.log('Starting local game...');
        this.gameModeMenu?.classList.add('hidden');
        this.isGameActive = true;
        const userId = getCurrentUserIdNumber() || 1; //need cahnge later
        console.log(userId);
		this.networkManager.connect(
			this.getWebSocketUrl(),
			'local',
			userId
		);
    }

    private startRemoteGame(): void {
        console.log('Starting remote game...');
        this.gameModeMenu?.classList.add('hidden');
        this.isGameActive = true;
        const userId = getCurrentUserIdNumber() || 1; //need change later
        console.log(userId);
		this.networkManager.connect(
			this.getWebSocketUrl(),
			'remote',
			userId
		);
    }

    private startTournament(): void {
        console.log('Join Tournament...');
        this.gameModeMenu?.classList.add('hidden');
        this.isGameActive = true;
        const userId = getCurrentUserIdNumber() || 1; //need change later
        console.log(userId);
        this.networkManager.connect(
			this.getWebSocketUrl(),
			'joinT',
			userId
		);
    }

    public startInviteGame(inviteCode: string): void {
        console.log('Starting invite game with code:', inviteCode);
        this.gameModeMenu?.classList.add('hidden');
        this.isGameActive = true;
        const userId = getCurrentUserIdNumber() || 1;
        this.networkManager.connect(
			this.getWebSocketUrl(),
			'invite',
			userId,
            inviteCode
		);
    }


    private exitGame(): void {
        console.log('Exit game, back to GameModeSelection');

        this.networkManager.disconnect();
        this.gameCanvas.hide();
        this.isGameActive = false;
        this.gameModeMenu?.classList.remove('hidden');
    }

    private exitTournament(): void {
        console.log('Exit Tournament, back to GameModeSelection');
        this.networkManager.disconnect();
        this.tournamentCanvas.hide();
        this.gameCanvas.hide();
        this.isGameActive = false;
        this.gameModeMenu?.classList.remove('hidden');
    }

    public getInputState() {
        return this.keyState;
    }
}

// Initialize when DOM is ready
export const gameManager = new GameManager();
// document.addEventListener('DOMContentLoaded', () => {
//     new GameManager();
// });