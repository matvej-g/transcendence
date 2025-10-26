import { attachKeyboard, isDown } from './input';

export interface Game {
  start(): void;
  stop(): void;
  running: boolean;
}

type Ctx = CanvasRenderingContext2D;

export function createGame(canvas: HTMLCanvasElement): Game {
  const ctx = canvas.getContext('2d') as Ctx;
  const W = canvas.width;
  const H = canvas.height;

  // Rules baseline (apply same to every player later)
  const PADDLE_SPEED = 360; // px/s — keep this identical for all players (IV.3)
  const PADDLE_W = 14, PADDLE_H = 90;
  const LEFT_X = 24;

  let last = 0;
  let raf = 0;
  let running = false;
  const cleanupKeys = attachKeyboard();

  const paddle = { x: LEFT_X, y: (H - PADDLE_H) / 2, w: PADDLE_W, h: PADDLE_H };

  function loop(t: number) {
    raf = requestAnimationFrame(loop);
    const dt = last ? (t - last) / 1000 : 0;
    last = t;

    update(dt);
    draw();
  }

  function update(dt: number) {
    let vy = 0;
    // Two equivalent control schemes for the single paddle:
    if (isDown('ArrowUp') || isDown('KeyW')) vy = -PADDLE_SPEED;
    if (isDown('ArrowDown') || isDown('KeyS')) vy = +PADDLE_SPEED;

    paddle.y += vy * dt;
    // clamp to field
    if (paddle.y < 0) paddle.y = 0;
    if (paddle.y + paddle.h > H) paddle.y = H - paddle.h;
  }

  function drawNet(ctx: Ctx) {
    const seg = 16, gap = 12, x = W / 2 - 2, w = 4;
    ctx.fillStyle = '#bbbbbb';
    for (let y = 0; y < H; y += seg + gap) ctx.fillRect(x, y, w, seg);
  }

  function draw() {
    // clear
    ctx.fillStyle = '#121216';
    ctx.fillRect(0, 0, W, H);

    drawNet(ctx);

    // paddle
    ctx.fillStyle = '#e8e8e8';
    ctx.fillRect(paddle.x, paddle.y, paddle.w, paddle.h);

    // ball placeholder
    ctx.beginPath();
    ctx.arc(W * 0.65, H * 0.45, 8, 0, Math.PI * 2);
    ctx.fill();
  }

  return {
    start() {
      if (running) return;
      running = true;
      last = 0;
      raf = requestAnimationFrame(loop);
    },
    stop() {
      running = false;
      cancelAnimationFrame(raf);
      cleanupKeys();
    },
    get running() { return running; }
  };
}
