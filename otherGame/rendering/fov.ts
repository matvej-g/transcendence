// Compiles to /site/public/js/otherGame/rendering/fov.js


export type FovOpts = {
  /** Half of total cone in radians (default ~70°/2 = 140° total). */
  fovHalfRad?: number;
  /** Max sight distance in px (default 260). */
  radius?: number;
  /** Always-visible bubble around player (default 26). */
  ambientRadius?: number;
  /** Darkness color (drawn as overlay) default rgba(0,0,0,0.68). */
  darkness?: string;
  /** Ray count to build polygon (default 160). */
  rays?: number;
  /** Ray step length in pixels (default 6). */
  step?: number;
  /** Feather steps (0..3) to soften cone edge. */
  featherSteps?: number;
};

/** Callback: return true if (px,py) is inside a blocking tile (wall/closed door). */
export type IsBlockedFn = (px: number, py: number) => boolean;

/** Cast a single ray and return its endpoint (stops on first blocking tile or radius). */
function castRay(
  ox: number, oy: number,
  ang: number,
  radius: number,
  step: number,
  isBlocked: IsBlockedFn
): { x: number; y: number } {
  const dx = Math.cos(ang), dy = Math.sin(ang);
  const maxSteps = Math.ceil(radius / step);
  let x = ox, y = oy;
  for (let i = 0; i < maxSteps; i++) {
    const nx = ox + dx * (i * step);
    const ny = oy + dy * (i * step);
    if (isBlocked(nx, ny)) break;
    x = nx; y = ny;
  }
  return { x, y };
}

/** Build a visibility polygon (fan) by casting rays within the FOV cone. */
export function computeFovPolygon(
  player: { x: number; y: number },
  aim: { x: number; y: number },
  isBlocked: IsBlockedFn,
  opts: FovOpts = {}
): Array<{ x: number; y: number }> {
  const fovHalf = opts.fovHalfRad ?? (70 * Math.PI) / 180; // ~140° total
  const R = opts.radius ?? 260;
  const rays = Math.max(16, Math.floor(opts.rays ?? 160));
  const step = Math.max(1, opts.step ?? 6);

  const baseAng = Math.atan2(aim.y - player.y, aim.x - player.x);
  const start = baseAng - fovHalf;
  const end = baseAng + fovHalf;

  const poly: Array<{ x: number; y: number }> = [];
  // Include player as polygon origin (fan) — not strictly necessary for destination-out fill,
  // but handy if you want to stroke it for debug.
  poly.push({ x: player.x, y: player.y });

  for (let i = 0; i <= rays; i++) {
    const t = i / rays;
    const ang = start + (end - start) * t;
    const hit = castRay(player.x, player.y, ang, R, step, isBlocked);
    poly.push(hit);
  }
  return poly;
}

/** Draw darkness over the whole screen, then cut the FOV polygon and ambient bubble. */
export function drawFovOverlay(
  ctx: CanvasRenderingContext2D,
  viewW: number,
  viewH: number,
  player: { x: number; y: number },
  polygon: Array<{ x: number; y: number }>,
  opts: FovOpts = {}
) {
  const dark = opts.darkness ?? "rgba(0,0,0,0.68)";
  const ambient = opts.ambientRadius ?? 26;
  const fovHalf = opts.fovHalfRad ?? (70 * Math.PI) / 180;
  const R = opts.radius ?? 260;
  const feather = Math.max(0, Math.min(3, opts.featherSteps ?? 0));

  ctx.save();

  // 1) Lay darkness
  ctx.globalCompositeOperation = "source-over";
  ctx.fillStyle = dark;
  ctx.fillRect(0, 0, viewW, viewH);

  // 2) Erase FOV polygon + ambient circle
  ctx.globalCompositeOperation = "destination-out";

  // Main polygon
  ctx.beginPath();
  ctx.moveTo(polygon[0].x, polygon[0].y);
  for (let i = 1; i < polygon.length; i++) {
    ctx.lineTo(polygon[i].x, polygon[i].y);
  }
  ctx.closePath();
  ctx.fill();

  // Ambient bubble
  ctx.beginPath();
  ctx.arc(player.x, player.y, ambient, 0, Math.PI * 2);
  ctx.fill();

  // Optional feather: a few inset polygons (cheaper than Gaussian blur)
  if (feather > 0) {
    const alpha = 0.25;
    for (let k = 1; k <= feather; k++) {
      ctx.globalAlpha = alpha;
      // crude inset: shrink radius and re-draw cone as arc-based fan from player
      // (fast approximation — we don't recompute ray intersections)
      ctx.beginPath();
      ctx.moveTo(player.x, player.y);
      // approximate fan with arc between min/max angles of polygon
      // find the two extreme angles from player to polygon ends
      const a0 = Math.atan2(polygon[1].y - player.y, polygon[1].x - player.x);
      const a1 = Math.atan2(polygon[polygon.length - 1].y - player.y, polygon[polygon.length - 1].x - player.x);
      // pick direction (assume small arc)
      const ang0 = a0, ang1 = a1;
      const r = R - k * 18;
      ctx.arc(player.x, player.y, r, ang0, ang1, false);
      ctx.closePath();
      ctx.fill();
    }
  }

  ctx.restore();
}

/** True if straight line from player to point hits no blocking tile (LOS test). */
export function pointVisible(
  player: { x: number; y: number },
  point: { x: number; y: number },
  isBlocked: IsBlockedFn,
  maxDist = 1200,
  step = 4
): boolean {
  const dx = point.x - player.x;
  const dy = point.y - player.y;
  const dist = Math.hypot(dx, dy);
  if (dist > maxDist) return false;
  const steps = Math.ceil(dist / step);
  const vx = dx / steps;
  const vy = dy / steps;
  for (let i = 1; i <= steps; i++) {
    const px = player.x + vx * i;
    const py = player.y + vy * i;
    if (isBlocked(px, py)) return false;
  }
  return true;
}