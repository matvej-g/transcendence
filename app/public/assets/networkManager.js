export class NetworkManager {
    constructor(canvas) {
        this.socket = null;
        this.roomId = null;
        this.playerRole = null;
        this.currentGameState = null;
        this.keydownHandler = null;
        this.keyupHandler = null;
        this.canvas = canvas;
    }
    connect(url) {
        console.log(`Connecting to ${url}...`);
        this.canvas.showSearching();
        this.socket = new WebSocket(url);
        this.socket.onopen = () => this.onConnected();
        this.socket.onmessage = (event) => this.onMessage(event);
        this.socket.onclose = () => this.onClose();
        this.socket.onerror = (error) => this.onError(error);
    }
    onConnected() {
        console.log('Connected to server!');
        this.send({
            type: 'join',
            data: { gameMode: 'remote' }
        });
    }
    onMessage(event) {
        const message = JSON.parse(event.data);
        switch (message.type) {
            case 'connected':
                console.log('Server confirmed:', message.data);
                this.canvas.show();
                break;
            case 'matchFound':
                console.log('Match found!');
                this.canvas.clear();
                this.setupInputHandlers();
                break;
            case 'gameState':
                //console.log('GameState received:', message.data);
                this.canvas.render(message.data);
                break;
            case 'gameOver':
                console.log('Winner received:', message.data);
                this.canvas.drawWinner(message.data.winner);
                this.removeInputHandlers();
                break;
            case 'opponentDisconnected':
                console.log('Opponent disconnected:', message.data);
                this.canvas.drawWinner(message.data.winner);
                this.removeInputHandlers();
                break;
        }
    }
    onError(error) {
        console.error('WebSocket error:', error);
    }
    onClose() {
        console.log('Connection closed');
        this.canvas.hide();
        this.removeInputHandlers();
    }
    send(data) {
        if (this.socket?.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify(data));
        }
    }
    disconnect() {
        this.removeInputHandlers();
        this.socket?.close();
    }
    setupInputHandlers() {
        this.removeInputHandlers();
        const pressedKeys = new Set();
        this.keydownHandler = (e) => {
            // Prevent scrolling for arrow keys and WASD
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
                e.preventDefault();
            }
            //prevent repeated keydown events when holding key
            if (pressedKeys.has(e.key))
                return;
            pressedKeys.add(e.key);
            let direction = '';
            if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
                direction = 'up';
            }
            else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
                direction = 'down';
            }
            if (direction) {
                this.send({
                    type: 'input',
                    data: {
                        action: 'keydown',
                        direction
                    }
                });
            }
        };
        this.keyupHandler = (e) => {
            // Prevent scrolling for arrow keys and WASD
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
                e.preventDefault();
            }
            pressedKeys.delete(e.key);
            let direction = '';
            if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
                direction = 'up';
            }
            else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
                direction = 'down';
            }
            if (direction) {
                this.send({
                    type: 'input',
                    data: {
                        action: 'keyup',
                        direction
                    }
                });
            }
        };
        document.addEventListener('keydown', this.keydownHandler);
        document.addEventListener('keyup', this.keyupHandler);
    }
    removeInputHandlers() {
        if (this.keydownHandler) {
            document.removeEventListener('keydown', this.keydownHandler);
            this.keydownHandler = null;
        }
        if (this.keyupHandler) {
            document.removeEventListener('keyup', this.keyupHandler);
            this.keyupHandler = null;
        }
    }
}
