// input.js — pointer and keyboard plumbing. The game logic lives in main.js;
// this module only turns raw events into named actions and hit rectangles.

export const LAYOUT = {
  width: 1280,
  height: 800,
  binY: 648,
  binW: 138,
  binH: 118,
  binGap: 12,
  binStartX: 46,
};

export function binRect(index) {
  return {
    x: LAYOUT.binStartX + index * (LAYOUT.binW + LAYOUT.binGap),
    y: LAYOUT.binY,
    w: LAYOUT.binW,
    h: LAYOUT.binH,
  };
}

export function pointInRect(x, y, r) {
  return x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h;
}

export function canvasPoint(canvas, event) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: ((event.clientX - rect.left) / rect.width) * LAYOUT.width,
    y: ((event.clientY - rect.top) / rect.height) * LAYOUT.height,
  };
}

export function attachInput(canvas, handlers) {
  canvas.addEventListener('pointerdown', (e) => {
    const p = canvasPoint(canvas, e);
    handlers.onTap(p.x, p.y);
  });
  window.addEventListener('keydown', (e) => {
    handlers.onKey(e.key);
    if ([' ', 'ArrowUp', 'ArrowDown'].includes(e.key)) e.preventDefault();
  });
}
