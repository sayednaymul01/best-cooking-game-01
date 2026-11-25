// audio.js — tiny synthesized WebAudio bleeps. No audio files, no network:
// every sound is an oscillator blip created on the fly after a user gesture.

let ctx = null;

export function ensureAudio() {
  if (!ctx) {
    try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch { ctx = null; }
  }
  if (ctx && ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function blip(freq, dur, type, gain, when = 0) {
  const ac = ensureAudio();
  if (!ac) return;
  const t = ac.currentTime + when;
  const osc = ac.createOscillator();
  const g = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  g.gain.setValueAtTime(gain, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  osc.connect(g).connect(ac.destination);
  osc.start(t);
  osc.stop(t + dur + 0.02);
}

export const sfx = {
  add() { blip(520, 0.08, 'triangle', 0.12); },
  grill() { blip(180, 0.15, 'sawtooth', 0.05); blip(240, 0.12, 'sawtooth', 0.04, 0.05); },
  cooked() { blip(880, 0.1, 'sine', 0.12); blip(1174, 0.12, 'sine', 0.1, 0.07); },
  serve() { blip(660, 0.09, 'triangle', 0.12); blip(880, 0.09, 'triangle', 0.12, 0.08); blip(1320, 0.14, 'triangle', 0.12, 0.16); },
  trash() { blip(220, 0.12, 'square', 0.06); },
  bad() { blip(160, 0.2, 'square', 0.1); },
  expire() { blip(300, 0.16, 'square', 0.09); blip(200, 0.2, 'square', 0.09, 0.12); },
  click() { blip(700, 0.05, 'sine', 0.08); },
};
