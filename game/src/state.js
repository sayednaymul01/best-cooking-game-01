// state.js — the whole mutable game state plus a small seeded RNG so
// screenshot scenes and replays are deterministic for a given seed.

export function makeRng(seed) {
  let s = (seed >>> 0) || 1;
  return function rng() {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

export const SHIFT_SECONDS = 150;
export const MAX_ORDERS = 4;
export const GRILL_SECONDS = 2.6;

export function createState(seed) {
  return {
    mode: 'title', // title | playing | paused | over
    rng: makeRng(seed),
    seed,
    timeLeft: SHIFT_SECONDS,
    elapsed: 0,
    score: 0,
    coins: 0,
    combo: 0,
    bestCombo: 0,
    served: 0,
    missed: 0,
    orders: [],        // {id, recipe, timeLeft, timeMax, customer}
    plate: [],         // ingredient ids, bottom to top
    grill: null,       // {ingredient, progress} while something cooks
    readyPlates: [],   // finished dish ids waiting on the pass
    spawnTimer: 0,
    nextOrderId: 1,
    selectedBin: -1,
    flash: null,       // {text, color, t} floating feedback
    shake: 0,
    message: '',
  };
}

export const CUSTOMER_NAMES = ['Mia', 'Leo', 'Ava', 'Noah', 'Zoe', 'Eli', 'Ivy', 'Sam', 'Rue', 'Kai'];
export const CUSTOMER_COLORS = ['#f2b8c6', '#a8d8f0', '#ffe08a', '#b5e3a8', '#d9c2f0', '#ffb59a'];

export function difficultyAt(elapsed) {
  // Returns spawn interval and how many orders may sit on the board.
  const level = Math.floor(elapsed / 30);
  return {
    level,
    spawnEvery: Math.max(3.2, 7.5 - level * 0.9),
    maxOrders: Math.min(MAX_ORDERS, 2 + Math.floor(level / 1)),
    timeScale: Math.max(0.72, 1 - level * 0.05),
  };
}
