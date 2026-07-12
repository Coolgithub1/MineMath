/**
 * Lightweight Minecraft-style screen FX: shake, flashes, particle bursts,
 * and big silly kid celebrations.
 */

const YAY_WORDS = [
  'YAY!!!',
  'WOOHOO!',
  'AWESOME!',
  'YOU DID IT!',
  'SUPERSTAR!',
  'BOOM!',
  'YES!!!',
  'MATH MAGIC!',
  'TA-DA!',
  'HIGH FIVE!',
];

const CONFETTI_COLORS = [
  '#ff5252', '#ffd54a', '#7dffb0', '#6eb5ff', '#ff8ad8',
  '#fff', '#ff8c20', '#c9b6ff', '#4AEDD9', '#f1c40f',
];

export function burstAt(x, y, { count = 10, kinds = ['emerald', 'star', 'spark'], spread = 90 } = {}) {
  for (let i = 0; i < count; i += 1) {
    const el = document.createElement('div');
    const kind = kinds[i % kinds.length];
    el.className = `fx-burst ${kind}`;
    const angle = (Math.PI * 2 * i) / count + Math.random() * 0.4;
    const dist = spread * (0.45 + Math.random() * 0.55);
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    el.style.setProperty('--dx', `${Math.cos(angle) * dist}px`);
    el.style.setProperty('--dy', `${Math.sin(angle) * dist}px`);
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 750);
  }
}

export function burstFromEl(el, opts) {
  if (!el) return;
  const r = el.getBoundingClientRect();
  burstAt(r.left + r.width / 2, r.top + r.height / 2, opts);
}

export function flashArena(kind = 'hit') {
  const arena = document.querySelector('#battle-arena');
  if (!arena) return;
  arena.classList.remove('shake', 'flash-hit', 'flash-hurt', 'party-mode');
  void arena.offsetWidth;
  arena.classList.add('shake', kind === 'hurt' ? 'flash-hurt' : 'flash-hit');
  if (kind === 'hit') arena.classList.add('party-mode');
  setTimeout(() => {
    arena.classList.remove('shake', 'flash-hit', 'flash-hurt', 'party-mode');
  }, 700);
}

export function popQuestion() {
  const q = document.querySelector('#question-text');
  if (!q) return;
  q.style.animation = 'none';
  void q.offsetWidth;
  q.style.animation = '';
}

function spawn(el, ms) {
  document.body.appendChild(el);
  setTimeout(() => el.remove(), ms);
}

/** Full-screen kid party: confetti, trumpets, balloons, yay text, rainbow. */
export function celebrateCorrect(opts = {}) {
  const streak = opts.streak || 0;
  const app = document.querySelector('#app');
  if (app) {
    app.classList.add('party-rainbow');
    setTimeout(() => app.classList.remove('party-rainbow'), 900);
  }

  const flash = document.createElement('div');
  flash.className = 'party-rainbow-flash';
  spawn(flash, 700);

  const yay = document.createElement('div');
  yay.className = 'party-yay';
  yay.textContent = YAY_WORDS[Math.floor(Math.random() * YAY_WORDS.length)];
  spawn(yay, 1200);

  if (streak >= 2) {
    const streakEl = document.createElement('div');
    streakEl.className = 'streak-banner';
    streakEl.textContent = streak >= 5 ? `${streak} STREAK!!! 🔥` : `${streak} in a row!`;
    spawn(streakEl, 1400);
  }

  for (let i = 0; i < 2; i += 1) {
    const trumpet = document.createElement('div');
    trumpet.className = `party-trumpet ${i === 0 ? 'left' : 'right'}`;
    trumpet.innerHTML = `
      <span class="trumpet-body"></span>
      <span class="trumpet-bell"></span>
      <span class="trumpet-note n1">♪</span>
      <span class="trumpet-note n2">♫</span>
      <span class="trumpet-note n3">♬</span>
    `;
    spawn(trumpet, 1400);
  }

  const confettiCount = 28 + Math.min(streak, 8) * 4;
  for (let i = 0; i < confettiCount; i += 1) {
    const bit = document.createElement('div');
    const shape = i % 4;
    bit.className = `party-confetti shape-${shape}`;
    bit.style.left = `${Math.random() * 100}vw`;
    bit.style.background = CONFETTI_COLORS[i % CONFETTI_COLORS.length];
    bit.style.setProperty('--fall', `${0.7 + Math.random() * 0.9}s`);
    bit.style.setProperty('--spin', `${(Math.random() * 720 - 360).toFixed(0)}deg`);
    bit.style.setProperty('--drift', `${(Math.random() * 80 - 40).toFixed(0)}px`);
    bit.style.animationDelay = `${Math.random() * 0.2}s`;
    spawn(bit, 1600);
  }

  for (let i = 0; i < 6 + Math.min(streak, 4); i += 1) {
    const balloon = document.createElement('div');
    balloon.className = 'party-balloon';
    balloon.style.left = `${8 + Math.random() * 84}vw`;
    balloon.style.setProperty('--balloon', CONFETTI_COLORS[i % CONFETTI_COLORS.length]);
    balloon.style.setProperty('--up', `${1.1 + Math.random() * 0.8}s`);
    balloon.style.animationDelay = `${Math.random() * 0.25}s`;
    spawn(balloon, 2000);
  }

  // Screen-edge sparkle rings
  for (let i = 0; i < 4; i += 1) {
    const ring = document.createElement('div');
    ring.className = 'party-ring';
    ring.style.left = `${15 + i * 22}%`;
    ring.style.top = `${25 + (i % 2) * 20}%`;
    spawn(ring, 900);
  }

  const cx = window.innerWidth / 2;
  const cy = window.innerHeight * 0.38;
  burstAt(cx, cy, {
    count: 26 + Math.min(streak, 6) * 2,
    kinds: ['star', 'emerald', 'spark', 'heart', 'diamond'],
    spread: 170,
  });
  burstAt(cx * 0.3, cy + 30, { count: 12, kinds: ['star', 'spark'], spread: 100 });
  burstAt(cx * 1.7, cy + 30, { count: 12, kinds: ['emerald', 'heart'], spread: 100 });
}
