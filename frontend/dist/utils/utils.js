// Compiles to /site/public/js/util.js
export const $ = (id) => document.getElementById(id);
export const devLogEl = () => document.getElementById("devLog");
export function log(msg) {
    console.log(msg);
    const el = devLogEl();
    if (!el)
        return; // If the on screen log element doesn't exist, do nothing
    const line = document.createElement("div");
    line.textContent = `[${new Date().toLocaleTimeString()}] ${msg}`;
    el.appendChild(line);
    el.scrollTop = el.scrollHeight;
}
