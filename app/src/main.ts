import { createGame } from './game';

const canvas = document.getElementById('game') as HTMLCanvasElement;
const playBtn = document.getElementById('playBtn') as HTMLButtonElement;

const game = createGame(canvas);

playBtn.addEventListener('click', () => {
  if (!game.running) {
    game.start();
    playBtn.disabled = true;
    playBtn.textContent = 'Playing…';
  }
});
