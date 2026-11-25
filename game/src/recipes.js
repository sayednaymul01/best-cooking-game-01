// recipes.js — dish and ingredient data for Sizzle Street Kitchen.
// Every dish is an ordered list of ingredient steps. The player builds a
// plate step by step; a dish only counts when the plate matches exactly.

export const INGREDIENTS = {
  bun:     { id: 'bun',     name: 'Bun',     key: '1', color: '#e8a94e', dark: '#b97a2c' },
  patty:   { id: 'patty',   name: 'Patty',   key: '2', color: '#7a4322', dark: '#5a2d14', needsGrill: true },
  cheese:  { id: 'cheese',  name: 'Cheese',  key: '3', color: '#ffc93c', dark: '#e0a81e' },
  lettuce: { id: 'lettuce', name: 'Lettuce', key: '4', color: '#5fbf4d', dark: '#3f9431' },
  tomato:  { id: 'tomato',  name: 'Tomato',  key: '5', color: '#e8493f', dark: '#b92c24' },
  egg:     { id: 'egg',     name: 'Egg',     key: '6', color: '#fff3d6', dark: '#f2b63c', needsGrill: true },
  bacon:   { id: 'bacon',   name: 'Bacon',   key: '7', color: '#c65b4e', dark: '#96403a' },
  sauce:   { id: 'sauce',   name: 'Sauce',   key: '8', color: '#ff7a59', dark: '#d14e30' },
};

export const INGREDIENT_ORDER = ['bun', 'patty', 'cheese', 'lettuce', 'tomato', 'egg', 'bacon', 'sauce'];

export const RECIPES = [
  { id: 'classic-burger', name: 'Classic Burger', steps: ['bun', 'patty', 'cheese', 'lettuce'], price: 12, time: 34 },
  { id: 'double-stack',   name: 'Double Stack',   steps: ['bun', 'patty', 'cheese', 'patty', 'cheese', 'tomato'], price: 20, time: 44 },
  { id: 'garden-burger',  name: 'Garden Burger',  steps: ['bun', 'lettuce', 'tomato', 'cheese', 'sauce'], price: 14, time: 36 },
  { id: 'sunrise-bun',    name: 'Sunrise Bun',    steps: ['bun', 'egg', 'bacon', 'cheese'], price: 15, time: 38 },
  { id: 'blt-bun',        name: 'BLT Bun',        steps: ['bun', 'bacon', 'lettuce', 'tomato', 'sauce'], price: 16, time: 40 },
  { id: 'egg-tower',      name: 'Egg Tower',      steps: ['bun', 'egg', 'cheese', 'egg', 'lettuce'], price: 17, time: 42 },
  { id: 'saucy-classic',  name: 'Saucy Classic',  steps: ['bun', 'patty', 'sauce', 'lettuce', 'tomato'], price: 15, time: 38 },
  { id: 'full-house',     name: 'Full House',     steps: ['bun', 'patty', 'bacon', 'egg', 'cheese', 'lettuce'], price: 24, time: 52 },
];

export function recipeById(id) {
  return RECIPES.find((r) => r.id === id) || RECIPES[0];
}

export function stepsMatch(plateSteps, recipe) {
  if (plateSteps.length !== recipe.steps.length) return false;
  return recipe.steps.every((s, i) => s === plateSteps[i]);
}

export function nextNeededStep(plateSteps, recipe) {
  for (let i = 0; i < plateSteps.length; i++) {
    if (plateSteps[i] !== recipe.steps[i]) return null;
  }
  return recipe.steps[plateSteps.length] || null;
}
