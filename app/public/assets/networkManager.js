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
                break;
            case 'matchFound':
                console.log('Match found!');
                break;
            case 'gameState':
                this.canvas.render(message.data);
                break;
            case 'gameOver':
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
}
