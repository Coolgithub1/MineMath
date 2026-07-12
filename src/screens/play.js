import {
  getState,
  getSword,
  getMobInfo,
  getEquippedCosmetics,
  getMathTier,
  getCustomEquations,
  getEquationIndex,
  subscribe,
  recordCorrect,
  recordWrong,
  grantPowerUp,
  unlockSticker,
  hasSticker,
  PLAYER_MAX_HEARTS,
} from '../game/state.js';
import { generateQuestion, stageLabel, formatEquation } from '../game/math.js';
import {
  unlockAudio,
  playClick,
  playCorrect,
  playWrong,
  playLevelUp,
  playMobDefeat,
  playCheer,
  playParrotSquawk,
} from '../game/audio.js';
import { popQuestion } from '../game/fx.js';
import { evaluateStickers } from '../game/stickers.js';
import {
  showMobTaunt,
  typingJuice,
  showBossIntro,
  showVictoryDance,
  showPowerUpOffer,
  showStickerToast,
  announceBiome,
  applyBiome,
} from '../game/stim.js';

function renderHearts(container, current, max, filledClass = 'heart-full') {
  if (!container) return;
  const cappedMax = Math.min(max, 20);
  container.innerHTML = '';
  for (let i = 0; i < cappedMax; i += 1) {
    const heart = document.createElement('span');
    heart.className = `heart ${i < current ? filledClass : 'heart-empty'}`;
    heart.setAttribute('aria-hidden', 'true');
    container.appendChild(heart);
  }
  if (max > cappedMax) {
    const more = document.createElement('span');
    more.className = 'hearts-more';
    more.textContent = `+${max - cappedMax}`;
    container.appendChild(more);
  }
}

function danceKindForStreak(streak) {
  const cycle = ['spin', 'robot', 'highfive'];
  return cycle[Math.floor(streak / 5) % cycle.length];
}

/**
 * @param {{
 *   onCelebrate: (info: object) => void,
 *   onMobDefeat?: (info: object) => void,
 *   openReward?: () => Promise<{ unlockedSword?: boolean, unlockedCosmetic?: boolean }|void>,
 *   runBattle?: (success: boolean) => Promise<void>,
 *   onBiomeChange?: (biome: string) => void,
 * }} hooks
 */
export function createPlayScreen(root, hooks) {
  let question = null;
  let locked = false;
  let lastTier = getMathTier();

  const questionEl = root.querySelector('#question-text');
  const answerInput = root.querySelector('#answer-input');
  const answerForm = root.querySelector('#answer-form');
  const submitBtn = root.querySelector('#answer-submit');
  const feedbackEl = root.querySelector('#feedback');
  const stageEl = root.querySelector('#stage-chip');
  const mobFighter = root.querySelector('.mob-fighter');

  function setFeedback(text, className = '') {
    feedbackEl.textContent = text;
    feedbackEl.className = `feedback ${className}`.trim();
  }

  function setInputState(okClass) {
    answerInput.classList.remove('pulse-correct', 'pulse-wrong');
    if (okClass) answerInput.classList.add(okClass);
  }

  function processStickers(events) {
    const earned = evaluateStickers(events, { hasSticker, unlockSticker });
    earned.forEach((id, i) => {
      setTimeout(() => showStickerToast(id), i * 400);
    });
    return earned;
  }

  function renderQuestion() {
    const eqs = getCustomEquations();
    question = generateQuestion(eqs, getEquationIndex());
    questionEl.textContent = `${formatEquation(question)} = ?`;
    popQuestion();
    stageEl.textContent = stageLabel(question.stage, question.total);
    const s = getState();
    const buffs = [];
    if (s.doubleHitCharges > 0) buffs.push('💥 Double Hit ready');
    if (s.shieldCharges > 0) buffs.push('🛡 Shield ready');
    setFeedback(
      `Solve it to smash the mob and unlock cool loot!${buffs.length ? ` · ${buffs.join(' · ')}` : ''}`,
    );
    setInputState('');
    answerInput.value = '';
    answerInput.disabled = false;
    submitBtn.disabled = false;
    locked = false;
    answerInput.focus();
    showMobTaunt(mobFighter);
  }

  async function onSubmit(event) {
    event?.preventDefault?.();
    if (locked || !question) return;

    const raw = answerInput.value.trim();
    if (raw === '') {
      setFeedback('Type a number first!', 'feedback wrong');
      answerInput.focus();
      return;
    }

    const choice = Number(raw);
    if (!Number.isFinite(choice)) {
      setFeedback('Please type a number.', 'feedback wrong');
      answerInput.focus();
      return;
    }

    locked = true;
    answerInput.disabled = true;
    submitBtn.disabled = true;
    await unlockAudio();
    playClick();

    if (choice === question.answer) {
      setInputState('pulse-correct');
      setFeedback('Here we goooo!', 'feedback correct');

      const prevMob = getState().mobType;

      if (hooks.runBattle) {
        await hooks.runBattle(true);
      }

      const result = recordCorrect();
      playCorrect();
      playCheer(result.streak);

      const cos = getEquippedCosmetics();
      if (cos.accessory?.kind === 'parrot') playParrotSquawk();

      const danceKind = result.victoryDance ? danceKindForStreak(result.streak) : null;
      if (danceKind) showVictoryDance(danceKind);

      hooks.onCelebrate?.({
        streak: result.streak,
        victoryDance: danceKind,
        hasCape: cos.cape?.kind === 'cape',
        hasParrot: cos.accessory?.kind === 'parrot',
      });

      if (result.mobDefeated) hooks.onMobDefeat?.(result);
      syncHud(root);

      if (result.biomeChanged) {
        applyBiome(root, result.biome);
        announceBiome(result.biome);
        hooks.onBiomeChange?.(result.biome);
      }

      if (result.tierUnlocked) {
        playLevelUp();
        lastTier = result.mathTier;
        setFeedback('Tough new mobs unlocked — keep going!', 'feedback bonus');
      } else if (result.mobDefeated) {
        playMobDefeat();
        const mob = getMobInfo(result.mobType);
        setFeedback(
          `Mob defeated!${result.usedDoubleHit ? ' DOUBLE HIT!' : ''} A bigger ${mob.name} appears!`,
          'feedback bonus',
        );
      } else {
        setFeedback(
          `BONK! Mob lost ${result.damage} heart${result.damage > 1 ? 's' : ''}!${result.usedDoubleHit ? ' Double hit!' : ''} Pick a prize!`,
          'feedback correct',
        );
      }

      processStickers({
        totalCorrect: result.totalCorrect,
        streak: result.streak,
        defeatedMob: result.mobDefeated ? prevMob : null,
        usedDoubleHit: result.usedDoubleHit,
        victoryDance: result.victoryDance,
        biome: result.biome,
      });

      lastTier = result.mathTier;

      await new Promise((r) => setTimeout(r, result.mobDefeated || result.tierUnlocked ? 500 : 300));

      // ~28% chance of a bonus power-up offer
      if (Math.random() < 0.28) {
        const kind = await showPowerUpOffer();
        if (kind) {
          grantPowerUp(kind);
          syncHud(root);
        }
      }

      if (hooks.openReward) {
        const rewardInfo = await hooks.openReward();
        processStickers({
          unlockedSword: rewardInfo?.unlockedSword,
          unlockedCosmetic: rewardInfo?.unlockedCosmetic,
          biome: getState().biome,
          totalCorrect: getState().totalCorrect,
          streak: getState().streak,
        });
      }

      if (result.newMobIntro) {
        const mob = getMobInfo(result.mobType);
        await showBossIntro(mob.name);
        syncHud(root);
      }

      renderQuestion();
    } else {
      setInputState('pulse-wrong');
      setFeedback('Charging in… uh oh!', 'feedback wrong');

      if (hooks.runBattle) {
        await hooks.runBattle(false);
      }

      const result = recordWrong();
      playWrong();
      syncHud(root);

      if (result.shielded) {
        processStickers({ usedShield: true, biome: getState().biome });
        setFeedback(
          `Shield blocked it! The answer was ${question.answer}.`,
          'feedback bonus',
        );
      } else if (result.playerDefeated) {
        setFeedback(
          `Out of hearts! The answer was ${question.answer}. Hearts refilled — keep going!`,
          'feedback wrong',
        );
      } else {
        setFeedback(
          `Ouch! You lost a heart. The answer is ${question.answer}.`,
          'feedback wrong',
        );
      }
      setTimeout(renderQuestion, 900);
    }
  }

  answerForm.addEventListener('submit', onSubmit);

  answerInput.addEventListener('input', () => {
    const prev = answerInput.value;
    answerInput.value = prev.replace(/[^\d]/g, '');
    if (answerInput.value.length > 0) typingJuice(answerInput);
  });

  subscribe(() => {
    if (!question) {
      stageEl.textContent = stageLabel(0, getCustomEquations().length);
    }
  });

  return {
    start() {
      lastTier = getMathTier();
      applyBiome(root, getState().biome || 'plains');
      syncHud(root);
      renderQuestion();
    },
    refresh() {
      if (!locked) renderQuestion();
    },
  };
}

export function syncHud(root) {
  const s = getState();
  const sword = getSword();
  const mob = getMobInfo(s.mobType);
  const correctEl = root.querySelector('#correct-count');
  if (correctEl) correctEl.textContent = String(s.totalCorrect);
  root.querySelector('#equipped-name').textContent = sword.name;
  root.querySelector('#mute-btn').textContent = s.muted ? 'Sound: Off' : 'Sound: On';

  const streakEl = root.querySelector('#streak-count');
  if (streakEl) streakEl.textContent = String(s.streak);
  const streakPill = root.querySelector('#streak-pill');
  if (streakPill) {
    streakPill.classList.remove('combo-1', 'combo-2', 'combo-3', 'combo-4', 'combo-5');
    const tier = Math.min(5, Math.max(0, Math.floor(s.streak / 2)));
    if (s.streak > 0) streakPill.classList.add(`combo-${Math.max(1, tier)}`);
  }

  const powerEl = root.querySelector('#power-status');
  if (powerEl) {
    const bits = [];
    if (s.doubleHitCharges > 0) bits.push(`💥×${s.doubleHitCharges}`);
    if (s.shieldCharges > 0) bits.push(`🛡×${s.shieldCharges}`);
    powerEl.textContent = bits.length ? bits.join(' ') : '';
    powerEl.classList.toggle('hidden', !bits.length);
  }

  const stickerCount = root.querySelector('#sticker-count');
  if (stickerCount) stickerCount.textContent = String((s.stickers || []).length);

  const cos = getEquippedCosmetics();
  const cosLabel = root.querySelector('#cosmetic-label');
  if (cosLabel) {
    const bits = [cos.hat, cos.cape, cos.accessory]
      .filter((c) => c && c.kind !== 'none')
      .map((c) => c.name);
    cosLabel.textContent = bits.length ? bits.join(' · ') : 'No cosmetics';
  }

  const mobName = root.querySelector('#mob-name');
  if (mobName) mobName.textContent = mob.name;
  const mobStatus = root.querySelector('#mob-status');
  if (mobStatus) {
    mobStatus.textContent = `${s.mobHearts}/${s.mobMaxHearts} hearts`;
  }

  renderHearts(root.querySelector('#player-hearts'), s.playerHearts, PLAYER_MAX_HEARTS, 'heart-full');
  renderHearts(root.querySelector('#mob-hearts'), s.mobHearts, s.mobMaxHearts, 'heart-mob');
}
