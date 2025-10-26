"use strict";
(() => {
  // src/input.ts
  var down = /* @__PURE__ */ new Set();
  function attachKeyboard(el = window) {
    const onKeyDown = (e) => {
      if (isMoveKey(e.code)) {
        e.preventDefault();
        down.add(e.code);
      }
    };
    const onKeyUp = (e) => {
      if (isMoveKey(e.code)) {
        e.preventDefault();
        down.delete(e.code);
      }
    };
    el.addEventListener("keydown", onKeyDown);
    el.addEventListener("keyup", onKeyUp);
    return () => {
      el.removeEventListener("keydown", onKeyDown);
      el.removeEventListener("keyup", onKeyUp);
    };
  }
  function isDown(code) {
    return down.has(code);
  }
  function isMoveKey(code) {
    return code === "ArrowUp" || code === "ArrowDown" || code === "KeyW" || code === "KeyS";
  }

  // src/game.ts
  function createGame(canvas2) {
    const ctx = canvas2.getContext("2d");
    const W = canvas2.width;
    const H = canvas2.height;
    const PADDLE_SPEED = 360;
    const PADDLE_W = 14, PADDLE_H = 90;
    const LEFT_X = 24;
    let last = 0;
    let raf = 0;
    let running = false;
    const cleanupKeys = attachKeyboard();
    const paddle = { x: LEFT_X, y: (H - PADDLE_H) / 2, w: PADDLE_W, h: PADDLE_H };
    function loop(t) {
      raf = requestAnimationFrame(loop);
      const dt = last ? (t - last) / 1e3 : 0;
      last = t;
      update(dt);
      draw();
    }
    function update(dt) {
      let vy = 0;
      if (isDown("ArrowUp") || isDown("KeyW")) vy = -PADDLE_SPEED;
      if (isDown("ArrowDown") || isDown("KeyS")) vy = +PADDLE_SPEED;
      paddle.y += vy * dt;
      if (paddle.y < 0) paddle.y = 0;
      if (paddle.y + paddle.h > H) paddle.y = H - paddle.h;
    }
    function drawNet(ctx2) {
      const seg = 16, gap = 12, x = W / 2 - 2, w = 4;
      ctx2.fillStyle = "#bbbbbb";
      for (let y = 0; y < H; y += seg + gap) ctx2.fillRect(x, y, w, seg);
    }
    function draw() {
      ctx.fillStyle = "#121216";
      ctx.fillRect(0, 0, W, H);
      drawNet(ctx);
      ctx.fillStyle = "#e8e8e8";
      ctx.fillRect(paddle.x, paddle.y, paddle.w, paddle.h);
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
      get running() {
        return running;
      }
    };
  }

  // src/main.ts
  var canvas = document.getElementById("game");
  var playBtn = document.getElementById("playBtn");
  var game = createGame(canvas);
  playBtn.addEventListener("click", () => {
    if (!game.running) {
      game.start();
      playBtn.disabled = true;
      playBtn.textContent = "Playing\u2026";
    }
  });
})();
//# sourceMappingURL=main.js.map
