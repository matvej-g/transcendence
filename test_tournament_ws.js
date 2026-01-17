const WebSocket = require('ws');

const WS_URL = 'ws://localhost:8080/ws';
const NUM_CLIENTS = 8;
const clients = [];

for (let i = 0; i < NUM_CLIENTS; i++) {
  const ws = new WebSocket(WS_URL);
  ws.on('open', () => {
    // Simulate login/join tournament message
    ws.send(JSON.stringify({ action: 'joinT', userID: i + 1 }));
    console.log(`Client ${i + 1} connected and sent joinTournament`);
  });
  ws.on('message', (msg) => {
    console.log(`Client ${i + 1} received: ${msg}`);
  });
  ws.on('close', () => {
    console.log(`Client ${i + 1} disconnected`);
  });
  clients.push(ws);
}