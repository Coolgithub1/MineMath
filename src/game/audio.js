import { getState } from './state.js';

let ctx = null;

function ensureCtx() {
  if (ctx) return ctx;
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) return null;
  ctx = new AudioCtx();
  return ctx;
}

export async function unlockAudio() {
  const c = ensureCtx();
  if (!c) return;
  if (c.state === 'suspended') {
    try {
      await c.resume();
    } catch {
      /* ignore */
    }
  }
}

function canPlay() {
  if (getState().muted) return false;
  return Boolean(ensureCtx());
}

function tone({ freq = 440, type = 'square', duration = 0.12, gain = 0.08, slideTo = null, delay = 0 }) {
  if (!canPlay()) return;
  const c = ctx;
  const t0 = c.currentTime + delay;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (slideTo != null) {
    osc.frequency.exponentialRampToValueAtTime(Math.max(1, slideTo), t0 + duration);
  }
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(gain, t0 + 0.015);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
  osc.connect(g);
  g.connect(c.destination);
  osc.start(t0);
  osc.stop(t0 + duration + 0.02);
}

function noiseBurst({ duration = 0.08, gain = 0.05, delay = 0 }) {
  if (!canPlay()) return;
  const c = ctx;
  const t0 = c.currentTime + delay;
  const bufferSize = Math.floor(c.sampleRate * duration);
  const buffer = c.createBuffer(1, bufferSize, c.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i += 1) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
  }
  const src = c.createBufferSource();
  src.buffer = buffer;
  const g = c.createGain();
  const filter = c.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = 800;
  g.gain.setValueAtTime(gain, t0);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
  src.connect(filter);
  filter.connect(g);
  g.connect(c.destination);
  src.start(t0);
  src.stop(t0 + duration + 0.02);
}

export function playClick() {
  tone({ freq: 220, type: 'square', duration: 0.06, gain: 0.05 });
  noiseBurst({ duration: 0.04, gain: 0.03 });
}

export function playCorrect() {
  // Happy chime
  tone({ freq: 523, type: 'square', duration: 0.1, gain: 0.07 });
  tone({ freq: 659, type: 'square', duration: 0.12, gain: 0.07, delay: 0.08 });
  tone({ freq: 784, type: 'square', duration: 0.16, gain: 0.06, delay: 0.16 });
  playTrumpetFanfare();
}

/** Silly brass fanfare — ta-daaa! */
export function playTrumpetFanfare() {
  if (!canPlay()) return;
  const notes = [
    { f: 392, d: 0.12, delay: 0.05, g: 0.09 },
    { f: 523, d: 0.12, delay: 0.16, g: 0.09 },
    { f: 659, d: 0.12, delay: 0.27, g: 0.1 },
    { f: 784, d: 0.28, delay: 0.38, g: 0.11 },
    { f: 659, d: 0.1, delay: 0.68, g: 0.08 },
    { f: 784, d: 0.35, delay: 0.78, g: 0.12 },
  ];
  notes.forEach((n) => {
    // Brass-ish: saw + square stack
    tone({ freq: n.f, type: 'sawtooth', duration: n.d, gain: n.g * 0.55, delay: n.delay });
    tone({ freq: n.f, type: 'square', duration: n.d, gain: n.g * 0.45, delay: n.delay });
    tone({ freq: n.f * 2, type: 'triangle', duration: n.d * 0.7, gain: n.g * 0.25, delay: n.delay + 0.02 });
  });
  // Little spit/noise attack like a real trumpet
  noiseBurst({ duration: 0.05, gain: 0.035, delay: 0.05 });
  noiseBurst({ duration: 0.04, gain: 0.03, delay: 0.38 });
}

export function playPartyPop() {
  noiseBurst({ duration: 0.12, gain: 0.06 });
  tone({ freq: 880, type: 'triangle', duration: 0.1, gain: 0.05, delay: 0.02 });
  tone({ freq: 1320, type: 'triangle', duration: 0.12, gain: 0.045, delay: 0.08 });
  tone({ freq: 1760, type: 'triangle', duration: 0.14, gain: 0.04, delay: 0.14 });
}

export function playWrong() {
  tone({ freq: 180, type: 'sawtooth', duration: 0.18, gain: 0.05, slideTo: 90 });
  noiseBurst({ duration: 0.1, gain: 0.04 });
}

export function playEmerald() {
  tone({ freq: 880, type: 'triangle', duration: 0.1, gain: 0.06 });
  tone({ freq: 1175, type: 'triangle', duration: 0.14, gain: 0.05, delay: 0.07 });
}

export function playEquip() {
  noiseBurst({ duration: 0.06, gain: 0.04 });
  tone({ freq: 300, type: 'square', duration: 0.08, gain: 0.05, delay: 0.02 });
  tone({ freq: 450, type: 'square', duration: 0.1, gain: 0.05, delay: 0.1 });
}

export function playBuy() {
  playEquip();
  tone({ freq: 660, type: 'triangle', duration: 0.12, gain: 0.06, delay: 0.18 });
  tone({ freq: 880, type: 'triangle', duration: 0.16, gain: 0.05, delay: 0.28 });
}

export function playLevelUp() {
  [523, 659, 784, 1046].forEach((f, i) => {
    tone({ freq: f, type: 'square', duration: 0.12, gain: 0.06, delay: i * 0.09 });
  });
}

export function playHit() {
  noiseBurst({ duration: 0.08, gain: 0.06 });
  tone({ freq: 160, type: 'square', duration: 0.1, gain: 0.06, slideTo: 80 });
}

export function playWhoosh() {
  noiseBurst({ duration: 0.14, gain: 0.045 });
  tone({ freq: 280, type: 'triangle', duration: 0.16, gain: 0.04, slideTo: 140 });
}

export function playBolt() {
  tone({ freq: 520, type: 'sawtooth', duration: 0.12, gain: 0.07, slideTo: 880 });
  tone({ freq: 780, type: 'square', duration: 0.18, gain: 0.05, delay: 0.05, slideTo: 420 });
  noiseBurst({ duration: 0.1, gain: 0.04, delay: 0.02 });
}

export function playHurt() {
  tone({ freq: 220, type: 'sawtooth', duration: 0.14, gain: 0.06, slideTo: 110 });
  noiseBurst({ duration: 0.12, gain: 0.05, delay: 0.02 });
}

export function playMobDefeat() {
  playHit();
  tone({ freq: 392, type: 'square', duration: 0.12, gain: 0.06, delay: 0.1 });
  tone({ freq: 523, type: 'square', duration: 0.16, gain: 0.06, delay: 0.2 });
}

/** Classic creeper fuse hiss */
export function playCreeperHiss() {
  if (!canPlay()) return;
  const c = ctx;
  const t0 = c.currentTime;
  const duration = 0.85;
  const bufferSize = Math.floor(c.sampleRate * duration);
  const buffer = c.createBuffer(1, bufferSize, c.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i += 1) {
    const p = i / bufferSize;
    data[i] = (Math.random() * 2 - 1) * (0.35 + p * 0.65);
  }
  const src = c.createBufferSource();
  src.buffer = buffer;
  const filter = c.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(900, t0);
  filter.frequency.exponentialRampToValueAtTime(2200, t0 + duration);
  filter.Q.value = 4;
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(0.09, t0 + 0.08);
  g.gain.exponentialRampToValueAtTime(0.12, t0 + duration * 0.7);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
  src.connect(filter);
  filter.connect(g);
  g.connect(c.destination);
  src.start(t0);
  src.stop(t0 + duration + 0.02);
}

export function playCreeperExplode() {
  noiseBurst({ duration: 0.35, gain: 0.14 });
  noiseBurst({ duration: 0.25, gain: 0.1, delay: 0.05 });
  tone({ freq: 80, type: 'sawtooth', duration: 0.28, gain: 0.1, slideTo: 40 });
  tone({ freq: 120, type: 'square', duration: 0.2, gain: 0.07, delay: 0.04, slideTo: 50 });
}

/** Groany zombie moan */
export function playZombieMoan() {
  tone({ freq: 110, type: 'sawtooth', duration: 0.35, gain: 0.08, slideTo: 70 });
  tone({ freq: 90, type: 'square', duration: 0.28, gain: 0.05, delay: 0.08, slideTo: 60 });
  noiseBurst({ duration: 0.2, gain: 0.04, delay: 0.05 });
  tone({ freq: 140, type: 'sawtooth', duration: 0.18, gain: 0.05, delay: 0.28, slideTo: 95 });
}

/** Weird ender chirp / warp */
export function playEndermanNoise() {
  tone({ freq: 880, type: 'sawtooth', duration: 0.12, gain: 0.06, slideTo: 220 });
  tone({ freq: 1320, type: 'square', duration: 0.1, gain: 0.045, delay: 0.06, slideTo: 400 });
  tone({ freq: 600, type: 'triangle', duration: 0.16, gain: 0.05, delay: 0.12, slideTo: 1400 });
  noiseBurst({ duration: 0.1, gain: 0.04, delay: 0.02 });
}

export function playEndermanTeleport() {
  tone({ freq: 1400, type: 'square', duration: 0.08, gain: 0.05, slideTo: 280 });
  tone({ freq: 900, type: 'sawtooth', duration: 0.1, gain: 0.04, delay: 0.04, slideTo: 1800 });
  noiseBurst({ duration: 0.12, gain: 0.05 });
}

/** Bow string + arrow flight */
export function playSkeletonShoot() {
  noiseBurst({ duration: 0.06, gain: 0.04 });
  tone({ freq: 420, type: 'triangle', duration: 0.08, gain: 0.05, slideTo: 180 });
  tone({ freq: 900, type: 'square', duration: 0.14, gain: 0.045, delay: 0.05, slideTo: 500 });
  noiseBurst({ duration: 0.1, gain: 0.03, delay: 0.06 });
}

/** Soft looping adventure bed — stimulating but not rushed. */
let ambientNodes = null;
let ambientTimer = null;
let ambientBiome = 'plains';

export function startAmbient(biome = 'plains') {
  stopAmbient();
  if (!canPlay()) return;
  const c = ensureCtx();
  if (!c) return;
  ambientBiome = biome || 'plains';

  const master = c.createGain();
  master.gain.value = ambientBiome === 'nether' ? 0.034 : 0.028;
  master.connect(c.destination);

  const freqs = ambientBiome === 'nether'
    ? [110, 147, 165]
    : ambientBiome === 'snow'
      ? [262, 330, 392]
      : [196, 247, 294];

  const drones = freqs.map((freq, i) => {
    const osc = c.createOscillator();
    const g = c.createGain();
    osc.type = ambientBiome === 'nether' ? 'sawtooth' : i === 1 ? 'triangle' : 'sine';
    osc.frequency.value = freq;
    g.gain.value = ambientBiome === 'nether' ? 0.22 - i * 0.05 : 0.35 - i * 0.08;
    osc.connect(g);
    g.connect(master);
    osc.start();
    return { osc, g };
  });

  ambientNodes = { master, drones };

  const twinkle = () => {
    if (!canPlay() || !ambientNodes) return;
    const notes = ambientBiome === 'nether'
      ? [220, 277, 330]
      : ambientBiome === 'snow'
        ? [659, 784, 988, 1175]
        : [523, 659, 784, 880, 1046];
    const f = notes[Math.floor(Math.random() * notes.length)];
    tone({ freq: f, type: 'triangle', duration: 0.35, gain: 0.03 });
    ambientTimer = setTimeout(twinkle, 1800 + Math.random() * 2800);
  };
  ambientTimer = setTimeout(twinkle, 1200);
}

export function setAmbientBiome(biome) {
  if (biome === ambientBiome && ambientNodes) return;
  startAmbient(biome);
}

export function stopAmbient() {
  if (ambientTimer) clearTimeout(ambientTimer);
  ambientTimer = null;
  if (ambientNodes) {
    ambientNodes.drones.forEach(({ osc }) => {
      try { osc.stop(); } catch { /* ignore */ }
    });
    ambientNodes = null;
  }
}

export function playStreakFanfare(streak) {
  const base = Math.min(streak, 10);
  for (let i = 0; i < Math.min(base, 5); i += 1) {
    tone({
      freq: 440 + i * 90,
      type: 'square',
      duration: 0.08,
      gain: 0.045,
      delay: i * 0.05,
    });
  }
}

/** Crowd cheer that stacks with streak size */
export function playCheer(streak = 1) {
  const voices = Math.min(1 + Math.floor(streak / 2), 6);
  for (let i = 0; i < voices; i += 1) {
    const f = 320 + Math.random() * 280;
    tone({
      freq: f,
      type: 'sawtooth',
      duration: 0.18 + Math.random() * 0.12,
      gain: 0.025,
      delay: i * 0.03,
      slideTo: f * (1.2 + Math.random() * 0.3),
    });
  }
  noiseBurst({ duration: 0.15, gain: 0.03 });
}

export function playParrotSquawk() {
  tone({ freq: 980, type: 'square', duration: 0.08, gain: 0.07, slideTo: 1400 });
  tone({ freq: 1200, type: 'sawtooth', duration: 0.1, gain: 0.05, delay: 0.07, slideTo: 700 });
  noiseBurst({ duration: 0.06, gain: 0.03, delay: 0.02 });
}

export function playBossFanfare() {
  [196, 247, 294, 392, 523].forEach((f, i) => {
    tone({ freq: f, type: 'square', duration: 0.14, gain: 0.07, delay: i * 0.1 });
    tone({ freq: f * 2, type: 'triangle', duration: 0.12, gain: 0.035, delay: i * 0.1 + 0.02 });
  });
  noiseBurst({ duration: 0.12, gain: 0.05, delay: 0.4 });
}

export function playPowerUp() {
  [523, 659, 784, 1046].forEach((f, i) => {
    tone({ freq: f, type: 'triangle', duration: 0.1, gain: 0.055, delay: i * 0.07 });
  });
}

export function playStickerUnlock() {
  tone({ freq: 660, type: 'square', duration: 0.1, gain: 0.06 });
  tone({ freq: 880, type: 'triangle', duration: 0.14, gain: 0.055, delay: 0.08 });
  tone({ freq: 1175, type: 'triangle', duration: 0.18, gain: 0.05, delay: 0.16 });
}

export function playBiomeWhoosh(biome) {
  if (biome === 'snow') {
    noiseBurst({ duration: 0.25, gain: 0.05 });
    tone({ freq: 880, type: 'triangle', duration: 0.3, gain: 0.04, slideTo: 440 });
  } else if (biome === 'nether') {
    tone({ freq: 80, type: 'sawtooth', duration: 0.35, gain: 0.07, slideTo: 50 });
    noiseBurst({ duration: 0.3, gain: 0.06 });
  } else {
    tone({ freq: 392, type: 'triangle', duration: 0.25, gain: 0.04 });
  }
}
