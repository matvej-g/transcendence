function testGame() {
    // Simulate API call
    const mockResponse = {
        status: 'success',
        message: 'Game initialized',
        gameState: {
            score: 0,
            level: 1
        }
    };

    document.getElementById('game-status').innerHTML =
        `<pre>Status: ${mockResponse.status}<br>Message: ${mockResponse.message}</pre>`;
}

// Simulate game state updates
setInterval(() => {
    const mockGameState = {
        score: Math.floor(Math.random() * 100),
        level: 1
    };
    document.getElementById('game-status').innerHTML +=
        `<p>Simulated Game State: Score: ${mockGameState.score}</p>`;
}, 2000);
