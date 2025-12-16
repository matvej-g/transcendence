// Make this file a module so 'declare global' works
export {};

import { GameCanvas } from './gameCanvas.js';
import { NetworkManager } from './networkManager.js';

// Game Manager Class
class GameManager {
    private gameModeMenu: HTMLElement | null;
    private playLocalButton: HTMLElement | null;
    private playRemoteButton: HTMLElement | null;
    private exitGameButton: HTMLElement | null;
    
    private gameCanvas: GameCanvas;
    private networkManager: NetworkManager;
    private keyState: {[key: string]: boolean} = {}; 

    //document.getElementById('') searches for an Element inside the HTML  
    constructor() {
        this.gameModeMenu = document.getElementById('gameModeMenu');
        this.playLocalButton = document.getElementById('playLocalButton');
        this.playRemoteButton = document.getElementById('playRemoteButton');
        this.exitGameButton = document.getElementById('exitGameButton');
        this.gameCanvas = new GameCanvas();
        this.networkManager = new NetworkManager(this.gameCanvas);

        this.initEventListeners();
    }
    
    private initEventListeners(): void {
        this.playLocalButton?.addEventListener('click', () => this.startLocalGame());
        this.playRemoteButton?.addEventListener('click', () => this.startRemoteGame());
        this.exitGameButton?.addEventListener('click', () => this.exitGame());
        
        //Keyboard events
        window.addEventListener('keydown', (e) => this.keyState[e.key] = true);
        window.addEventListener('keyup', (e) => this.keyState[e.key] = false);
    }

    private startLocalGame(): void {
        console.log('Starting local game...');
        this.gameModeMenu?.classList.add('hidden');
        this.networkManager.connect('ws://localhost:8080/ws', 'local');
    }

    private startRemoteGame(): void {
        console.log('Starting remote game...');
        this.gameModeMenu?.classList.add('hidden');
        this.networkManager.connect('ws://localhost:8080/ws', 'remote');
    }

    private exitGame(): void {
        console.log('Exit game, back to GameModeSelection');

        this.networkManager.disconnect();
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