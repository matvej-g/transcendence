// Compiles to /site/public/js/util.js
export const $ = <T extends HTMLElement = HTMLElement>(id: string) =>
  document.getElementById(id) as T | null;

export const devLogEl = () =>
  document.getElementById("devLog") as HTMLDivElement | null;

export function log(msg: string) {
  console.log(msg);
  const el = devLogEl();
  if (!el) return; // If the on screen log element doesn't exist, do nothing
  const line = document.createElement("div");
  line.textContent = `[${new Date().toLocaleTimeString()}] ${msg}`;
  el.appendChild(line);
  el.scrollTop = el.scrollHeight;
}