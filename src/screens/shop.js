import {
  WEAPONS,
  COSMETICS,
  getState,
  buyWeapon,
  buyCosmetic,
  resetProgress,
} from '../game/state.js';
import { unlockAudio, playClick, playEquip } from '../game/audio.js';

/** Wardrobe: equip gear you’ve already unlocked. */
export function createShop(root, { onClose, onEquip, onReset }) {
  const overlay = root.querySelector('#shop-overlay');
  const list = root.querySelector('#shop-list');
  const closeBtn = root.querySelector('#shop-close');
  const resetBtn = root.querySelector('#reset-btn');
  const tabs = root.querySelector('#shop-tabs');
  let tab = 'weapons';

  function renderWeapons() {
    const s = getState();
    WEAPONS.forEach((weapon) => {
      const owned = s.ownedWeapons.includes(weapon.id);
      const equipped = s.equipped === weapon.id;
      const item = document.createElement('div');
      item.className = `shop-item${owned ? ' owned' : ' locked'}${equipped ? ' equipped' : ''}`;
      let label = 'Locked';
      let disabled = true;
      let cls = '';
      if (equipped) {
        label = 'Equipped';
      } else if (owned) {
        label = 'Equip';
        disabled = false;
        cls = 'primary';
      }
      const dmgLabel = weapon.oneShot || !Number.isFinite(weapon.damage)
        ? '∞ ONE SHOT'
        : `${weapon.damage} damage`;
      const unlockHint = weapon.cheat
        ? 'Tap the rainbow OP button!'
        : 'Unlock by answering correctly!';
      item.innerHTML = `
        <div class="sword-swatch" aria-hidden="true">
          <span style="background:${weapon.color}; box-shadow: 2px 0 0 ${weapon.tip}"></span>
        </div>
        <div class="shop-item-info">
          <h3>${weapon.name}</h3>
          <p>${owned ? (equipped ? `${dmgLabel} — ready!` : 'Unlocked!') : unlockHint}</p>
        </div>
        <button type="button" class="mc-btn ${cls}" ${disabled ? 'disabled' : ''}>${label}</button>
      `;
      item.querySelector('button').addEventListener('click', async () => {
        await unlockAudio();
        playClick();
        const result = buyWeapon(weapon.id);
        if (!result.ok) return;
        playEquip();
        onEquip?.();
        render();
      });
      list.appendChild(item);
    });
  }

  function renderCosmetics() {
    const s = getState();
    const slots = [
      { key: 'hat', title: 'Hats' },
      { key: 'cape', title: 'Capes' },
      { key: 'accessory', title: 'Extras' },
    ];

    slots.forEach((slot) => {
      const heading = document.createElement('div');
      heading.className = 'shop-section-title';
      heading.textContent = slot.title;
      list.appendChild(heading);

      COSMETICS.filter((c) => c.slot === slot.key).forEach((cosmetic) => {
        const owned = s.ownedCosmetics.includes(cosmetic.id);
        const equipped = s[slot.key] === cosmetic.id;
        const item = document.createElement('div');
        item.className = `shop-item${owned ? ' owned' : ' locked'}${equipped ? ' equipped' : ''}`;
        const swatch = cosmetic.color || '#888';
        let label = 'Locked';
        let disabled = true;
        let cls = '';
        if (equipped) {
          label = 'Equipped';
        } else if (owned) {
          label = 'Equip';
          disabled = false;
          cls = 'primary';
        }
        item.innerHTML = `
          <div class="sword-swatch cosmetic-swatch" aria-hidden="true" style="background:${swatch}"></div>
          <div class="shop-item-info">
            <h3>${cosmetic.name}</h3>
            <p>${owned ? (equipped ? 'Looking cool!' : 'Unlocked!') : 'Unlock by answering correctly!'}</p>
          </div>
          <button type="button" class="mc-btn ${cls}" ${disabled ? 'disabled' : ''}>${label}</button>
        `;
        item.querySelector('button').addEventListener('click', async () => {
          await unlockAudio();
          playClick();
          const result = buyCosmetic(cosmetic.id);
          if (!result.ok) return;
          playEquip();
          onEquip?.();
          render();
        });
        list.appendChild(item);
      });
    });
  }

  function render() {
    list.innerHTML = '';
    if (tabs) {
      tabs.querySelectorAll('.shop-tab').forEach((btn) => {
        btn.classList.toggle('active', btn.dataset.tab === tab);
      });
    }
    if (tab === 'cosmetics') renderCosmetics();
    else renderWeapons();
  }

  if (tabs) {
    tabs.addEventListener('click', (e) => {
      const btn = e.target.closest('.shop-tab');
      if (!btn) return;
      tab = btn.dataset.tab;
      playClick();
      render();
    });
  }

  function open() {
    overlay.classList.add('open');
    overlay.setAttribute('aria-hidden', 'false');
    render();
  }

  function close() {
    overlay.classList.remove('open');
    overlay.setAttribute('aria-hidden', 'true');
    onClose?.();
  }

  closeBtn.addEventListener('click', async () => {
    await unlockAudio();
    playClick();
    close();
  });

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) close();
  });

  resetBtn.addEventListener('click', async () => {
    await unlockAudio();
    playClick();
    const ok = window.confirm('Start a new adventure? This clears unlocked gear and cosmetics.');
    if (!ok) return;
    resetProgress();
    onEquip?.();
    onReset?.();
    render();
  });

  return { open, close, render };
}
