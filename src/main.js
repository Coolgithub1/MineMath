import './style.css';
import {
  getSword,
  getEquippedCosmetics,
  getState,
  subscribe,
  toggleMute,
  resetProgress,
  equipOpRainbowSword,
} from './game/state.js';
import { unlockAudio, playClick, playPartyPop, startAmbient, playStreakFanfare, playParrotSquawk, setAmbientBiome, playEquip } from './game/audio.js';
import { createCharacterAnimator } from './render/character.js';
import { createMobAnimator } from './render/mob.js';
import { createPlayScreen, syncHud } from './screens/play.js';
import { createShop } from './screens/shop.js';
import { createRewardScreen } from './screens/reward.js';
import { createQuestionsEditor } from './screens/questions.js';
import { burstFromEl, flashArena, celebrateCorrect } from './game/fx.js';
import { playBattleSequence } from './game/battle.js';
import { createStickerBook, applyBiome } from './game/stim.js';

const app = document.querySelector('#app');

app.innerHTML = `
  <div class="world-fx" aria-hidden="true">
    <div class="sun"></div>
    <div class="cloud c1"></div>
    <div class="cloud c2"></div>
    <div class="cloud c3"></div>
    <div class="cloud c4"></div>
    <div class="hill h1"></div>
    <div class="hill h2"></div>
    <div class="hill h3"></div>
    <div class="hill h4"></div>
    <div class="sparkle s1"></div>
    <div class="sparkle s2"></div>
    <div class="sparkle s3"></div>
    <div class="sparkle s4"></div>
    <div class="sparkle s5"></div>
    <div class="firefly f1"></div>
    <div class="firefly f2"></div>
    <div class="firefly f3"></div>
    <div class="firefly f4"></div>
    <div class="firefly f5"></div>
    <div class="firefly f6"></div>
    <div class="butterfly b1"></div>
    <div class="butterfly b2"></div>
    <div class="torch t1"></div>
    <div class="torch t2"></div>
    <div class="block-row">
      ${Array.from({ length: 24 }, () => '<div class="pixel-block"></div>').join('')}
    </div>
  </div>

  <header class="hud">
    <div class="brand">MineMath</div>
    <div class="hud-stats">
      <div class="stat-pill mc-border" id="correct-pill">
        Correct <span id="correct-count">0</span>
      </div>
      <div class="stat-pill mc-border" id="streak-pill">
        Streak <span id="streak-count">0</span>
      </div>
      <div class="stat-pill mc-border power-pill hidden" id="power-status"></div>
      <div class="stat-pill mc-border" id="sticker-pill">
        ★ <span id="sticker-count">0</span>
      </div>
    </div>
    <div class="hud-actions">
      <button type="button" class="mc-btn op-rainbow-btn" id="op-sword-btn" title="Equip the OP Rainbow Sword — one-shot every mob!">
        <span class="op-rainbow-label">🌈 OP SWORD</span>
      </button>
      <button type="button" class="mc-btn" id="mute-btn">Sound: On</button>
      <button type="button" class="mc-btn" id="questions-btn">Questions</button>
      <button type="button" class="mc-btn" id="sticker-btn">Stickers</button>
      <button type="button" class="mc-btn primary" id="shop-btn">Wardrobe</button>
      <button type="button" class="mc-btn danger" id="restart-btn">Restart</button>
    </div>
  </header>

  <div class="battle-arena mc-border" id="battle-arena">
    <div class="fighter player-fighter">
      <div class="fighter-label">You</div>
      <div class="hearts" id="player-hearts" aria-label="Your hearts"></div>
      <canvas id="character-canvas" width="220" height="280" aria-label="Your adventurer"></canvas>
      <div class="equipped-label" id="equipped-name">Wood Sword</div>
      <div class="equipped-label cosmetic-line" id="cosmetic-label">No cosmetics</div>
    </div>
    <div class="battle-vs" aria-hidden="true">VS</div>
    <div class="fighter mob-fighter">
      <div class="fighter-label" id="mob-name">Zombie</div>
      <div class="hearts" id="mob-hearts" aria-label="Mob hearts"></div>
      <canvas id="mob-canvas" width="240" height="300" aria-label="Enemy mob"></canvas>
      <div class="equipped-label" id="mob-status">Enemy</div>
    </div>
  </div>

  <div class="main">
    <section class="play-panel">
      <div class="stage-chip mc-border" id="stage-chip">Your Equations</div>
      <div class="question-board mc-border">
        <p class="question-text" id="question-text">1 + 1 = ?</p>
      </div>
      <div class="feedback" id="feedback" aria-live="polite"></div>
      <p class="answers-label">Type your answer:</p>
      <form class="answer-form" id="answer-form" autocomplete="off">
        <input
          id="answer-input"
          class="answer-input"
          type="text"
          inputmode="numeric"
          pattern="-?[0-9]*"
          maxlength="5"
          enterkeyhint="done"
          aria-label="Type the answer"
          placeholder="?"
        />
        <button type="submit" class="mc-btn primary answer-submit" id="answer-submit">Check</button>
      </form>
    </section>
  </div>

  <div class="reward-overlay" id="reward-overlay" aria-hidden="true">
    <div class="reward-panel mc-border" role="dialog" aria-labelledby="reward-title">
      <h2 class="reward-title" id="reward-title">Pick a reward!</h2>
      <p class="reward-hint" id="reward-hint">Choose a new sword or cosmetic — it’s yours!</p>
      <div class="reward-choices" id="reward-choices"></div>
    </div>
  </div>

  <div class="wow-banner" id="wow-banner" aria-live="assertive">
    <div class="wow-flash" aria-hidden="true"></div>
    <p class="wow-text" id="wow-text">Wow!</p>
  </div>

  <div class="shop-overlay" id="shop-overlay" aria-hidden="true">
    <div class="shop-panel mc-border" role="dialog" aria-labelledby="shop-title">
      <div class="shop-header">
        <h2 class="shop-title" id="shop-title">Wardrobe</h2>
        <button type="button" class="mc-btn" id="shop-close">Close</button>
      </div>
      <div class="shop-tabs" id="shop-tabs">
        <button type="button" class="mc-btn shop-tab active" data-tab="weapons">Weapons</button>
        <button type="button" class="mc-btn shop-tab" data-tab="cosmetics">Cosmetics</button>
      </div>
      <p style="margin:0.65rem 0 0.75rem;font-weight:800;">Equip gear you’ve unlocked by answering correctly!</p>
      <div class="shop-list" id="shop-list"></div>
      <div class="shop-footer">
        <button type="button" class="mc-btn danger" id="reset-btn">New Game</button>
        <button type="button" class="mc-btn" id="shop-close-2">Keep Playing</button>
      </div>
    </div>
  </div>

  <div class="sticker-overlay" id="sticker-overlay" aria-hidden="true">
    <div class="sticker-panel mc-border" role="dialog" aria-labelledby="sticker-title">
      <div class="shop-header">
        <h2 class="shop-title" id="sticker-title">Sticker Book</h2>
        <button type="button" class="mc-btn" id="sticker-close">Close</button>
      </div>
      <p style="margin:0.5rem 0 0.85rem;font-weight:800;">Collect stickers by doing awesome things!</p>
      <div class="sticker-grid" id="sticker-grid"></div>
    </div>
  </div>

  <div class="shop-overlay" id="questions-overlay" aria-hidden="true">
    <div class="shop-panel questions-panel mc-border" role="dialog" aria-labelledby="questions-title">
      <div class="shop-header">
        <h2 class="shop-title" id="questions-title">Edit Questions</h2>
        <button type="button" class="mc-btn" id="questions-close">Close</button>
      </div>
      <p class="questions-intro">
        Add or remove the equations the game asks. It cycles through your list in order.
        You have <strong id="questions-count">0</strong> equations.
      </p>
      <div class="questions-list" id="questions-list"></div>
      <form class="questions-form" id="questions-form">
        <label class="questions-field">
          <span>First</span>
          <input id="q-a" class="answer-input questions-num" type="text" inputmode="numeric" maxlength="4" placeholder="15" required />
        </label>
        <label class="questions-field">
          <span>Op</span>
          <select id="q-op" class="questions-op" aria-label="Add or subtract">
            <option value="+">+</option>
            <option value="-">−</option>
          </select>
        </label>
        <label class="questions-field">
          <span>Second</span>
          <input id="q-b" class="answer-input questions-num" type="text" inputmode="numeric" maxlength="4" placeholder="23" required />
        </label>
        <button type="submit" class="mc-btn primary">Add</button>
      </form>
      <p class="questions-msg" id="questions-msg" aria-live="polite"></p>
      <div class="shop-footer">
        <button type="button" class="mc-btn" id="questions-reset">Restore Starter List</button>
        <button type="button" class="mc-btn primary" id="questions-close-2">Done</button>
      </div>
    </div>
  </div>
`;

app.querySelector('#shop-close-2').addEventListener('click', () => {
  app.querySelector('#shop-close').click();
});

const canvas = app.querySelector('#character-canvas');
const mobCanvas = app.querySelector('#mob-canvas');

const animator = createCharacterAnimator(canvas, () => ({
  sword: getSword(),
  cosmetics: getEquippedCosmetics(),
}));

const mobAnimator = createMobAnimator(mobCanvas, () => {
  const s = getState();
  return { mobType: s.mobType, scale: s.mobScale || 1 };
});

animator.start();
mobAnimator.start();

const stickerBook = createStickerBook(app);

const reward = createRewardScreen(app, {
  onUnlocked() {
    animator.equipFlash();
    animator.celebrate();
    animator.redraw();
    syncHud(app);
    burstFromEl(app.querySelector('#character-canvas'), {
      count: 14,
      kinds: ['star', 'spark', 'emerald'],
      spread: 110,
    });
  },
});

const play = createPlayScreen(app, {
  async runBattle(success) {
    await playBattleSequence({
      success,
      animator,
      mobAnimator,
      onPlayerHitMob() {
        mobAnimator.takeHit();
        flashArena('hit');
        burstFromEl(app.querySelector('#mob-canvas'), {
          count: 16,
          kinds: ['spark', 'star', 'diamond'],
          spread: 110,
        });
      },
      onMobCounter() {
        flashArena('hurt');
        burstFromEl(app.querySelector('#character-canvas'), {
          count: 10,
          kinds: ['red', 'spark'],
          spread: 70,
        });
        burstFromEl(app.querySelector('#mob-canvas'), {
          count: 8,
          kinds: ['red', 'spark'],
          spread: 60,
        });
      },
    });
  },
  onCelebrate(info = {}) {
    const streak = info.streak || getState().streak;
    if (info.victoryDance) {
      animator.victoryDance(info.victoryDance);
    } else {
      animator.celebrate();
    }
    if (info.hasCape) {
      app.querySelector('.player-fighter')?.classList.add('cape-flap');
      setTimeout(() => app.querySelector('.player-fighter')?.classList.remove('cape-flap'), 600);
      animator.capeFlap();
    }
    if (info.hasParrot) playParrotSquawk();
    flashArena('hit');
    celebrateCorrect({ streak });
    playPartyPop();
    if (streak >= 2) playStreakFanfare(streak);
    burstFromEl(app.querySelector('#character-canvas'), {
      count: 16 + Math.min(streak, 6) * 2,
      kinds: ['star', 'spark', 'emerald', 'heart'],
      spread: 120,
    });
  },
  onMobDefeat() {
    mobAnimator.defeat();
    flashArena('hit');
    burstFromEl(app.querySelector('#mob-canvas'), {
      count: 18,
      kinds: ['emerald', 'star', 'spark'],
      spread: 130,
    });
  },
  onBiomeChange(biome) {
    setAmbientBiome(biome);
  },
  openReward: () => reward.open(),
});

const shop = createShop(app, {
  onClose() {},
  onEquip() {
    animator.equipFlash();
    animator.redraw();
    syncHud(app);
    burstFromEl(app.querySelector('#character-canvas'), {
      count: 8,
      kinds: ['star', 'spark'],
      spread: 70,
    });
  },
  onReset() {
    applyBiome(app, 'plains');
    setAmbientBiome('plains');
    animator.redraw();
    mobAnimator.redraw();
    syncHud(app);
    play.start();
  },
});

const questionsEditor = createQuestionsEditor(app, {
  onChange() {
    play.refresh();
    syncHud(app);
  },
});

app.querySelector('#shop-btn').addEventListener('click', async () => {
  await unlockAudio();
  playClick();
  shop.open();
});

app.querySelector('#questions-btn').addEventListener('click', async () => {
  await unlockAudio();
  playClick();
  questionsEditor.open();
});

app.querySelector('#op-sword-btn').addEventListener('click', async () => {
  await unlockAudio();
  playClick();
  const result = equipOpRainbowSword();
  if (!result.ok) return;
  playEquip();
  playPartyPop();
  animator.equipFlash();
  animator.redraw();
  syncHud(app);
  celebrateCorrect({ streak: getState().streak || 1 });
  burstFromEl(app.querySelector('#character-canvas'), {
    count: 28,
    kinds: ['star', 'spark', 'diamond', 'heart', 'emerald'],
    spread: 150,
  });
  const feedback = app.querySelector('#feedback');
  if (feedback) {
    feedback.textContent = '🌈 OP Rainbow Sword equipped — ONE SHOT every mob!!';
    feedback.className = 'feedback bonus';
  }
});

app.querySelector('#sticker-btn').addEventListener('click', async () => {
  await unlockAudio();
  playClick();
  stickerBook.open(getState().stickers || []);
});

app.querySelector('#mute-btn').addEventListener('click', async () => {
  await unlockAudio();
  toggleMute();
  playClick();
  syncHud(app);
});

app.querySelector('#restart-btn').addEventListener('click', async () => {
  await unlockAudio();
  playClick();
  resetProgress();
  applyBiome(app, 'plains');
  setAmbientBiome('plains');
  animator.redraw();
  mobAnimator.redraw();
  syncHud(app);
  play.start();
});

const unlockOnce = async () => {
  await unlockAudio();
  startAmbient(getState().biome || 'plains');
  window.removeEventListener('pointerdown', unlockOnce);
};
window.addEventListener('pointerdown', unlockOnce);

subscribe(() => {
  syncHud(app);
  animator.redraw();
  mobAnimator.redraw();
});

applyBiome(app, getState().biome || 'plains');
syncHud(app);
play.start();
