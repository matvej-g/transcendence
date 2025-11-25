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
    }

    private startRemoteGame(): void {
        console.log('Starting remote game...');
        // TODO: Implementiere Remote Game Logic
        alert('Starting Remote Game vs Player!');
    }

    private exitGame(): void {
        console.log('Exit game, back to GameModeSelection');
        this.gameCanvas.hide();
        this.gameModeMenu?.classList.remove('hidden');
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new GameManager();
});