import { DEFAULT_EQUATIONS } from './math.js';

const STORAGE_KEY = 'minemath-save-v6';
const OLD_KEYS = ['minemath-save-v1', 'minemath-save-v2', 'minemath-save-v3', 'minemath-save-v4', 'minemath-save-v5'];
const WIPE_ONCE_KEY = 'minemath-force-wipe-v6';

export const PLAYER_MAX_HEARTS = 5;

/** @typedef {'sword' | 'axe' | 'trident' | 'staff'} WeaponStyle */

export const WEAPONS = [
  { id: 'wood', name: 'Wood Sword', cost: 0, color: '#8B5A2B', edge: '#C4A484', tip: '#5C3A1E', damage: 1, style: 'sword' },
  { id: 'stone', name: 'Stone Sword', cost: 5, color: '#7A7A7A', edge: '#B0B0B0', tip: '#4A4A4A', damage: 1, style: 'sword' },
  { id: 'iron', name: 'Iron Sword', cost: 12, color: '#C8C8C8', edge: '#F0F0F0', tip: '#888888', damage: 1, style: 'sword' },
  { id: 'gold', name: 'Gold Sword', cost: 25, color: '#E8B923', edge: '#FFE566', tip: '#B8860B', damage: 1, style: 'sword' },
  { id: 'diamond', name: 'Diamond Sword', cost: 50, color: '#4AEDD9', edge: '#A8FFF4', tip: '#1A9A8A', damage: 2, style: 'sword' },
  { id: 'battle_axe', name: 'Battle Axe', cost: 65, color: '#A0A0A0', edge: '#E0E0E0', tip: '#5C3A1E', damage: 2, style: 'axe' },
  { id: 'enchanted', name: 'Enchanted Blade', cost: 80, color: '#7B5CFF', edge: '#C9B6FF', tip: '#3D2A9A', damage: 3, style: 'sword', glow: true },
  { id: 'netherite', name: 'Netherite Sword', cost: 110, color: '#4A3A3A', edge: '#8A7A6A', tip: '#2A1A1A', damage: 3, style: 'sword' },
  { id: 'trident', name: 'Trident', cost: 130, color: '#5AB0C8', edge: '#A8E8F8', tip: '#2A6070', damage: 3, style: 'trident' },
  { id: 'blaze_staff', name: 'Blaze Staff', cost: 150, color: '#FF8C20', edge: '#FFD080', tip: '#8B3A00', damage: 4, style: 'staff', glow: true },
  {
    id: 'op_rainbow',
    name: 'OP Rainbow Sword',
    cost: 0,
    color: '#FF4D6D',
    edge: '#FFE566',
    tip: '#4AEDD9',
    damage: Infinity,
    style: 'sword',
    glow: true,
    oneShot: true,
    cheat: true,
  },
];

/** Back-compat alias */
export const SWORDS = WEAPONS;

export const COSMETICS = [
  { id: 'hat_none', name: 'No Hat', slot: 'hat', cost: 0, kind: 'none' },
  { id: 'hat_miner', name: 'Miner Helmet', slot: 'hat', cost: 15, kind: 'miner', color: '#E8B923' },
  { id: 'hat_crown', name: 'Gold Crown', slot: 'hat', cost: 40, kind: 'crown', color: '#FFD700' },
  { id: 'hat_pumpkin', name: 'Pumpkin Head', slot: 'hat', cost: 25, kind: 'pumpkin', color: '#E07020' },
  { id: 'hat_shades', name: 'Cool Shades', slot: 'hat', cost: 20, kind: 'shades', color: '#111111' },
  { id: 'hat_wizard', name: 'Wizard Hat', slot: 'hat', cost: 55, kind: 'wizard', color: '#4A2A8A' },

  { id: 'cape_none', name: 'No Cape', slot: 'cape', cost: 0, kind: 'none' },
  { id: 'cape_red', name: 'Red Cape', slot: 'cape', cost: 30, kind: 'cape', color: '#C0392B' },
  { id: 'cape_ender', name: 'Ender Cape', slot: 'cape', cost: 70, kind: 'cape', color: '#2A0A4A', edge: '#C9B6FF' },
  { id: 'cape_emerald', name: 'Emerald Cape', slot: 'cape', cost: 90, kind: 'cape', color: '#1A9A4A', edge: '#7dffb0' },

  { id: 'acc_none', name: 'No Extra', slot: 'accessory', cost: 0, kind: 'none' },
  { id: 'acc_backpack', name: 'Adventure Pack', slot: 'accessory', cost: 35, kind: 'backpack', color: '#8B5A2B' },
  { id: 'acc_parrot', name: 'Shoulder Parrot', slot: 'accessory', cost: 60, kind: 'parrot', color: '#E74C3C' },
  { id: 'acc_boots', name: 'Sparkly Boots', slot: 'accessory', cost: 45, kind: 'boots', color: '#4AEDD9' },

  { id: 'armor_none', name: 'No Armor', slot: 'armor', cost: 0, kind: 'none' },
  {
    id: 'armor_diamond_enchanted',
    name: 'Rainbow Shining Armor',
    slot: 'armor',
    cost: 200,
    kind: 'diamond_set',
    color: '#FF4D6D',
    edge: '#C9B6FF',
    tip: '#4AEDD9',
    glow: true,
    rainbow: true,
    extraHearts: 3,
  },
];

export const MOB_TYPES = [
  { id: 'zombie', name: 'Zombie', maxHearts: 5, minTier: 1 },
  { id: 'creeper', name: 'Creeper', maxHearts: 6, minTier: 1 },
  { id: 'skeleton', name: 'Skeleton', maxHearts: 4, minTier: 1 },
  { id: 'spider', name: 'Spider', maxHearts: 7, minTier: 2 },
  { id: 'enderman', name: 'Enderman', maxHearts: 9, minTier: 2 },
  { id: 'wither_skel', name: 'Wither Skeleton', maxHearts: 12, minTier: 3 },
  { id: 'giant', name: 'Giant Zombie', maxHearts: 16, minTier: 3 },
];

/** @type {{ a: number, b: number, op: '+'|'-' }[]} */
const DEFAULT_EQUATIONS_SEED = DEFAULT_EQUATIONS;

const DEFAULT_STATE = {
  ownedWeapons: ['wood'],
  equipped: 'wood',
  ownedCosmetics: ['hat_none', 'cape_none', 'acc_none', 'armor_none'],
  hat: 'hat_none',
  cape: 'cape_none',
  accessory: 'acc_none',
  armor: 'armor_none',
  totalCorrect: 0,
  streak: 0,
  mathTier: 2,
  equationIndex: 0,
  starterQuestionIndex: 0,
  customEquations: DEFAULT_EQUATIONS_SEED.map((e) => ({ ...e })),
  muted: false,
  playerHearts: PLAYER_MAX_HEARTS,
  mobType: 'zombie',
  mobHearts: 5,
  mobMaxHearts: 5,
  mobScale: 1,
  mobsDefeated: 0,
  doubleHitCharges: 0,
  shieldCharges: 0,
  stickers: [],
  biome: 'plains',
};

function availableMobs(tier) {
  return MOB_TYPES.filter((m) => m.minTier <= tier);
}

function pickMob(mobsDefeated = 0, mathTier = 1) {
  const pool = availableMobs(mathTier);
  const type = pool[mobsDefeated % pool.length];
  const tierBonus = (mathTier - 1) * 4;
  const defeatBonus = Math.min(6, Math.floor(mobsDefeated / 2));
  const maxHearts = type.maxHearts + tierBonus + defeatBonus;
  const mobScale = mathTier === 1 ? 1 : mathTier === 2 ? 1.28 : 1.55;
  return {
    mobType: type.id,
    mobHearts: maxHearts,
    mobMaxHearts: maxHearts,
    mobScale,
  };
}

function normalizeEquations(raw) {
  if (!Array.isArray(raw) || !raw.length) {
    return DEFAULT_EQUATIONS_SEED.map((e) => ({ ...e }));
  }
  return raw
    .map((e) => {
      if (Array.isArray(e) && e.length >= 2) {
        return { a: Number(e[0]), b: Number(e[1]), op: '+' };
      }
      const a = Number(e?.a);
      const b = Number(e?.b);
      if (!Number.isFinite(a) || !Number.isFinite(b)) return null;
      return { a, b, op: e?.op === '-' ? '-' : '+' };
    })
    .filter(Boolean);
}

function migrate(parsed) {
  const ownedWeapons = Array.isArray(parsed.ownedWeapons)
    ? parsed.ownedWeapons
    : Array.isArray(parsed.ownedSwords)
      ? parsed.ownedSwords
      : ['wood'];

  const equationIndex = Math.max(
    0,
    parsed.equationIndex ?? parsed.starterQuestionIndex ?? 0,
  );

  return {
    ...DEFAULT_STATE,
    ...parsed,
    ownedWeapons,
    ownedCosmetics: Array.isArray(parsed.ownedCosmetics)
      ? parsed.ownedCosmetics
      : ['hat_none', 'cape_none', 'acc_none', 'armor_none'],
    hat: parsed.hat || 'hat_none',
    cape: parsed.cape || 'cape_none',
    accessory: parsed.accessory || 'acc_none',
    armor: parsed.armor || 'armor_none',
    mathTier: Math.min(3, Math.max(1, parsed.mathTier || 2)),
    equationIndex,
    starterQuestionIndex: equationIndex,
    customEquations: normalizeEquations(parsed.customEquations),
    stickers: Array.isArray(parsed.stickers) ? parsed.stickers : [],
    doubleHitCharges: Math.max(0, parsed.doubleHitCharges || 0),
    shieldCharges: Math.max(0, parsed.shieldCharges || 0),
    biome: parsed.biome || 'plains',
  };
}

function loadRaw() {
  try {
    // One-time wipe of cached progress so the game restarts clean
    if (!localStorage.getItem(WIPE_ONCE_KEY)) {
      [...OLD_KEYS, STORAGE_KEY].forEach((key) => localStorage.removeItem(key));
      localStorage.setItem(WIPE_ONCE_KEY, '1');
      return { ...DEFAULT_STATE, ...pickMob(0, 2) };
    }

    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_STATE, ...pickMob(0, 2) };
    const parsed = migrate(JSON.parse(raw));
    if (!parsed.mobType || parsed.mobHearts == null) {
      Object.assign(parsed, pickMob(parsed.mobsDefeated || 0, parsed.mathTier || 2));
    }
    if (parsed.playerHearts == null) parsed.playerHearts = PLAYER_MAX_HEARTS;
    if (parsed.mobScale == null) {
      parsed.mobScale = parsed.mathTier === 1 ? 1 : parsed.mathTier === 2 ? 1.28 : 1.55;
    }
    if (parsed.equationIndex == null) {
      parsed.equationIndex = parsed.starterQuestionIndex || 0;
    }
    if (!Array.isArray(parsed.customEquations) || !parsed.customEquations.length) {
      parsed.customEquations = DEFAULT_EQUATIONS_SEED.map((e) => ({ ...e }));
    }
    if (!parsed.ownedCosmetics.includes('armor_none')) {
      parsed.ownedCosmetics.push('armor_none');
    }
    if (!parsed.armor) parsed.armor = 'armor_none';
    return parsed;
  } catch {
    return { ...DEFAULT_STATE, ...pickMob(0, 2) };
  }
}

let state = loadRaw();
const listeners = new Set();

export function getState() {
  return {
    ...state,
    ownedWeapons: [...state.ownedWeapons],
    ownedCosmetics: [...state.ownedCosmetics],
    ownedSwords: [...state.ownedWeapons],
    stickers: [...(state.stickers || [])],
    customEquations: (state.customEquations || []).map((e) => ({ ...e })),
  };
}

export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function notify() {
  listeners.forEach((fn) => fn(getState()));
}

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  notify();
}

/** Mob difficulty tier (1–3). No longer tied to digit count. */
export function getMathTier() {
  return state.mathTier || 2;
}

export function getEquationIndex() {
  return state.equationIndex || 0;
}

/** @deprecated use getEquationIndex */
export function getStarterQuestionIndex() {
  return getEquationIndex();
}

export function getCustomEquations() {
  return (state.customEquations || DEFAULT_EQUATIONS_SEED).map((e) => ({ ...e }));
}

export function setCustomEquations(equations) {
  const next = normalizeEquations(equations);
  if (!next.length) return { ok: false, reason: 'empty' };
  state.customEquations = next;
  state.equationIndex = Math.min(state.equationIndex || 0, next.length - 1);
  state.starterQuestionIndex = state.equationIndex;
  save();
  return { ok: true, count: next.length };
}

export function resetCustomEquations() {
  state.customEquations = DEFAULT_EQUATIONS_SEED.map((e) => ({ ...e }));
  state.equationIndex = 0;
  state.starterQuestionIndex = 0;
  save();
  return getCustomEquations();
}

export function addCustomEquation(equation) {
  const list = getCustomEquations();
  list.push({ a: equation.a, b: equation.b, op: equation.op === '-' ? '-' : '+' });
  return setCustomEquations(list);
}

export function removeCustomEquation(index) {
  const list = getCustomEquations().filter((_, i) => i !== index);
  return setCustomEquations(list);
}

/** @deprecated use getMathTier */
export function getDifficultyStage() {
  return getMathTier();
}

export function getWeapon(id = state.equipped) {
  return WEAPONS.find((s) => s.id === id) || WEAPONS[0];
}

export function getSword(id = state.equipped) {
  return getWeapon(id);
}

export function getCosmetic(id) {
  return COSMETICS.find((c) => c.id === id) || null;
}

export function getEquippedArmor() {
  return getCosmetic(state.armor) || COSMETICS.find((c) => c.id === 'armor_none');
}

/** Base hearts + bonus from equipped armor. */
export function getPlayerMaxHearts() {
  const armor = getEquippedArmor();
  return PLAYER_MAX_HEARTS + (armor?.extraHearts || 0);
}

function syncHeartsToArmorCap() {
  const max = getPlayerMaxHearts();
  if (state.playerHearts > max) state.playerHearts = max;
  else if (state.playerHearts < max && state.playerHearts > 0) {
    // Equipping armor tops you up to the new max — feels rewarding
    state.playerHearts = max;
  }
}

export function getEquippedCosmetics() {
  return {
    hat: getCosmetic(state.hat) || COSMETICS[0],
    cape: getCosmetic(state.cape) || COSMETICS.find((c) => c.id === 'cape_none'),
    accessory: getCosmetic(state.accessory) || COSMETICS.find((c) => c.id === 'acc_none'),
    armor: getEquippedArmor(),
  };
}

export function getMobInfo(id = state.mobType) {
  return MOB_TYPES.find((m) => m.id === id) || MOB_TYPES[0];
}

export function getBiome() {
  const n = state.mobsDefeated || 0;
  if (n >= 8) return 'nether';
  if (n >= 4) return 'snow';
  return 'plains';
}

export function syncBiome() {
  const next = getBiome();
  const changed = state.biome !== next;
  state.biome = next;
  if (changed) save();
  return { biome: state.biome, changed };
}

export function grantPowerUp(kind) {
  if (kind === 'doubleHit') state.doubleHitCharges = (state.doubleHitCharges || 0) + 1;
  else if (kind === 'shield') state.shieldCharges = (state.shieldCharges || 0) + 1;
  save();
  return getState();
}

export function unlockSticker(id) {
  if (!state.stickers) state.stickers = [];
  if (state.stickers.includes(id)) return { ok: false, already: true };
  state.stickers.push(id);
  save();
  return { ok: true, id };
}

export function hasSticker(id) {
  return (state.stickers || []).includes(id);
}

export function recordCorrect() {
  state.totalCorrect += 1;
  state.streak += 1;

  const eqCount = (state.customEquations || DEFAULT_EQUATIONS_SEED).length || 1;
  state.equationIndex = ((state.equationIndex || 0) + 1) % eqCount;
  state.starterQuestionIndex = state.equationIndex;

  // Mob difficulty still steps up on long streaks (not digit tiers)
  let tierUnlocked = null;
  if (state.streak > 0 && state.streak % 10 === 0 && state.mathTier < 3) {
    state.mathTier += 1;
    tierUnlocked = state.mathTier;
  }

  let damage = getWeapon().damage || 1;
  let usedDoubleHit = false;
  let oneShot = Boolean(getWeapon().oneShot) || !Number.isFinite(damage);
  if (oneShot) {
    damage = state.mobHearts; // wipe all remaining hearts
  } else if ((state.doubleHitCharges || 0) > 0) {
    damage *= 2;
    state.doubleHitCharges -= 1;
    usedDoubleHit = true;
  }

  const prevMob = state.mobType;
  state.mobHearts = Math.max(0, state.mobHearts - damage);
  const mobDefeated = state.mobHearts <= 0;
  let newMobIntro = false;

  if (mobDefeated) {
    state.mobsDefeated += 1;
    Object.assign(state, pickMob(state.mobsDefeated, state.mathTier));
    newMobIntro = true;
  } else if (tierUnlocked) {
    Object.assign(state, pickMob(state.mobsDefeated, state.mathTier));
    newMobIntro = true;
  }

  const biomeInfo = syncBiome();
  save();
  return {
    streak: state.streak,
    stage: state.mathTier,
    mathTier: state.mathTier,
    tierUnlocked,
    damage,
    usedDoubleHit,
    oneShot,
    mobDefeated,
    newMobIntro,
    prevMob,
    playerHearts: state.playerHearts,
    mobHearts: state.mobHearts,
    mobMaxHearts: state.mobMaxHearts,
    mobType: state.mobType,
    mobScale: state.mobScale,
    hasRewards: getLockedRewards().length > 0,
    totalCorrect: state.totalCorrect,
    biome: state.biome,
    biomeChanged: biomeInfo.changed,
    victoryDance: state.streak > 0 && state.streak % 5 === 0,
  };
}

export function recordWrong() {
  state.streak = 0;
  let shielded = false;
  if ((state.shieldCharges || 0) > 0) {
    state.shieldCharges -= 1;
    shielded = true;
  } else {
    state.playerHearts = Math.max(0, state.playerHearts - 1);
  }
  const playerDefeated = !shielded && state.playerHearts <= 0;
  if (playerDefeated) {
    state.playerHearts = getPlayerMaxHearts();
  }
  save();
  return {
    playerDefeated,
    shielded,
    playerHearts: state.playerHearts,
    mobHearts: state.mobHearts,
  };
}

function shuffle(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/** Locked weapons + cosmetics (no free "none" items). Cheat/OP weapons are button-only. */
export function getLockedRewards() {
  const weapons = WEAPONS
    .filter((w) => !w.cheat && !state.ownedWeapons.includes(w.id))
    .map((item) => ({ type: 'weapon', item }));
  const cosmetics = COSMETICS
    .filter((c) => c.kind !== 'none' && !state.ownedCosmetics.includes(c.id))
    .map((item) => ({ type: 'cosmetic', item }));
  return [...weapons, ...cosmetics];
}

/**
 * Offer a mix of locked swords and cosmetics to pick from.
 * @returns {{ type: 'weapon'|'cosmetic', item: object }[]}
 */
export function getRewardChoices(max = 4) {
  const locked = getLockedRewards();
  if (!locked.length) return [];

  const weapons = shuffle(locked.filter((r) => r.type === 'weapon'));
  const cosmetics = shuffle(locked.filter((r) => r.type === 'cosmetic'));
  const picks = [];

  // Prefer a mix so kids always see both kinds when available
  while (picks.length < max && (weapons.length || cosmetics.length)) {
    if (weapons.length && (picks.length % 2 === 0 || !cosmetics.length)) {
      picks.push(weapons.shift());
    } else if (cosmetics.length) {
      picks.push(cosmetics.shift());
    } else if (weapons.length) {
      picks.push(weapons.shift());
    }
  }
  return shuffle(picks);
}

/** Unlock + equip for free (correct-answer reward). */
export function unlockReward(type, id) {
  if (type === 'weapon') {
    const weapon = WEAPONS.find((w) => w.id === id);
    if (!weapon) return { ok: false, reason: 'unknown' };
    if (!state.ownedWeapons.includes(id)) state.ownedWeapons.push(id);
    state.equipped = id;
    save();
    return { ok: true, type: 'weapon', item: weapon, label: 'sword' };
  }

  if (type === 'cosmetic') {
    const item = COSMETICS.find((c) => c.id === id);
    if (!item) return { ok: false, reason: 'unknown' };
    if (!state.ownedCosmetics.includes(id)) state.ownedCosmetics.push(id);
    state[item.slot] = id;
    if (item.slot === 'armor') syncHeartsToArmorCap();
    save();
    return { ok: true, type: 'cosmetic', item, label: item.slot === 'armor' ? 'armor' : 'cosmetic' };
  }

  return { ok: false, reason: 'unknown' };
}

/** Wardrobe equip only (already owned). */
export function buyWeapon(id) {
  const weapon = WEAPONS.find((s) => s.id === id);
  if (!weapon) return { ok: false, reason: 'unknown' };
  if (!state.ownedWeapons.includes(id)) {
    return { ok: false, reason: 'locked' };
  }
  state.equipped = id;
  save();
  return { ok: true, action: 'equip' };
}

export function buySword(id) {
  return buyWeapon(id);
}

export function buyCosmetic(id) {
  const item = COSMETICS.find((c) => c.id === id);
  if (!item) return { ok: false, reason: 'unknown' };
  const slot = item.slot;
  if (!state.ownedCosmetics.includes(id)) {
    return { ok: false, reason: 'locked' };
  }
  state[slot] = id;
  if (slot === 'armor') syncHeartsToArmorCap();
  save();
  return { ok: true, action: 'equip' };
}

export function equipSword(id) {
  if (!state.ownedWeapons.includes(id)) return false;
  state.equipped = id;
  save();
  return true;
}

/** Instant unlock + equip the OP one-shot rainbow sword. */
export function equipOpRainbowSword() {
  const id = 'op_rainbow';
  const weapon = WEAPONS.find((w) => w.id === id);
  if (!weapon) return { ok: false };
  if (!state.ownedWeapons.includes(id)) state.ownedWeapons.push(id);
  state.equipped = id;
  save();
  return { ok: true, item: weapon };
}

export function setMuted(muted) {
  state.muted = Boolean(muted);
  save();
}

export function toggleMute() {
  state.muted = !state.muted;
  save();
  return state.muted;
}

export function resetProgress() {
  const keptEquations = normalizeEquations(state.customEquations);
  state = {
    ...DEFAULT_STATE,
    muted: state.muted,
    ...pickMob(0, 2),
    mobsDefeated: 0,
    equationIndex: 0,
    starterQuestionIndex: 0,
    customEquations: keptEquations.length
      ? keptEquations
      : DEFAULT_EQUATIONS_SEED.map((e) => ({ ...e })),
  };
  save();
}
