// Types
interface InitialData {
    gameMode: string | null;
    timestamp: number;
}

declare global {
    interface Window {
        initialData: InitialData;
    }
}

// Make this file a module so 'declare global' works
export {};

import { GameCanvas } from './gameCanvas.js';
import { GameEngine } from './gameEngine.js';

// Game Manager Class
class GameManager {
    private mainMenu: HTMLElement | null;
    private gameModeMenu: HTMLElement | null;
    private playButton: HTMLElement | null;
    private playLocalButton: HTMLElement | null;
    private playRemoteButton: HTMLElement | null;
    private backButton: HTMLElement | null;
    private exitGameButton: HTMLElement | null;
    
    private gameCanvas: GameCanvas;
    private gameEngine: GameEngine | null = null;
    private keyState: {[key: string]: boolean} = {}; 
    
    private socket: WebSocket | null = null;

    //document.getElementById('') searches for an Element inside the HTML  
    constructor() {
        this.mainMenu = document.getElementById('mainMenu');
        this.gameModeMenu = document.getElementById('gameModeMenu');
        this.playButton = document.getElementById('playButton');
        this.playLocalButton = document.getElementById('playLocalButton');
        this.playRemoteButton = document.getElementById('playRemoteButton');
        this.backButton = document.getElementById('backButton');
        this.exitGameButton = document.getElementById('exitGameButton');
        
        this.gameCanvas = new GameCanvas();
        
        this.initEventListeners();
        this.loadInitialData();
    }
    
    private initEventListeners(): void {
        this.playButton?.addEventListener('click', () => this.showGameModeSelection());
        this.backButton?.addEventListener('click', () => this.showMainMenu());
        this.playLocalButton?.addEventListener('click', () => this.startLocalGame());
        this.playRemoteButton?.addEventListener('click', () => this.startRemoteGame());
        this.exitGameButton?.addEventListener('click', () => this.exitGame());
        
        //Keyboard events
        window.addEventListener('keydown', (e) => this.keyState[e.key] = true);
        window.addEventListener('keyup', (e) => this.keyState[e.key] = false);
    }

    private loadInitialData(): void {
        const data = window.initialData;
        console.log('SSR Data loaded:', data);
    }

    private showGameModeSelection(): void {
        this.mainMenu?.classList.add('hidden');
        this.gameModeMenu?.classList.remove('hidden');
    }

    private showMainMenu(): void {
        this.gameModeMenu?.classList.add('hidden');
        this.mainMenu?.classList.remove('hidden');
    }

    private startLocalGame(): void {
        console.log('Starting local game...');
        this.gameModeMenu?.classList.add('hidden');
        this.gameCanvas.show();
        this.gameEngine = new GameEngine(this.gameCanvas);
        this.gameEngine.setInputHandler(() => this.keyState);
        this.gameEngine.start();
    }

    private startRemoteGame(): void {
        console.log('Starting remote game...');
        this.gameModeMenu?.classList.add('hidden');
        this.gameCanvas.show();
        this.connectToServer('ws://localhost:8080/ws');
    }

    private exitGame(): void {
        console.log('Exit game, back to GameModeSelection');

        if (this.gameEngine) {
            this.gameEngine.stop();
            this.gameEngine = null;
        }

        this.gameCanvas.hide();
        this.gameModeMenu?.classList.remove('hidden');
    }

    public getInputState() {
        return this.keyState;
    }

    private connectToServer(url: string): void {
        console.log(`Connecting to ${url}...`);
        
        try {
            this.socket = new WebSocket(url);
            this.setupEventHandlers();
        } catch (error) {
            console.error('Failed to connect:', error);
        }
    }

    // Event handler for websockets
    private setupEventHandlers(): void {
        if (!this.socket) return;

        this.socket.onopen = () => {
            console.log('Connected to server!');
            
            this.socket?.send(JSON.stringify({
                type: 'join',
                data: { gameMode: 'remote' }
            }));
        };

        this.socket.onmessage = (event) => {
            const message = JSON.parse(event.data);
            console.log('Message from server:', message);
        };

        this.socket.onerror = (error) => {
            console.error('WebSocket error:', error);
        };

        this.socket.onclose = () => {
            console.log('Connection closed');
        };
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new GameManager();
});