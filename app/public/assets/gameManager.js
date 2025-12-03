import { GameCanvas } from './gameCanvas.js';
import { GameEngine } from './gameEngine.js';
import { NetworkManager } from './networkManager.js';
// Game Manager Class
class GameManager {
    //document.getElementById('') searches for an Element inside the HTML  
    constructor() {
        this.gameEngine = null;
        this.keyState = {};
        this.mainMenu = document.getElementById('mainMenu');
        this.gameModeMenu = document.getElementById('gameModeMenu');
        this.playButton = document.getElementById('playButton');
        this.playLocalButton = document.getElementById('playLocalButton');
        this.playRemoteButton = document.getElementById('playRemoteButton');
        this.backButton = document.getElementById('backButton');
        this.exitGameButton = document.getElementById('exitGameButton');
        this.gameCanvas = new GameCanvas();
        this.networkManager = new NetworkManager(this.gameCanvas);
        this.initEventListeners();
        this.loadInitialData();
    }
    initEventListeners() {
        this.playButton?.addEventListener('click', () => this.showGameModeSelection());
        this.backButton?.addEventListener('click', () => this.showMainMenu());
        this.playLocalButton?.addEventListener('click', () => this.startLocalGame());
        this.playRemoteButton?.addEventListener('click', () => this.startRemoteGame());
        this.exitGameButton?.addEventListener('click', () => this.exitGame());
        //Keyboard events
        window.addEventListener('keydown', (e) => this.keyState[e.key] = true);
        window.addEventListener('keyup', (e) => this.keyState[e.key] = false);
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
        this.gameEngine = new GameEngine(this.gameCanvas);
        this.gameEngine.setInputHandler(() => this.keyState);
        this.gameEngine.start();
    }
    startRemoteGame() {
        console.log('Starting remote game...');
        this.gameModeMenu?.classList.add('hidden');
        this.networkManager.connect('ws://localhost:8080/ws');
    }
    exitGame() {
        console.log('Exit game, back to GameModeSelection');
        if (this.gameEngine) {
            this.gameEngine.stop();
            this.gameEngine = null;
        }
        this.gameCanvas.hide();
        this.gameModeMenu?.classList.remove('hidden');
    }
    getInputState() {
        return this.keyState;
    }
}
// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new GameManager();
});
