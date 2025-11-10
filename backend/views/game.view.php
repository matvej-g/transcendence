<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <script src="https://cdn.tailwindcss.com"></script> <!-- injects Tailwind CSS utilities at runtime -->
  <title>Game</title>
  <link rel="stylesheet" href="/style.css" />
</head>
<body>
  <nav class="navbar">
    <div class="nav-logo">MySite</div>
    <ul class="nav-links">
      <li><a href="/">Home</a></li>
      <li><a href="/about">About</a></li>
      <li><a href="/contact">Contact</a></li>
      <li><a href="/game" class="active">Game</a></li>
    </ul>
  </nav>

  <main>
    <h1>Welcome to MySite</h1>
    <p>This is the home page of your simple static site.</p>
    <p>
      <a id="play-button"
        href="#"
        class="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-4 py-2 rounded-lg shadow-md transition-transform active:scale-95 focus:outline-none focus:ring-2 focus:ring-emerald-300"
        role="button" aria-label="Play here">
        <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M4 2v20l18-10L4 2z"/></svg>
        Play here
        </a>
    </p>
  </main>
    <div id="game-window" class="hidden fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center">
      <div class="w-[800px] h-[400px] bg-gray-800 rounded-lg relative">
        <button id="close-game" class="absolute top-2 right-2 text-white">✕</button>
        <canvas id="gameCanvas" class="w-full h-full" tabindex="0" aria-label="Game canvas"></canvas>
        <div class="mt-4 text-sm text-gray-300">
            Controls: Left Player - W / S, Right Player - ↑ / ↓. Press Esc to close.
        </div>
      </div>
    </div>
  <script>
    const playButton = document.getElementById('play-button');
    const closeButton = document.getElementById('close-game');
    const gameWindow = document.getElementById('game-window');
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    
    const ballSize = 18;
    const paddleHeight = 80;
    const speed = 5;

    let paddleLeftY = (canvas.height - paddleHeight) / 2;
    let paddleRightY = (canvas.height - paddleHeight) / 2;
    let ballX = (canvas.width / ballSize) / 2;
    let ballY = (canvas.height / ballSize) / 2;
    // game state helpers
    let running = false;
    let animationFrameId = null;
    let ballSpeedX = 4;
    let ballSpeedY = 4;

    function resetBall() {
        // center Ball
        ballX = (canvas.width - ballSize) / 2;
        ballY = (canvas.height - ballSize) / 2;
        // center Paddles
        paddleLeftY = (canvas.height - paddleHeight) / 2;
        paddleRightY = (canvas.height - paddleHeight) / 2;
        // optional: set initial velocity/direction
    }

    function drawGame() {
        ctx.fillStyle = '#111827';
        ctx.clearRect(0, 0, canvas.width, canvas.height); // clear canvas
        ctx.fillStyle = '#ffffffff';

        // center dashed line
        const dashH = 12;
        for (let y = 10; y < canvas.height - 10; y += dashH * 2) {
            ctx.fillRect(canvas.width/2 - 2, y, 4, dashH);
        }
        // paddle color
        ctx.fillStyle = '#10b981';
        // left paddle
        ctx.fillRect(20, paddleLeftY, 10, paddleHeight);
        // right paddle
        ctx.fillRect(770, paddleRightY, 10, paddleHeight);
        // ball
        ctx.fillStyle = '#c2c521ff';
        ctx.fillRect(ballX, ballY, ballSize, ballSize);
        ctx.lineWidth = 2; // set outline
        ctx.strokeStyle = '#00000088';
        ctx.strokeRect(ballX + ctx.lineWidth/2, ballY + ctx.lineWidth/2, ballSize - ctx.lineWidth, ballSize - ctx.lineWidth);
    }

    function gameLoop() {
        if (!running) return;
        update();
        drawGame();
        animationFrameId = requestAnimationFrame(gameLoop); // run 60 times per second
    }

    // Handle key presses
    const keys = {};
    window.addEventListener('keydown', (e) =>{
        keys[e.key] = true;
        if (['ArrowUp','ArrowDown',' '].includes(e.key)) e.preventDefault(); // prevent scrolling
    });
    window.addEventListener('keyup', (e) =>{
        keys[e.key] = false;
    });
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && running) {
            closeGame();
        }
    });

    function update() {
        // left paddle
        if (keys['w'] || keys['W']) paddleLeftY -= speed;
        if (keys['s'] || keys['S']) paddleLeftY += speed;

        // right paddle
        if (keys['ArrowUp']) paddleRightY -= speed;
        if (keys['ArrowDown']) paddleRightY += speed;

        // clamp positions to canvas size
        paddleLeftY = Math.max(0, Math.min(canvas.height - paddleHeight, paddleLeftY));
        paddleRightY = Math.max(0, Math.min(canvas.height - paddleHeight, paddleRightY));
    }

    // Countdown before game starts
    async function startCountdown() {
        const seq = ['3', '2', '1', 'GO!'];
        for (let i = 0; i < seq.length; i++) {
            // larger text for numbers, slightly smaller for GO!
            const size = (seq[i] === 'GO!') ? 72 : 140;
            drawGame();               // draw current frame behind text
            drawCenteredText(seq[i], size);
            // wait for the GO!
            await new Promise(r => setTimeout(r, (seq[i] === 'GO!') ? 600 : 1000));
        }
        // redraw game to clear text
        drawGame();
    }

    // Draw centered text for Countdown
    function drawCenteredText(text, size = 120, color = '#ffffff') {
        ctx.save();
        // dim background
        ctx.fillStyle = 'rgba(0,0,0,0.55)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // text
        ctx.fillStyle = color;
        ctx.font = `bold ${size}px system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = 'rgba(0,0,0,0.6)';
        ctx.shadowBlur = 10;
        ctx.fillText(text, canvas.width / 2, canvas.height / 2);
        ctx.restore();
    }

    // Open game
    playButton.addEventListener('click', async(e) => {
        e.preventDefault();
        if (running) return;
        gameWindow.classList.remove('hidden');
        canvas.width = 800;
        canvas.height = 400;
        resetBall();
        drawGame();
        canvas.focus();

        await startCountdown();
        running = true;
        gameLoop();
    });

    // Close game
    function closeGame() {
        gameWindow.classList.add('hidden');
        running = false;
        if (animationFrameId) { cancelAnimationFrame(animationFrameId); animationFrameId = null; }
    }
    closeButton.addEventListener('click', () => closeGame());

  </script>
</body>
</html>