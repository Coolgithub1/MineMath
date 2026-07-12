/** Collectible sticker catalog for MineMath achievements. */

export const STICKERS = [
  { id: 'first_win', name: 'First Win!', emoji: '⭐', desc: 'Get your first answer right' },
  { id: 'streak_3', name: 'Hot Streak', emoji: '🔥', desc: '3 correct in a row' },
  { id: 'streak_5', name: 'On Fire', emoji: '🚀', desc: '5 correct in a row' },
  { id: 'streak_10', name: 'Unstoppable', emoji: '💥', desc: '10 correct in a row' },
  { id: 'creeper_beat', name: 'Boom Dodger', emoji: '💣', desc: 'Defeat a creeper' },
  { id: 'skeleton_beat', name: 'Bone Breaker', emoji: '🏹', desc: 'Defeat a skeleton' },
  { id: 'enderman_beat', name: 'Ender Champ', emoji: '👁', desc: 'Defeat an enderman' },
  { id: 'zombie_beat', name: 'Zombie Zapper', emoji: '🧟', desc: 'Defeat a zombie' },
  { id: 'first_sword', name: 'Sword Collector', emoji: '⚔', desc: 'Unlock a new sword' },
  { id: 'first_cosmetic', name: 'Fashion Hero', emoji: '👑', desc: 'Unlock a cosmetic' },
  { id: 'shield_use', name: 'Safe Heart', emoji: '🛡', desc: 'Block a hit with a shield' },
  { id: 'double_hit', name: 'Power Punch', emoji: '💪', desc: 'Land a double hit' },
  { id: 'snow_biome', name: 'Snow Day', emoji: '❄', desc: 'Reach the snow biome' },
  { id: 'nether_biome', name: 'Nether Ready', emoji: '🌋', desc: 'Reach the nether biome' },
  { id: 'dance_party', name: 'Dance Party', emoji: '💃', desc: 'Trigger a victory dance' },
];

/**
 * Check progress events and unlock any newly earned stickers.
 * @returns {string[]} newly unlocked sticker ids
 */
export function evaluateStickers(events, { hasSticker, unlockSticker }) {
  const earned = [];
  const tryUnlock = (id, cond) => {
    if (!cond || hasSticker(id)) return;
    const r = unlockSticker(id);
    if (r.ok) earned.push(id);
  };

  tryUnlock('first_win', events.totalCorrect >= 1);
  tryUnlock('streak_3', events.streak >= 3);
  tryUnlock('streak_5', events.streak >= 5);
  tryUnlock('streak_10', events.streak >= 10);
  tryUnlock('creeper_beat', events.defeatedMob === 'creeper');
  tryUnlock('skeleton_beat', events.defeatedMob === 'skeleton' || events.defeatedMob === 'wither_skel');
  tryUnlock('enderman_beat', events.defeatedMob === 'enderman');
  tryUnlock('zombie_beat', events.defeatedMob === 'zombie' || events.defeatedMob === 'giant');
  tryUnlock('first_sword', events.unlockedSword);
  tryUnlock('first_cosmetic', events.unlockedCosmetic);
  tryUnlock('shield_use', events.usedShield);
  tryUnlock('double_hit', events.usedDoubleHit);
  tryUnlock('snow_biome', events.biome === 'snow' || events.biome === 'nether');
  tryUnlock('nether_biome', events.biome === 'nether');
  tryUnlock('dance_party', events.victoryDance);

  return earned;
}
