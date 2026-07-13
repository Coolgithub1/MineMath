import { STICKERS } from './stickers.js';
import { playBossFanfare, playStickerUnlock, playPowerUp, playBiomeWhoosh } from './audio.js';
import { burstAt } from './fx.js';

const TAUNTS = [
  'You can’t math me!',
  'Is that your best?',
  'Hehehe… numbers!',
  'Come on, brain hero!',
  'I eat homework!',
  'Try me, kid!',
  'Wrong answers taste yummy!',
  'Math? Never heard of it!',
  'Boop your brain!',
  'I dare you…',
];

function spawn(el, ms) {
  document.body.appendChild(el);
  setTimeout(() => el.remove(), ms);
}

export function applyBiome(root, biome) {
  const app = root?.closest?.('#app') || document.querySelector('#app');
  if (!app) return;
  app.classList.remove('biome-plains', 'biome-snow', 'biome-nether');
  app.classList.add(`biome-${biome || 'plains'}`);
}

export function showMobTaunt(mobFighter) {
  if (!mobFighter) return;
  mobFighter.querySelectorAll('.mob-taunt').forEach((n) => n.remove());
  const bubble = document.createElement('div');
  bubble.className = 'mob-taunt';
  bubble.textContent = TAUNTS[Math.floor(Math.random() * TAUNTS.length)];
  mobFighter.appendChild(bubble);
  setTimeout(() => bubble.classList.add('show'), 30);
  setTimeout(() => {
    bubble.classList.remove('show');
    setTimeout(() => bubble.remove(), 300);
  }, 2800);
}

export function typingJuice(inputEl) {
  if (!inputEl) return;
  const r = inputEl.getBoundingClientRect();
  const x = r.left + 24 + Math.random() * Math.max(20, r.width - 48);
  const y = r.top + r.height / 2;
  burstAt(x, y, {
    count: 4,
    kinds: ['spark', 'star'],
    spread: 36,
  });
  const chip = document.createElement('div');
  chip.className = 'type-block';
  chip.style.left = `${x}px`;
  chip.style.top = `${y}px`;
  spawn(chip, 450);
}

export function showBossIntro(mobName) {
  return new Promise((resolve) => {
    playBossFanfare();
    const el = document.createElement('div');
    el.className = 'boss-intro';
    el.innerHTML = `
      <div class="boss-intro-flash"></div>
      <div class="boss-intro-plate mc-border">
        <div class="boss-intro-eyebrow">NEW CHALLENGER</div>
        <div class="boss-intro-name">${mobName}</div>
      </div>
    `;
    document.body.appendChild(el);
    requestAnimationFrame(() => el.classList.add('show'));
    setTimeout(() => {
      el.classList.remove('show');
      setTimeout(() => {
        el.remove();
        resolve();
      }, 250);
    }, 1600);
  });
}

export function showVictoryDance(kind = 'spin') {
  const label = {
    robot: 'ROBOT DANCE!',
    spin: 'SPIN JUMP!',
    highfive: 'HIGH FIVE THE SUN!',
  }[kind] || 'DANCE PARTY!';
  const el = document.createElement('div');
  el.className = `victory-dance-banner dance-${kind}`;
  el.textContent = label;
  spawn(el, 1600);
}

export function showPowerUpOffer() {
  return new Promise((resolve) => {
    playPowerUp();
    const overlay = document.createElement('div');
    overlay.className = 'powerup-overlay';
    overlay.innerHTML = `
      <div class="powerup-panel mc-border">
        <h2 class="powerup-title">Bonus Power-Up!</h2>
        <p class="powerup-hint">Pick one — or skip</p>
        <div class="powerup-choices">
          <button type="button" class="powerup-card mc-border" data-kind="doubleHit">
            <div class="powerup-icon">💥</div>
            <div class="powerup-name">Double Hit</div>
            <div class="powerup-meta">Next hit does 2× damage</div>
          </button>
          <button type="button" class="powerup-card powerup-card--golden mc-border" data-kind="goldenApple">
            <div class="powerup-icon">🍎</div>
            <div class="powerup-name">Golden Apple</div>
            <div class="powerup-meta">Super shiny — block the next wrong answer</div>
          </button>
        </div>
        <button type="button" class="mc-btn powerup-skip" data-kind="">Skip</button>
      </div>
    `;
    document.body.appendChild(overlay);
    requestAnimationFrame(() => overlay.classList.add('open'));

    const finish = (kind) => {
      overlay.classList.remove('open');
      setTimeout(() => overlay.remove(), 200);
      resolve(kind || null);
    };

    overlay.querySelectorAll('[data-kind]').forEach((btn) => {
      btn.addEventListener('click', () => finish(btn.getAttribute('data-kind')));
    });
  });
}

export function showStickerToast(stickerId) {
  const sticker = STICKERS.find((s) => s.id === stickerId);
  if (!sticker) return;
  playStickerUnlock();
  const el = document.createElement('div');
  el.className = 'sticker-toast mc-border';
  el.innerHTML = `
    <div class="sticker-toast-emoji">${sticker.emoji}</div>
    <div>
      <div class="sticker-toast-title">Sticker unlocked!</div>
      <div class="sticker-toast-name">${sticker.name}</div>
    </div>
  `;
  spawn(el, 2400);
}

export function announceBiome(biome) {
  playBiomeWhoosh(biome);
  const names = { plains: 'Plains', snow: 'Snow Biome!', nether: 'Nether Realm!' };
  const el = document.createElement('div');
  el.className = `biome-announce biome-tag-${biome}`;
  el.textContent = names[biome] || biome;
  spawn(el, 1800);
}

export function createStickerBook(root) {
  const overlay = root.querySelector('#sticker-overlay');
  const grid = root.querySelector('#sticker-grid');
  const closeBtn = root.querySelector('#sticker-close');

  function render(ownedIds) {
    const owned = new Set(ownedIds || []);
    grid.innerHTML = '';
    STICKERS.forEach((s) => {
      const card = document.createElement('div');
      const unlocked = owned.has(s.id);
      card.className = `sticker-card mc-border${unlocked ? ' unlocked' : ' locked'}`;
      card.innerHTML = `
        <div class="sticker-emoji">${unlocked ? s.emoji : '❓'}</div>
        <div class="sticker-name">${unlocked ? s.name : '???'}</div>
        <div class="sticker-desc">${unlocked ? s.desc : 'Keep playing!'}</div>
      `;
      grid.appendChild(card);
    });
  }

  function open(ownedIds) {
    render(ownedIds);
    overlay.classList.add('open');
    overlay.setAttribute('aria-hidden', 'false');
  }

  function close() {
    overlay.classList.remove('open');
    overlay.setAttribute('aria-hidden', 'true');
  }

  closeBtn?.addEventListener('click', close);
  overlay?.addEventListener('click', (e) => {
    if (e.target === overlay) close();
  });

  return { open, close, render };
}
