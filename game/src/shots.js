// shots.js — deterministic screenshot staging. A ?shot=<name>&seed=<n>
// query freezes a hand-built mid-game scene so screenshots are real renders
// of the game itself, identical on every load.

import { createState } from './state.js';
import { recipeById } from './recipes.js';

function order(state, recipeId, timeLeft, custIdx) {
  const recipe = recipeById(recipeId);
  const names = ['Mia', 'Leo', 'Ava', 'Noah'];
  const colors = ['#f2b8c6', '#a8d8f0', '#ffe08a', '#b5e3a8'];
  const shirts = ['#e8493f', '#3f7fbf', '#f2a63c', '#5fbf4d'];
  return {
    id: state.nextOrderId++,
    recipe,
    timeLeft,
    timeMax: recipe.time,
    customer: { name: names[custIdx % 4], color: colors[custIdx % 4], shirt: shirts[custIdx % 4] },
  };
}

function baseRush(state) {
  state.mode = 'playing';
  state.timeLeft = 87;
  state.elapsed = 63;
  state.score = 340;
  state.coins = 58;
  state.combo = 3;
  state.bestCombo = 3;
  state.served = 5;
  state.orders = [
    order(state, 'classic-burger', 21, 0),
    order(state, 'sunrise-bun', 30, 1),
    order(state, 'garden-burger', 12, 2),
  ];
  state.plate = ['bun', 'patty', 'cheese'];
  state.grill = { ingredient: 'egg', progress: 0.55 };
  state.readyPlates = [recipeById('blt-bun')];
  return state;
}

export function stageShot(name, seed) {
  const state = createState(seed || 7);
  if (name === 'cover') {
    baseRush(state);
  } else if (name === 'rush') {
    baseRush(state);
    state.orders.push(order(state, 'double-stack', 38, 3));
    state.plate = ['bun', 'lettuce', 'tomato'];
    state.grill = { ingredient: 'patty', progress: 0.8 };
    state.readyPlates = [recipeById('classic-burger'), recipeById('sunrise-bun')];
    state.score = 520;
    state.combo = 4;
    state.timeLeft = 64;
    state.flash = { text: 'Lunch rush — keep up!', color: '#e8493f', t: 0.2 };
  } else if (name === 'assembly') {
    baseRush(state);
    state.plate = ['bun', 'patty'];
    state.grill = { ingredient: 'patty', progress: 1 };
    state.readyPlates = [];
    state.combo = 2;
    state.flash = null;
  } else if (name === 'end') {
    baseRush(state);
    state.mode = 'over';
    state.score = 815;
    state.coins = 143;
    state.served = 12;
    state.missed = 2;
    state.bestCombo = 6;
    state.timeLeft = 0;
  } else {
    return null;
  }
  return state;
}

export function parseShotQuery() {
  const params = new URLSearchParams(window.location.search);
  const shot = params.get('shot');
  if (!shot) return null;
  return { name: shot, seed: Number(params.get('seed') || 7) };
}
