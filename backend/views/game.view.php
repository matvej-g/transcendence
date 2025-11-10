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
    document.getElementById('play-button').addEventListener('click', (e) => {
      e.preventDefault();
      document.getElementById('game-window').classList.remove('hidden');

      // 🎮 draw the game when window opens
      const canvas = document.getElementById('gameCanvas');
      const ctx = canvas.getContext('2d');

      // adjust canvas size to match container
      canvas.width = 800;
      canvas.height = 400;

      ctx.fillStyle = 'white';
      ctx.fillRect(20, 160, 10, 80); // left paddle
      ctx.fillRect(770, 160, 10, 80); // right paddle
      ctx.fillRect(394, 194, 12, 12); // ball
    });

    document.getElementById('close-game').addEventListener('click', () => {
      document.getElementById('game-window').classList.add('hidden');
    });
  </script>
</body>
</html>