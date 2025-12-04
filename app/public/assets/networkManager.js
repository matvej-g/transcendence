export class NetworkManager {
    constructor(canvas) {
        this.socket = null;
        this.roomId = null;
        this.playerRole = null;
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
                //console.log('GameState recived:', message.data);
                this.canvas.render(message.data);
                break;
            case 'gameOver':
                this.canvas.drawWinner(message.data.winner);
                break;
            case 'opponentDisconnected':
                console.log('Opponent disconnected:', message.data);
                this.canvas.drawWinner(message.data.winner);
                break;
        }
    }
    onError(error) {
        console.error('WebSocket error:', error);
    }
    onClose() {
        console.log('Connection closed');
        this.canvas.hide();
    }
    send(data) {
        if (this.socket?.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify(data));
        }
    }
    disconnect() {
        this.socket?.close();
    }
    setupInputHandlers() {
        // Keydown - Spieler drückt Taste
        document.addEventListener('keydown', (e) => {
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
                    data: { direction }
                });
            }
        });
    }
}
