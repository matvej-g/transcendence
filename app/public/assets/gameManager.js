import { GameCanvas } from './gameCanvas.js';
// Game Manager Class
class GameManager {
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
    initEventListeners() {
        this.playButton?.addEventListener('click', () => this.showGameModeSelection());
        this.backButton?.addEventListener('click', () => this.showMainMenu());
        this.playLocalButton?.addEventListener('click', () => this.startLocalGame());
        this.playRemoteButton?.addEventListener('click', () => this.startRemoteGame());
        this.exitGameButton?.addEventListener('click', () => this.exitGame());
    }
    loadInitialData() {
        const data = window.initialData;
        console.log('SSR Data loaded:', data);
    }
    showGameModeSelection() {
        this.mainMenu?.classList.add('hidden');
        this.gameModeMenu?.classList.remove('hidden');
    }
    showMainMenu() {
        this.gameModeMenu?.classList.add('hidden');
        this.mainMenu?.classList.remove('hidden');
    }
    startLocalGame() {
        console.log('Starting local game...');
        this.gameModeMenu?.classList.add('hidden');
        this.gameCanvas.show();
    }
    startRemoteGame() {
        console.log('Starting remote game...');
        // TODO: Implementiere Remote Game Logic
        alert('Starting Remote Game vs Player!');
    }
    exitGame() {
        console.log('Exit game, back to GameModeSelection');
        this.gameCanvas.hide();
        this.gameModeMenu?.classList.remove('hidden');
    }
}
// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new GameManager();
});
