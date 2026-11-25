// render.js — all drawing for Sizzle Street Kitchen. Pure canvas 2D, every
// picture drawn in code: tiled kitchen wall, order board, grill, assembly
// plate with stacked ingredients, the pass with ready plates, and the
// ingredient bins along the counter.

import { INGREDIENTS, INGREDIENT_ORDER } from './recipes.js';
import { binRect, LAYOUT } from './input.js';

export function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function text(ctx, str, x, y, size, color, align = 'left', weight = '700') {
  ctx.fillStyle = color;
  ctx.font = `${weight} ${size}px Verdana, Geneva, sans-serif`;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.fillText(str, x, y);
}

export function drawIngredientIcon(ctx, id, cx, cy, w) {
  const ing = INGREDIENTS[id];
  const h = w * 0.34;
  ctx.save();
  ctx.translate(cx, cy);
  if (id === 'bun') {
    ctx.fillStyle = ing.color;
    ctx.beginPath(); ctx.ellipse(0, 0, w / 2, h, 0, Math.PI, 0); ctx.fill();
    ctx.fillStyle = ing.dark; ctx.fillRect(-w / 2, 0, w, 3);
    ctx.fillStyle = '#fff2cf';
    for (const dx of [-w * 0.22, 0, w * 0.22]) { ctx.beginPath(); ctx.ellipse(dx, -h * 0.55, 3, 1.8, 0.4, 0, 7); ctx.fill(); }
  } else if (id === 'patty') {
    ctx.fillStyle = ing.color;
    roundRect(ctx, -w / 2, -h * 0.8, w, h * 1.6, h * 0.7); ctx.fill();
    ctx.fillStyle = ing.dark;
    for (const dx of [-w * 0.28, 0, w * 0.28]) { ctx.beginPath(); ctx.arc(dx, 0, 2.4, 0, 7); ctx.fill(); }
  } else if (id === 'cheese') {
    ctx.fillStyle = ing.color;
    ctx.beginPath();
    ctx.moveTo(-w / 2, -h * 0.5); ctx.lineTo(w / 2, -h * 0.5); ctx.lineTo(w * 0.34, h * 0.9);
    ctx.lineTo(w * 0.05, h * 0.3); ctx.lineTo(-w * 0.2, h * 0.95); ctx.lineTo(-w * 0.42, h * 0.25);
    ctx.closePath(); ctx.fill();
  } else if (id === 'lettuce') {
    ctx.fillStyle = ing.color;
    ctx.beginPath();
    for (let i = 0; i < 7; i++) {
      const a = (i / 7) * Math.PI;
      ctx.ellipse(Math.cos(a) * w * 0.32, -Math.sin(a) * h * 0.4, w * 0.16, h * 0.55, a * 0.4, 0, 7);
    }
    ctx.fill();
    ctx.fillStyle = ing.dark; ctx.fillRect(-w / 2, h * 0.3, w, 3);
  } else if (id === 'tomato') {
    ctx.fillStyle = ing.color;
    ctx.beginPath(); ctx.ellipse(0, 0, w * 0.42, h * 0.95, 0, 0, 7); ctx.fill();
    ctx.fillStyle = '#ffb3ab'; ctx.beginPath(); ctx.ellipse(0, 0, w * 0.26, h * 0.55, 0, 0, 7); ctx.fill();
    ctx.fillStyle = ing.dark; ctx.beginPath(); ctx.arc(0, 0, 3, 0, 7); ctx.fill();
  } else if (id === 'egg') {
    ctx.fillStyle = '#ffffff';
    ctx.beginPath(); ctx.ellipse(0, 0, w * 0.46, h * 0.95, 0, 0, 7); ctx.fill();
    ctx.fillStyle = ing.dark; ctx.beginPath(); ctx.arc(0, 0, h * 0.62, 0, 7); ctx.fill();
    ctx.fillStyle = '#ffd873'; ctx.beginPath(); ctx.arc(-2, -2, h * 0.3, 0, 7); ctx.fill();
  } else if (id === 'bacon') {
    ctx.strokeStyle = ing.color; ctx.lineWidth = 7; ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-w / 2, 2);
    ctx.bezierCurveTo(-w * 0.2, -h, w * 0.2, h, w / 2, -2);
    ctx.stroke();
    ctx.strokeStyle = '#f3c1b8'; ctx.lineWidth = 2.4;
    ctx.beginPath(); ctx.moveTo(-w / 2, 2); ctx.bezierCurveTo(-w * 0.2, -h, w * 0.2, h, w / 2, -2); ctx.stroke();
  } else if (id === 'sauce') {
    ctx.fillStyle = ing.color;
    ctx.beginPath();
    ctx.moveTo(-w / 2, -h * 0.4);
    for (let i = 0; i <= 4; i++) ctx.lineTo(-w / 2 + (i * w) / 4, -h * 0.4 + (i % 2 ? h * 0.75 : h * 0.2));
    ctx.lineTo(w / 2, -h * 0.4); ctx.closePath(); ctx.fill();
  }
  ctx.restore();
}

function drawPlateStack(ctx, steps, cx, baseY, w) {
  // White plate
  ctx.fillStyle = '#f7f7f2';
  ctx.beginPath(); ctx.ellipse(cx, baseY, w * 0.62, 16, 0, 0, 7); ctx.fill();
  ctx.strokeStyle = '#cfd4d8'; ctx.lineWidth = 2; ctx.stroke();
  ctx.beginPath(); ctx.ellipse(cx, baseY - 2, w * 0.44, 10, 0, 0, 7); ctx.stroke();
  let y = baseY - 8;
  for (const step of steps) {
    drawIngredientIcon(ctx, step, cx, y, w);
    y -= step === 'bun' ? 13 : 10;
  }
  return y;
}

function drawCustomer(ctx, order, x, y) {
  const c = order.customer;
  ctx.fillStyle = c.color;
  ctx.beginPath(); ctx.arc(x, y, 17, 0, 7); ctx.fill();
  ctx.fillStyle = '#5b3a29';
  ctx.beginPath(); ctx.arc(x - 6, y - 2, 2.2, 0, 7); ctx.arc(x + 6, y - 2, 2.2, 0, 7); ctx.fill();
  ctx.beginPath(); ctx.arc(x, y + 4, 6, 0.15 * Math.PI, 0.85 * Math.PI); ctx.strokeStyle = '#5b3a29'; ctx.lineWidth = 2; ctx.stroke();
  ctx.fillStyle = c.shirt;
  roundRect(ctx, x - 15, y + 15, 30, 14, 6); ctx.fill();
}

function drawOrderCard(ctx, order, x, y, w, h, index) {
  const urgent = order.timeLeft < 8;
  ctx.fillStyle = urgent ? '#ffe9e4' : '#fffdf4';
  roundRect(ctx, x, y, w, h, 12); ctx.fill();
  ctx.strokeStyle = urgent ? '#e8493f' : '#d8c690'; ctx.lineWidth = urgent ? 3 : 2; ctx.stroke();
  drawCustomer(ctx, order, x + 28, y + 30);
  text(ctx, `#${index + 1} ${order.recipe.name}`, x + 54, y + 20, 16, '#3a2a1a');
  text(ctx, `${order.customer.name} · ${order.recipe.price} coins`, x + 54, y + 42, 12, '#8a6d3b', 'left', '600');
  // Steps as mini icons with done check based on nothing (recipe display)
  const steps = order.recipe.steps;
  const iw = Math.min(34, (w - 24) / steps.length - 4);
  steps.forEach((s, i) => {
    const ix = x + 16 + i * (iw + 5) + iw / 2;
    ctx.fillStyle = '#f3ead2'; roundRect(ctx, ix - iw / 2, y + 58, iw, 30, 6); ctx.fill();
    drawIngredientIcon(ctx, s, ix, y + 74, iw * 0.8);
  });
  // Patience bar
  const frac = Math.max(0, order.timeLeft / order.timeMax);
  ctx.fillStyle = '#e8e0c8'; roundRect(ctx, x + 12, y + h - 16, w - 24, 8, 4); ctx.fill();
  ctx.fillStyle = frac > 0.45 ? '#5fbf4d' : frac > 0.2 ? '#f2a63c' : '#e8493f';
  roundRect(ctx, x + 12, y + h - 16, (w - 24) * frac, 8, 4); ctx.fill();
  text(ctx, `${Math.ceil(order.timeLeft)}s`, x + w - 14, y + 20, 14, urgent ? '#e8493f' : '#6b5322', 'right');
}

export function drawScene(ctx, state, ui) {
  const W = LAYOUT.width, H = LAYOUT.height;
  // Wall with tiles
  ctx.fillStyle = '#f6e8d4'; ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = 'rgba(190,160,110,0.25)'; ctx.lineWidth = 1;
  for (let x = 0; x < W; x += 64) { ctx.beginPath(); ctx.moveTo(x, 56); ctx.lineTo(x, 420); ctx.stroke(); }
  for (let y = 56; y < 420; y += 52) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
  // Floor / counter base
  ctx.fillStyle = '#a4713e'; ctx.fillRect(0, 420, W, H - 420);
  ctx.fillStyle = '#bd8750'; ctx.fillRect(0, 420, W, 14);

  drawTopBar(ctx, state);
  drawOrderBoard(ctx, state);
  drawGrill(ctx, state);
  drawAssembly(ctx, state, ui);
  drawPass(ctx, state);
  drawBins(ctx, state);

  if (state.flash) {
    const a = Math.max(0, 1 - state.flash.t / 1.1);
    ctx.globalAlpha = a;
    text(ctx, state.flash.text, 640, 428, 30, state.flash.color, 'center', '800');
    ctx.globalAlpha = 1;
  }
  if (state.mode === 'title') drawTitle(ctx, state);
  if (state.mode === 'paused') drawOverlay(ctx, 'PAUSED', 'Press P or tap Resume to keep cooking');
  if (state.mode === 'over') drawGameOver(ctx, state);
}

function drawTopBar(ctx, state) {
  ctx.fillStyle = '#40260f'; ctx.fillRect(0, 0, 1280, 56);
  text(ctx, 'SIZZLE STREET KITCHEN', 20, 29, 22, '#ffd873', 'left', '800');
  const mins = Math.floor(Math.max(0, state.timeLeft) / 60);
  const secs = Math.floor(Math.max(0, state.timeLeft) % 60);
  const timerStr = `${mins}:${String(secs).padStart(2, '0')}`;
  ctx.fillStyle = state.timeLeft < 20 ? '#e8493f' : '#2e1c08';
  roundRect(ctx, 520, 8, 150, 40, 10); ctx.fill();
  text(ctx, `SHIFT ${timerStr}`, 595, 29, 20, '#ffffff', 'center', '800');
  text(ctx, `SCORE ${state.score}`, 720, 29, 19, '#ffffff');
  text(ctx, `COINS ${state.coins}`, 900, 29, 19, '#ffd873');
  if (state.combo >= 2) text(ctx, `COMBO x${state.combo}`, 1060, 29, 19, '#ff9d5c', 'left', '800');
  text(ctx, state.mode === 'paused' ? 'RESUME' : 'PAUSE', 1252, 29, 14, '#ffe9b0', 'right', '700');
}

function drawOrderBoard(ctx, state) {
  ctx.fillStyle = '#5d4020'; roundRect(ctx, 14, 66, 1252, 158, 14); ctx.fill();
  ctx.fillStyle = '#fff6da'; roundRect(ctx, 22, 74, 1236, 142, 10); ctx.fill();
  text(ctx, 'ORDER BOARD', 40, 92, 15, '#8a6d3b', 'left', '800');
  if (state.orders.length === 0) {
    text(ctx, 'No orders yet — the lunch crowd is coming…', 640, 155, 20, '#a68d55', 'center', '700');
  }
  const w = 296, gap = 14;
  state.orders.forEach((order, i) => {
    drawOrderCard(ctx, order, 40 + i * (w + gap), 104, w, 106, i);
  });
}

function drawGrill(ctx, state) {
  const x = 40, y = 252, w = 300, h = 168;
  ctx.fillStyle = '#37414f'; roundRect(ctx, x, y, w, h, 14); ctx.fill();
  text(ctx, 'GRILL', x + 16, y + 24, 17, '#ffd873', 'left', '800');
  ctx.fillStyle = '#1d232c'; roundRect(ctx, x + 16, y + 44, w - 32, 84, 10); ctx.fill();
  ctx.strokeStyle = '#59636f'; ctx.lineWidth = 3;
  for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.moveTo(x + 28, y + 58 + i * 16); ctx.lineTo(x + w - 28, y + 58 + i * 16); ctx.stroke(); }
  if (state.grill) {
    const g = state.grill;
    drawIngredientIcon(ctx, g.ingredient, x + w / 2, y + 86, 104);
    const done = g.progress >= 1;
    ctx.fillStyle = '#12161c'; roundRect(ctx, x + 30, y + 138, w - 60, 14, 7); ctx.fill();
    ctx.fillStyle = done ? '#5fbf4d' : '#f2a63c';
    roundRect(ctx, x + 30, y + 138, (w - 60) * Math.min(1, g.progress), 14, 7); ctx.fill();
    text(ctx, done ? 'COOKED! Tap to plate it' : 'Sizzling…', x + w - 14, y + 24, 13, '#ffffff', 'right', '700');
  } else {
    text(ctx, 'Patty & Egg cook here first', x + w / 2, y + 88, 14, '#9fb0c0', 'center', '600');
  }
}

function drawAssembly(ctx, state, ui) {
  const x = 372, y = 252, w = 470, h = 168;
  ctx.fillStyle = '#fdf6e3'; roundRect(ctx, x, y, w, h, 14); ctx.fill();
  ctx.strokeStyle = '#d8c690'; ctx.lineWidth = 2; ctx.stroke();
  text(ctx, 'ASSEMBLY PLATE — dish mid-assembly', x + 16, y + 24, 16, '#8a6d3b', 'left', '800');
  drawPlateStack(ctx, state.plate, x + 104, y + 140, 104);
  // Target hint: first order whose prefix matches
  const hint = ui.hintText;
  if (hint) text(ctx, hint, x + 226, y + 62, 13, '#6b5322', 'left', '600');
  text(ctx, state.plate.length ? `${state.plate.length} layer${state.plate.length > 1 ? 's' : ''} stacked` : 'Tap an ingredient below to start', x + 226, y + 88, 13, '#a68d55', 'left', '600');
  // Serve + trash buttons
  ctx.fillStyle = '#3f9431'; roundRect(ctx, ui.serveRect.x, ui.serveRect.y, ui.serveRect.w, ui.serveRect.h, 10); ctx.fill();
  text(ctx, 'SERVE ✓', ui.serveRect.x + ui.serveRect.w / 2, ui.serveRect.y + ui.serveRect.h / 2, 15, '#ffffff', 'center', '800');
  ctx.fillStyle = '#b0483e'; roundRect(ctx, ui.trashRect.x, ui.trashRect.y, ui.trashRect.w, ui.trashRect.h, 10); ctx.fill();
  text(ctx, 'TRASH ✕', ui.trashRect.x + ui.trashRect.w / 2, ui.trashRect.y + ui.trashRect.h / 2, 15, '#ffffff', 'center', '800');
  text(ctx, 'Enter = serve · Backspace = trash · G = take from grill', x + w / 2, y + h - 8, 11, '#a68d55', 'center', '600');
}

function drawPass(ctx, state) {
  const x = 874, y = 252, w = 366, h = 168;
  ctx.fillStyle = '#e9f4e4'; roundRect(ctx, x, y, w, h, 14); ctx.fill();
  ctx.strokeStyle = '#a9cba0'; ctx.lineWidth = 2; ctx.stroke();
  text(ctx, 'THE PASS — plates ready to serve', x + 16, y + 24, 15, '#3f7031', 'left', '800');
  if (state.readyPlates.length === 0) {
    text(ctx, 'Finished dishes land here', x + w / 2, y + 96, 14, '#7ba873', 'center', '600');
  }
  state.readyPlates.forEach((dish, i) => {
    const cx = x + 62 + i * 108;
    drawPlateStack(ctx, dish.steps, cx, y + 128, 84);
    text(ctx, dish.name, cx, y + 152, 11, '#3f7031', 'center', '700');
  });
}

function drawBins(ctx, state) {
  text(ctx, 'INGREDIENTS — click a bin or press its number key', 46, 632, 15, '#ffe9b0', 'left', '800');
  INGREDIENT_ORDER.forEach((id, i) => {
    const r = binRect(i);
    const ing = INGREDIENTS[id];
    ctx.fillStyle = '#fdf6e3'; roundRect(ctx, r.x, r.y, r.w, r.h, 12); ctx.fill();
    ctx.strokeStyle = ing.dark; ctx.lineWidth = 2; ctx.stroke();
    drawIngredientIcon(ctx, id, r.x + r.w / 2, r.y + 44, 76);
    text(ctx, ing.name, r.x + r.w / 2, r.y + 82, 15, '#3a2a1a', 'center', '800');
    text(ctx, `key ${ing.key}${ing.needsGrill ? ' · grill' : ''}`, r.x + r.w / 2, r.y + 102, 11, '#8a6d3b', 'center', '600');
  });
}

function drawOverlay(ctx, title, sub) {
  ctx.fillStyle = 'rgba(30,18,4,0.72)'; ctx.fillRect(0, 0, 1280, 800);
  text(ctx, title, 640, 360, 54, '#ffd873', 'center', '800');
  text(ctx, sub, 640, 420, 20, '#ffffff', 'center', '600');
}

function drawTitle(ctx, state) {
  ctx.fillStyle = 'rgba(30,18,4,0.78)'; ctx.fillRect(0, 0, 1280, 800);
  text(ctx, 'SIZZLE STREET', 640, 250, 64, '#ffd873', 'center', '800');
  text(ctx, 'K I T C H E N', 640, 316, 40, '#ff9d5c', 'center', '800');
  text(ctx, 'Build each order on the plate, grill patties & eggs, serve before patience runs out!', 640, 386, 19, '#ffffff', 'center', '600');
  text(ctx, 'Click ingredients or press 1–8 · Enter serves · Backspace trashes · P pauses', 640, 424, 16, '#ffe9b0', 'center', '600');
  ctx.fillStyle = '#3f9431'; roundRect(ctx, 520, 470, 240, 56, 14); ctx.fill();
  text(ctx, 'START SHIFT', 640, 499, 22, '#ffffff', 'center', '800');
  text(ctx, 'The kitchen behind this card is already mid-rush — jump in!', 640, 566, 14, '#d8c690', 'center', '600');
}

function drawGameOver(ctx, state) {
  ctx.fillStyle = 'rgba(30,18,4,0.82)'; ctx.fillRect(0, 0, 1280, 800);
  text(ctx, 'SHIFT OVER!', 640, 250, 54, '#ffd873', 'center', '800');
  text(ctx, `Final score  ${state.score}`, 640, 330, 30, '#ffffff', 'center', '800');
  text(ctx, `Coins earned ${state.coins} · Dishes served ${state.served} · Orders lost ${state.missed}`, 640, 382, 19, '#ffe9b0', 'center', '600');
  text(ctx, `Best combo x${state.bestCombo}`, 640, 420, 19, '#ff9d5c', 'center', '700');
  ctx.fillStyle = '#3f9431'; roundRect(ctx, 520, 470, 240, 56, 14); ctx.fill();
  text(ctx, 'PLAY AGAIN', 640, 499, 22, '#ffffff', 'center', '800');
}
