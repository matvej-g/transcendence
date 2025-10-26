export type Key = 'ArrowUp' | 'ArrowDown' | 'KeyW' | 'KeyS';

const down = new Set<Key>();

export function attachKeyboard(el: Window = window) {
  const onKeyDown = (e: KeyboardEvent) => {
    if (isMoveKey(e.code)) {
      e.preventDefault(); // stop page scrolling with arrows/space on Firefox
      down.add(e.code as Key);
    }
  };
  const onKeyUp = (e: KeyboardEvent) => {
    if (isMoveKey(e.code)) {
      e.preventDefault();
      down.delete(e.code as Key);
    }
  };
  el.addEventListener('keydown', onKeyDown);
  el.addEventListener('keyup', onKeyUp);
  return () => {
    el.removeEventListener('keydown', onKeyDown);
    el.removeEventListener('keyup', onKeyUp);
  };
}

export function isDown(code: Key) {
  return down.has(code);
}

function isMoveKey(code: string): code is Key {
  return code === 'ArrowUp' || code === 'ArrowDown' || code === 'KeyW' || code === 'KeyS';
}
