// Compiles to /site/public/js/otherGame/extractDots.js
import { $, log } from "../utils/utils.js";
import { drawMap, rectHitsBlocked, randomLandPixel, TILE, tileAt, isBlocking } from "./maps/defaultMap.js";
import { computeFovPolygon, drawFovOverlay, pointVisible } from "./rendering/fov.js";

// pixel → blocking? function for rays/LOS
const isBlockedPx = (px: number, py: number) => isBlocking(tileAt(px, py));

// --- Canvas & HUD ---
const canvas = $<HTMLCanvasElement>("game")!;
const ctx = canvas.getContext("2d")!;
const hud = document.getElementById("hudStats")!;
const W = canvas.width,
  H = canvas.height;

// --- Input ---
const keys = new Set<string>();
let mouse = { x: W / 2, y: H / 2, down: false };
window.addEventListener("keydown", (e) => keys.add(e.key.toLowerCase()));
window.addEventListener("keyup", (e) => keys.delete(e.key.toLowerCase()));
canvas.addEventListener("mousemove", (e) => {
  const r = canvas.getBoundingClientRect();
  mouse.x = (e.clientX - r.left) * (canvas.width / r.width);
  mouse.y = (e.clientY - r.top) * (canvas.height / r.height);
});
canvas.addEventListener("mousedown", () => (mouse.down = true));
canvas.addEventListener("mouseup", () => (mouse.down = false));

// --- Helpers ---
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const dist2 = (ax: number, ay: number, bx: number, by: number) => {
  const dx = ax - bx,
    dy = ay - by;
  return dx * dx + dy * dy;
};
const rnd = (a: number, b: number) => a + Math.random() * (b - a);

// --- Entities ---
type Bullet = { x: number; y: number; vx: number; vy: number; life: number };
type Enemy = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  speed: number;
  hp: number;
  spawnT: number;
};
type Loot = { x: number; y: number; taken: boolean };

const player = {
  x: W * 0.5,
  y: H * 0.7,
  r: 8,
  vx: 0,
  vy: 0,
  hp: 100,
  ammo: 12,
  maxAmmo: 12,
  fireCd: 0,
};
const bullets: Bullet[] = [];
const enemies: Enemy[] = [];
const loots: Loot[] = [];

// extraction (we’ll place it on land at reset)
const extract = {
  x: W * 0.85,
  y: H * 0.2,
  r: 42,
  required: 3,
  holdTime: 4.0,
  holding: 0,
};

let looted = 0;
let time = 0;
let gameOver = false;
let extracted = false;

function snapToLandNear(_x: number, _y: number) {
  // simple: just pick any land tile for now
  return randomLandPixel();
}

function reset() {
  bullets.length = 0;
  enemies.length = 0;
  loots.length = 0;

  // spawn player on a land tile
  const pStart = randomLandPixel();
  player.x = pStart.x;
  player.y = pStart.y;
  player.vx = player.vy = 0;
  player.hp = 100;
  player.ammo = 12;
  player.fireCd = 0;

  // place extract on a land tile (roughly top-right)
  const eStart = { x: W - TILE * 3, y: TILE * 4 };
  const eLand = snapToLandNear(eStart.x, eStart.y);
  extract.x = eLand.x;
  extract.y = eLand.y;
  extract.holding = 0;

  looted = 0;
  time = 0;
  gameOver = false;
  extracted = false;

  // spawn loot on land tiles
  for (let i = 0; i < 6; i++) {
    const pos = randomLandPixel();
    loots.push({ x: pos.x, y: pos.y, taken: false });
  }

  // initial enemies (spawn just off screen)
  for (let i = 0; i < 6; i++) spawnEnemy();

  log("New raid started. Extract after collecting 3 loot.");
}
reset();

function spawnEnemy() {
  const side = Math.floor(Math.random() * 4);
  let x = 0,
    y = 0;
  if (side === 0) {
    x = -20;
    y = rnd(0, H);
  }
  if (side === 1) {
    x = W + 20;
    y = rnd(0, H);
  }
  if (side === 2) {
    x = rnd(0, W);
    y = -20;
  }
  if (side === 3) {
    x = rnd(0, W);
    y = H + 20;
  }
  enemies.push({
    x,
    y,
    vx: 0,
    vy: 0,
    speed: rnd(60, 110),
    hp: 3,
    spawnT: time,
  });
}

// --- Update ---
function update(dt: number) {
  if (gameOver || extracted) return;

  time += dt;

  // Player move (axis-separated) with map collision
  const sp = 200;
  let dx = 0,
    dy = 0;
  if (keys.has("w")) dy -= 1;
  if (keys.has("s")) dy += 1;
  if (keys.has("a")) dx -= 1;
  if (keys.has("d")) dx += 1;
  if (dx || dy) {
    const inv = 1 / Math.hypot(dx, dy);
    player.vx = dx * sp * inv;
    player.vy = dy * sp * inv;
  } else {
    player.vx = player.vy = 0;
  }

  const pw = player.r * 2;
  const ph = player.r * 2;

  // try move X
  let nx = clamp(player.x + player.vx * dt, player.r, W - player.r);
  let ny = player.y;
  if (!rectHitsBlocked(nx - player.r, ny - player.r, pw, ph)) {
    player.x = nx;
  }
  // try move Y
  nx = player.x;
  ny = clamp(player.y + player.vy * dt, player.r, H - player.r);
  if (!rectHitsBlocked(nx - player.r, ny - player.r, pw, ph)) {
    player.y = ny;
  }

  // Shooting
  if (player.fireCd > 0) player.fireCd -= dt;
  if (mouse.down && player.fireCd <= 0 && player.ammo > 0) {
    const ang = Math.atan2(mouse.y - player.y, mouse.x - player.x);
    const speed = 520;
    bullets.push({
      x: player.x,
      y: player.y,
      vx: Math.cos(ang) * speed,
      vy: Math.sin(ang) * speed,
      life: 1.2,
    });
    player.fireCd = 0.12;
    player.ammo--;
  }

  // Bullets
  for (let i = bullets.length - 1; i >= 0; i--) {
    const b = bullets[i];
    b.x += b.vx * dt;
    b.y += b.vy * dt;
    b.life -= dt;
    if (b.x < -10 || b.y < -10 || b.x > W + 10 || b.y > H + 10 || b.life <= 0)
      bullets.splice(i, 1);
  }

  // Enemies AI & movement with collision
  if (time % 1.5 < dt) spawnEnemy();
  for (let i = enemies.length - 1; i >= 0; i--) {
    const e = enemies[i];
    const dx = player.x - e.x,
      dy = player.y - e.y;
    const d = Math.hypot(dx, dy) || 1;
    const targetSpeed =
      e.speed * (1 + Math.min(0.5, (time - e.spawnT) / 30)); // ramp overtime
    const vx = (dx / d) * targetSpeed;
    const vy = (dy / d) * targetSpeed;

    // move with collision (small AABB)
    const ew = 12,
      eh = 12;
    const ex = e.x + vx * dt;
    const ey = e.y + vy * dt;

    if (!rectHitsBlocked(ex - ew / 2, e.y - eh / 2, ew, eh)) e.x = ex;
    if (!rectHitsBlocked(e.x - ew / 2, ey - eh / 2, ew, eh)) e.y = ey;

    // touch damage
    const touchR2 = (player.r + 6) * (player.r + 6);
    if (dist2(e.x, e.y, player.x, player.y) < touchR2) {
      player.hp -= 20 * dt;
    }

    // bullet hits
    for (let j = bullets.length - 1; j >= 0; j--) {
      const b = bullets[j];
      if (dist2(b.x, b.y, e.x, e.y) < (6 + 3) * (6 + 3)) {
        e.hp--;
        bullets.splice(j, 1);
        if (e.hp <= 0) {
          enemies.splice(i, 1);
          break;
        }
      }
    }
  }

  // Loot pickup
  for (const l of loots) {
    if (!l.taken && dist2(l.x, l.y, player.x, player.y) < (player.r + 6) * (player.r + 6)) {
      l.taken = true;
      looted++;
      player.ammo = Math.min(player.maxAmmo, player.ammo + 6); // tiny reward
      log(`Loot secured (${looted}/${extract.required})`);
    }
  }

  // Extract logic
  const inExtract =
    dist2(player.x, player.y, extract.x, extract.y) < (extract.r - 4) * (extract.r - 4);
  if (inExtract && looted >= extract.required) {
    extract.holding += dt;
    if (extract.holding >= extract.holdTime) {
      extracted = true;
      log("✅ Extracted! Raid success.");
    }
  } else {
    extract.holding = Math.max(0, extract.holding - dt * 0.5); // decay if you step out
  }

  if (player.hp <= 0) {
    gameOver = true;
    log("💀 You died. Press R to retry.");
  }
}

// --- Render ---
function render() {
  ctx.clearRect(0, 0, W, H);

  // 1) Map first
  drawMap(ctx);

  // 2) Build FOV polygon (rays collide with walls/doors)
  const fovPoly = computeFovPolygon(
    { x: player.x, y: player.y },
    mouse,
    isBlockedPx,
    {
      fovHalfRad: (70 * Math.PI) / 180, // ~140° total
      radius: 260,
      rays: 160,
      step: 6,
      ambientRadius: 26,
    }
  );

  // 3) Draw visible objects only (cull by LOS)
  const losRadius = 300;

  // Extraction ring (only if visible)
  if (
    pointVisible(
      { x: player.x, y: player.y },
      { x: extract.x, y: extract.y },
      isBlockedPx,
      losRadius
    )
  ) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(extract.x, extract.y, extract.r, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(16,185,129,0.08)";
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#10b981";
    ctx.stroke();

    if (looted >= extract.required) {
      const p = extract.holding / extract.holdTime;
      ctx.beginPath();
      ctx.strokeStyle = "#059669";
      ctx.lineWidth = 6;
      ctx.arc(
        extract.x,
        extract.y,
        extract.r - 8,
        -Math.PI / 2,
        -Math.PI / 2 + p * 2 * Math.PI
      );
      ctx.stroke();
    }
    ctx.restore();
  }

  // Loot (only visible ones)
  for (const l of loots) {
    if (l.taken) continue;
    if (
      !pointVisible(
        { x: player.x, y: player.y },
        { x: l.x, y: l.y },
        isBlockedPx,
        losRadius
      )
    )
      continue;

    ctx.beginPath();
    ctx.arc(l.x, l.y, 6, 0, Math.PI * 2);
    ctx.fillStyle = "#eab308"; // amber
    ctx.fill();
  }

  // Enemies (only visible ones)
  for (const e of enemies) {
    if (
      !pointVisible(
        { x: player.x, y: player.y },
        { x: e.x, y: e.y },
        isBlockedPx,
        losRadius
      )
    )
      continue;

    ctx.beginPath();
    ctx.arc(e.x, e.y, 6, 0, Math.PI * 2);
    ctx.fillStyle = "#ef4444"; // red
    ctx.fill();
  }

  // Bullets (you can choose to always draw or also cull by LOS)
  ctx.fillStyle = "#1f2937"; // slate-800
  for (const b of bullets) {
    // Optional LOS cull:
    // if (!pointVisible({x:player.x,y:player.y},{x:b.x,y:b.y}, isBlockedPx, losRadius)) continue;
    ctx.beginPath();
    ctx.arc(b.x, b.y, 3, 0, Math.PI * 2);
    ctx.fill();
  }

  // Player
  ctx.beginPath();
  ctx.arc(player.x, player.y, player.r, 0, Math.PI * 2);
  ctx.fillStyle = "#3b82f6"; // blue
  ctx.fill();

  // 4) Darken everything except inside FOV polygon (plus ambient bubble)
  drawFovOverlay(ctx, W, H, { x: player.x, y: player.y }, fovPoly, {
    darkness: "rgba(0,0,0,0.68)",
    ambientRadius: 26,
    radius: 260,
    featherSteps: 1,
  });

  // 5) HUD / banners (draw after overlay so UI stays bright)
  ctx.fillStyle = "#111827";
  ctx.font = "bold 16px ui-sans-serif, system-ui";
  ctx.fillText(
    `HP: ${Math.max(0, player.hp | 0)}  Ammo: ${player.ammo}/${player.maxAmmo}  Loot: ${looted}/${extract.required}`,
    14,
    22
  );

  if (extracted) {
    banner("EXTRACTED!");
  } else if (gameOver) {
    banner("DEAD — Press R");
  }
}

function banner(text: string) {
  ctx.save();
  ctx.fillStyle = "rgba(0,0,0,0.5)";
  ctx.fillRect(0, H / 2 - 40, W, 80);
  ctx.fillStyle = "#fff";
  ctx.font = "bold 48px ui-sans-serif, system-ui";
  ctx.textAlign = "center";
  ctx.fillText(text, W / 2, H / 2 + 16);
  ctx.restore();
}

// --- Loop & restart ---
let last = performance.now();
function loop(now: number) {
  const dt = Math.min(0.033, (now - last) / 1000); // clamp for stability
  last = now;
  update(dt);
  render();
  hud.textContent = `Time: ${time.toFixed(1)}s
HP: ${player.hp.toFixed(0)} | Ammo: ${player.ammo}/${player.maxAmmo}
Loot: ${looted}/${extract.required} | In zone: ${Math.min(
    extract.holding,
    extract.holdTime
  ).toFixed(1)}s`;
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);

window.addEventListener("keydown", (e) => {
  if (e.key.toLowerCase() === "r" && (gameOver || extracted)) reset();
});