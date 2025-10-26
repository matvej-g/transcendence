<?php
?><!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1"
    />
    <title>Pong — Local Test</title>
    <style>
      :root {
        --bg:#0f0f12;
        --fg:#eaeaea;
        --soft:#2a2a2f; }
      * { box-sizing: border-box; }
      html, body {
        height: 100%;
        margin: 0;
        background:
        var(--bg);
        color: var(--fg);
        font-family: ui-sans-serif, system-ui, Arial, sans-serif; }
      .wrap {
        max-width: 900px;
        margin: 0 auto;
        padding: 24px; }
      header {
        display:flex;
        align-items:center;
        justify-content:space-between;
        margin-bottom: 16px; }
      button {
        border: 0;
        padding: 10px 16px;
        border-radius: 12px;
        background: #4c72ff;
        color: white;
        font-weight: 600;
        cursor: pointer; }
      button:disabled {
        opacity: .6;
        cursor: not-allowed; }
      canvas {
        display:block;
        width: 900px;
        height: 500px;
        background: var(--soft);
        border-radius: 16px; }
      .hint {
        opacity:.7;
        margin-top:8px;
        font-size: 14px; }
    </style>
  </head>
  <body>
    <div class="wrap">
      <header>
        <h1>Pong (local demo)</h1>
        <nav><!-- add SPA nav later --></nav>
      </header>

      <div style="margin-bottom:12px;">
        <button id="playBtn">Play</button>
        <span class="hint">Controls: <b>W/S</b> or <b>ArrowUp/ArrowDown</b></span>
      </div>

      <canvas id="game" width="900" height="500"></canvas>
    </div>

    <script type="module" src="/assets/main.js"></script>
  </body>
</html>
