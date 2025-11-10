// Compiles to /site/public/js/otherGame/maps/defaultMap.js

export const TILE = 30;        // 32×18 tiles fit 960×540
export const MAP_COLS = 32;
export const MAP_ROWS = 18;

// 0 = land, 1 = wall, 2 = door (behaves like wall for now)
export const defaultMap: number[][] = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,1,1,1,0,0,0,0,0,1,1,1,0,0,2,0,0,1,1,1,0,0,0,0,0,1,1,1,0,0,1],
  [1,0,1,0,1,0,0,0,0,0,1,0,1,0,0,0,0,0,1,0,1,0,0,0,0,0,1,0,1,0,0,1],
  [1,0,1,0,1,0,0,0,0,0,1,0,1,0,0,2,0,0,1,0,1,0,0,0,0,0,1,0,1,0,0,1],
  [1,0,1,1,1,0,0,0,0,0,1,1,1,0,0,0,0,0,1,1,1,0,0,0,0,0,1,1,1,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,1,1,1,0,0,0,1,1,1,0,0,0,1,1,1,0,0,0,1,1,1,0,0,0,1,1,1,0,0,1],
  [1,0,1,0,1,0,0,0,1,1,1,0,0,0,1,0,2,0,0,0,1,0,1,0,0,0,1,0,1,0,0,1],
  [1,0,1,0,1,0,0,0,1,1,1,0,0,0,1,0,0,0,0,0,1,0,1,0,0,0,1,0,1,0,0,1],
  [1,0,1,0,1,0,0,0,1,1,1,0,0,0,1,0,2,0,0,0,1,0,1,0,0,0,1,0,1,0,0,1],
  [1,0,1,1,1,0,0,0,1,1,1,0,0,0,1,1,1,0,0,0,1,1,1,0,0,0,1,1,1,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,1,1,1,0,0,0,0,0,1,1,1,0,0,2,0,0,1,1,1,0,0,0,0,0,1,1,1,0,0,1],
  [1,0,1,0,1,0,0,0,0,0,1,0,1,0,0,0,0,0,1,0,1,0,0,0,0,0,1,0,1,0,0,1],
  [1,0,1,0,1,0,0,0,0,0,1,0,1,0,0,2,0,0,1,0,1,0,0,0,0,0,1,0,1,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
];

export const isBlocking = (t: number) => t === 1 || t === 2;

export function tileAt(px: number, py: number): number {
  const cx = Math.floor(px / TILE);
  const cy = Math.floor(py / TILE);
  if (cx < 0 || cy < 0 || cx >= MAP_COLS || cy >= MAP_ROWS) return 1; // OOB = wall
  return defaultMap[cy][cx] | 0;
}

export function rectHitsBlocked(x: number, y: number, w: number, h: number): boolean {
  const t1 = tileAt(x, y);
  const t2 = tileAt(x + w, y);
  const t3 = tileAt(x, y + h);
  const t4 = tileAt(x + w, y + h);
  return [t1, t2, t3, t4].some(isBlocking);
}

export function drawMap(ctx: CanvasRenderingContext2D) {
  for (let r = 0; r < MAP_ROWS; r++) {
    for (let c = 0; c < MAP_COLS; c++) {
      const t = defaultMap[r][c];
      if (t === 0) continue;
      const x = c * TILE, y = r * TILE;
      if (t === 1) {
        ctx.fillStyle = "#e5e7eb"; ctx.fillRect(x, y, TILE, TILE);
        ctx.strokeStyle = "#9ca3af"; ctx.strokeRect(x + 0.5, y + 0.5, TILE - 1, TILE - 1);
      } else if (t === 2) {
        ctx.fillStyle = "#fde68a"; ctx.fillRect(x, y, TILE, TILE);
        ctx.strokeStyle = "#f59e0b"; ctx.strokeRect(x + 0.5, y + 0.5, TILE - 1, TILE - 1);
      }
    }
  }
}

/** Random land pixel center (snap to tile center). */
export function randomLandPixel(): { x: number; y: number } {
  while (true) {
    const c = Math.floor(Math.random() * MAP_COLS);
    const r = Math.floor(Math.random() * MAP_ROWS);
    if (!isBlocking(defaultMap[r][c])) {
      return { x: c * TILE + TILE / 2, y: r * TILE + TILE / 2 };
    }
  }
}