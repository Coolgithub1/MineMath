import { getRewardChoices, unlockReward } from '../game/state.js';
import { unlockAudio, playClick, playBuy, playLevelUp } from '../game/audio.js';
import { burstAt } from '../game/fx.js';

/**
 * Big flash + pick-a-reward overlay after each correct answer.
 */
export function createRewardScreen(root, { onUnlocked }) {
  const overlay = root.querySelector('#reward-overlay');
  const titleEl = root.querySelector('#reward-title');
  const hintEl = root.querySelector('#reward-hint');
  const choicesEl = root.querySelector('#reward-choices');
  const wowEl = root.querySelector('#wow-banner');
  const wowText = root.querySelector('#wow-text');

  let pendingDone = null;
  let picking = false;

  function showWow(message) {
    wowText.textContent = message;
    wowEl.classList.add('show');
    playLevelUp();
    const rect = wowEl.getBoundingClientRect();
    burstAt(rect.left + rect.width / 2, rect.top + rect.height / 2, {
      count: 20,
      kinds: ['star', 'spark', 'emerald'],
      spread: 140,
    });
    return new Promise((resolve) => {
      setTimeout(() => {
        wowEl.classList.remove('show');
        resolve();
      }, 2200);
    });
  }

  function closePicker() {
    overlay.classList.remove('open');
    overlay.setAttribute('aria-hidden', 'true');
    choicesEl.innerHTML = '';
    picking = false;
  }

  function renderChoiceCard(reward) {
    const { type, item } = reward;
    const card = document.createElement('button');
    card.type = 'button';
    card.className = `reward-card mc-border ${type}`;
    const kindLabel = type === 'weapon' ? 'Sword' : 'Cosmetic';
    const color = item.color || '#888';
    const tip = item.tip || item.edge || color;

    if (type === 'weapon') {
      card.innerHTML = `
        <div class="reward-badge">${kindLabel}</div>
        <div class="sword-swatch reward-swatch" aria-hidden="true">
          <span style="background:${color}; box-shadow: 2px 0 0 ${tip}"></span>
        </div>
        <div class="reward-name">${item.name}</div>
        <div class="reward-meta">${item.oneShot || !Number.isFinite(item.damage) ? '∞ ONE SHOT' : `${item.damage} damage`}</div>
      `;
    } else {
      card.innerHTML = `
        <div class="reward-badge">${kindLabel}</div>
        <div class="sword-swatch cosmetic-swatch reward-swatch" aria-hidden="true" style="background:${color}"></div>
        <div class="reward-name">${item.name}</div>
        <div class="reward-meta">Looks awesome!</div>
      `;
    }

    card.addEventListener('click', async () => {
      if (picking) return;
      picking = true;
      await unlockAudio();
      playClick();
      playBuy();
      const result = unlockReward(type, item.id);
      closePicker();
      let info = {};
      if (result.ok) {
        onUnlocked?.(result);
        info = {
          unlockedSword: result.type === 'weapon',
          unlockedCosmetic: result.type === 'cosmetic',
        };
        const wowMsg = result.type === 'weapon'
          ? 'Wow, you unlocked a new sword!'
          : 'Wow, you unlocked a new cosmetic!';
        await showWow(wowMsg);
      }
      const done = pendingDone;
      pendingDone = null;
      done?.(info);
    });

    return card;
  }

  /**
   * Open the reward picker. Resolves when the player finishes (picked or no rewards left).
   */
  function open() {
    return new Promise(async (resolve) => {
      const choices = getRewardChoices(4);
      if (!choices.length) {
        await showWow('Wow! You already unlocked everything!');
        resolve({});
        return;
      }

      pendingDone = resolve;
      picking = false;
      titleEl.textContent = 'Pick a reward!';
      hintEl.textContent = 'Choose a new sword or cosmetic — it’s yours!';
      choicesEl.innerHTML = '';
      choices.forEach((reward) => choicesEl.appendChild(renderChoiceCard(reward)));
      overlay.classList.add('open');
      overlay.setAttribute('aria-hidden', 'false');
    });
  }

  return { open, showWow };
}
