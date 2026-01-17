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
    private joinTournamentButton: HTMLElement | null;
    private hostTournamentButton: HTMLElement | null;
    private exitGameButton: HTMLElement | null;
    private exitTournamentButton: HTMLElement | null;
    
    private gameCanvas: GameCanvas;
    private tournamentCanvas: TournamentCanvas;
    private networkManager: NetworkManager;
    private keyState: {[key: string]: boolean} = {}; 

    //document.getElementById('') searches for an Element inside the HTML  
    constructor() {
        this.gameModeMenu = document.getElementById('gameModeMenu');
        this.playLocalButton = document.getElementById('playLocalButton');
        this.playRemoteButton = document.getElementById('playRemoteButton');
        this.joinTournamentButton = document.getElementById('joinTournamentButton');
        this.hostTournamentButton = document.getElementById('hostTournamentButton');
        this.exitGameButton = document.getElementById('exitGameButton');
        this.exitTournamentButton = document.getElementById('exitTournamentButton');
        this.gameCanvas = new GameCanvas();
        this.tournamentCanvas = new TournamentCanvas();
        this.networkManager = new NetworkManager(this.gameCanvas, this.tournamentCanvas);

        this.initEventListeners();
    }
    
    private initEventListeners(): void {
        this.playLocalButton?.addEventListener('click', () => this.startLocalGame());
        this.playRemoteButton?.addEventListener('click', () => this.startRemoteGame());
        this.joinTournamentButton?.addEventListener('click', () => this.joinTournament());
        this.hostTournamentButton?.addEventListener('click', () => this.hostTournament());
        this.exitGameButton?.addEventListener('click', () => this.exitGame());
        this.exitTournamentButton?.addEventListener('click', () => this.exitTournament());

        window.addEventListener('hashchange', () => {
            if (window.location.hash === '#game') {
                // Zeige GameMode Menu wieder an
                this.gameModeMenu?.classList.remove('hidden');
                this.gameCanvas.hide();
            } else if (window.location.hash !== '#game') {
                // User hat #game verlassen
                this.gameModeMenu?.classList.remove('hidden');
                this.gameCanvas.hide();
            }
        });
        //Keyboard events
        window.addEventListener('keydown', (e) => this.keyState[e.key] = true);
        window.addEventListener('keyup', (e) => this.keyState[e.key] = false);
    }

    private startLocalGame(): void {
        console.log('Starting local game...');
        this.gameModeMenu?.classList.add('hidden');
        const userId = getCurrentUserIdNumber() || 1; //need cahnge later
        console.log(userId);
        this.networkManager.connect('ws://localhost:8080/ws', 'local', userId);
    }

    private startRemoteGame(): void {
        console.log('Starting remote game...');
        this.gameModeMenu?.classList.add('hidden');
        const userId = getCurrentUserIdNumber() || 1; //need change later
        console.log(userId);
        this.networkManager.connect('ws://localhost:8080/ws', 'remote', userId);
    }

    private joinTournament(): void {
        console.log('Join Tournament...');
        this.gameModeMenu?.classList.add('hidden');
        const userId = getCurrentUserIdNumber() || 1; //need change later
        console.log(userId);
        this.networkManager.connect('ws://localhost:8080/ws', 'joinT', userId);
    }

    private hostTournament(): void {
        console.log('Host Tournament...');
        this.gameModeMenu?.classList.add('hidden');
        const userId = getCurrentUserIdNumber() || 1; //need change later
        console.log(userId);
        this.networkManager.connect('ws://localhost:8080/ws', 'hostT', userId);
    }

    private exitGame(): void {
        console.log('Exit game, back to GameModeSelection');

        this.networkManager.disconnect();
        this.gameCanvas.hide();
        this.gameModeMenu?.classList.remove('hidden');
    }

    private exitTournament(): void {
        console.log('Exit Tournament, back to GameModeSelection');
        this.tournamentCanvas.hide();
        this.gameCanvas.hide();
        this.gameModeMenu?.classList.remove('hidden');
    }

    public getInputState() {
        return this.keyState;
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new GameManager();
});