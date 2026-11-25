// main.js — game loop, order flow and scoring for Sizzle Street Kitchen.
// Owns the state, spawns orders, runs the grill timer, judges serves and
// wires input + rendering together. All rules live here; render.js only draws.

import { createState, difficultyAt, GRILL_SECONDS, CUSTOMER_NAMES, CUSTOMER_COLORS } from './state.js';
import { RECIPES, INGREDIENTS, INGREDIENT_ORDER, stepsMatch, nextNeededStep } from './recipes.js';
import { drawScene } from './render.js';
import { attachInput, binRect, pointInRect } from './input.js';
import { sfx, ensureAudio } from './audio.js';
import { stageShot, parseShotQuery } from './shots.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const statusEl = document.getElementById('status');

const ui = {
  serveRect: { x: 560, y: 368, w: 132, h: 36 },
  trashRect: { x: 700, y: 368, w: 122, h: 36 },
  pauseRect: { x: 1150, y: 8, w: 118, h: 40 },
  startRect: { x: 520, y: 470, w: 240, h: 56 },
  hintText: '',
};

let state = createState(20261125);
const shotInfo = parseShotQuery();
let shotMode = false;
if (shotInfo) {
  const staged = stageShot(shotInfo.name, shotInfo.seed);
  if (staged) { state = staged; shotMode = true; }
}

function pickRecipe() {
  const diff = difficultyAt(state.elapsed);
  const pool = RECIPES.filter((r) => r.steps.length <= 4 + diff.level);
  return pool[Math.floor(state.rng() * pool.length)];
}

function spawnOrder() {
  const diff = difficultyAt(state.elapsed);
  if (state.orders.length >= diff.maxOrders) return;
  const recipe = pickRecipe();
  const idx = Math.floor(state.rng() * CUSTOMER_NAMES.length);
  state.orders.push({
    id: state.nextOrderId++,
    recipe,
    timeLeft: recipe.time * diff.timeScale,
    timeMax: recipe.time * diff.timeScale,
    customer: {
      name: CUSTOMER_NAMES[idx],
      color: CUSTOMER_COLORS[idx % CUSTOMER_COLORS.length],
      shirt: CUSTOMER_COLORS[(idx + 2) % CUSTOMER_COLORS.length],
    },
  });
}

function setFlash(text, color) {
  state.flash = { text, color, t: 0 };
}

function addIngredient(id) {
  if (state.mode !== 'playing') return;
  const ing = INGREDIENTS[id];
  if (ing.needsGrill) {
    if (state.grill) { setFlash('Grill is busy!', '#e8493f'); sfx.bad(); return; }
    state.grill = { ingredient: id, progress: 0 };
    sfx.grill();
    setFlash(`${ing.name} on the grill…`, '#f2a63c');
    return;
  }
  if (state.plate.length >= 7) { setFlash('Plate is full!', '#e8493f'); sfx.bad(); return; }
  state.plate.push(id);
  sfx.add();
}

function collectGrill() {
  if (!state.grill || state.grill.progress < 1) return;
  if (state.plate.length >= 7) { setFlash('Plate is full!', '#e8493f'); return; }
  state.plate.push(state.grill.ingredient);
  state.grill = null;
  sfx.add();
}

function servePlate() {
  if (state.mode !== 'playing' || state.plate.length === 0) return;
  const matchIdx = state.orders.findIndex((o) => stepsMatch(state.plate, o.recipe));
  if (matchIdx === -1) {
    state.combo = 0;
    state.score = Math.max(0, state.score - 15);
    setFlash('No order matches that plate! -15', '#e8493f');
    sfx.bad();
    return;
  }
  const order = state.orders[matchIdx];
  state.readyPlates.push(order.recipe);
  state.orders.splice(matchIdx, 1);
  state.plate = [];
  state.combo += 1;
  state.bestCombo = Math.max(state.bestCombo, state.combo);
  const patienceBonus = Math.round((order.timeLeft / order.timeMax) * 10);
  const comboBonus = Math.min(20, (state.combo - 1) * 4);
  const gained = order.recipe.price + patienceBonus + comboBonus;
  state.coins += order.recipe.price;
  state.score += gained * 5;
  state.served += 1;
  setFlash(`Served ${order.recipe.name}! +${gained * 5}`, '#3f9431');
  sfx.serve();
  // The ready plate clears off the pass shortly after (visual only).
  setTimeout(() => { state.readyPlates.shift(); }, 1600);
  if (statusEl) statusEl.textContent = `Served ${order.recipe.name}. Score ${state.score}.`;
}

function trashPlate() {
  if (state.plate.length === 0) return;
  state.plate = [];
  state.combo = 0;
  setFlash('Plate trashed', '#b0483e');
  sfx.trash();
}

function updateHint() {
  if (state.plate.length === 0) { ui.hintText = 'Start any order — a bun is a safe bet'; return; }
  const complete = state.orders.find((o) => stepsMatch(state.plate, o.recipe));
  if (complete) { ui.hintText = `${complete.recipe.name} complete — hit SERVE!`; return; }
  for (const o of state.orders) {
    const next = nextNeededStep(state.plate, o.recipe);
    if (next) { ui.hintText = `${o.recipe.name} → next: ${INGREDIENTS[next].name}`; return; }
  }
  ui.hintText = 'No order matches — trash it and restart';
}

function update(dt) {
  if (state.flash) { state.flash.t += dt; if (state.flash.t > 1.1) state.flash = null; }
  if (state.mode !== 'playing') return;
  state.elapsed += dt;
  state.timeLeft -= dt;
  if (state.timeLeft <= 0) {
    state.timeLeft = 0;
    state.mode = 'over';
    sfx.expire();
    return;
  }
  const diff = difficultyAt(state.elapsed);
  state.spawnTimer -= dt;
  if (state.spawnTimer <= 0 && state.orders.length < diff.maxOrders) {
    spawnOrder();
    state.spawnTimer = diff.spawnEvery;
  }
  if (state.grill && state.grill.progress < 1) {
    const was = state.grill.progress;
    state.grill.progress = Math.min(1, state.grill.progress + dt / GRILL_SECONDS);
    if (was < 1 && state.grill.progress >= 1) sfx.cooked();
  }
  for (let i = state.orders.length - 1; i >= 0; i--) {
    const o = state.orders[i];
    o.timeLeft -= dt;
    if (o.timeLeft <= 0) {
      state.orders.splice(i, 1);
      state.missed += 1;
      state.combo = 0;
      state.score = Math.max(0, state.score - 25);
      setFlash(`${o.customer.name} left hungry! -25`, '#e8493f');
      sfx.expire();
    }
  }
  updateHint();
}

function startGame() {
  const seed = (Math.random() * 1e9) >>> 0;
  state = createState(seed);
  state.mode = 'playing';
  spawnOrder();
  spawnOrder();
  state.spawnTimer = 4;
  ensureAudio();
  sfx.click();
}

function onTap(x, y) {
  ensureAudio();
  if (state.mode === 'title' || state.mode === 'over') {
    if (pointInRect(x, y, ui.startRect)) startGame();
    return;
  }
  if (pointInRect(x, y, ui.pauseRect)) {
    state.mode = state.mode === 'paused' ? 'playing' : 'paused';
    sfx.click();
    return;
  }
  if (state.mode !== 'playing') return;
  if (pointInRect(x, y, ui.serveRect)) { servePlate(); return; }
  if (pointInRect(x, y, ui.trashRect)) { trashPlate(); return; }
  // Grill zone
  if (pointInRect(x, y, { x: 40, y: 252, w: 300, h: 168 })) { collectGrill(); return; }
  for (let i = 0; i < INGREDIENT_ORDER.length; i++) {
    if (pointInRect(x, y, binRect(i))) { addIngredient(INGREDIENT_ORDER[i]); return; }
  }
}

function onKey(key) {
  if (key === 'p' || key === 'P' || key === 'Escape') {
    if (state.mode === 'playing' || state.mode === 'paused') {
      state.mode = state.mode === 'paused' ? 'playing' : 'paused';
    }
    return;
  }
  if (state.mode === 'title' || state.mode === 'over') {
    if (key === 'Enter' || key === ' ') startGame();
    return;
  }
  if (state.mode !== 'playing') return;
  if (key === 'Enter') { servePlate(); return; }
  if (key === 'Backspace' || key === 'Delete') { trashPlate(); return; }
  if (key === 'g' || key === 'G') { collectGrill(); return; }
  const found = INGREDIENT_ORDER.find((id) => INGREDIENTS[id].key === key);
  if (found) addIngredient(found);
}

attachInput(canvas, { onTap, onKey });

// Opening board behind the title card, so the title shows a live kitchen.
if (!shotMode) {
  state.orders = [];
  state.plate = ['bun', 'patty'];
  state.grill = { ingredient: 'egg', progress: 0.4 };
  spawnOrder(); spawnOrder();
  state.mode = 'title';
}

let last = performance.now();
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  if (!shotMode) update(dt);
  else updateHint();
  drawScene(ctx, state, ui);
  if (shotMode && !window.__shotReady) window.__shotReady = true;
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
