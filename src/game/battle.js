import { getSword, getState } from './state.js';
import {
  playHit,
  playFart,
  playHurt,
  playWhoosh,
  playBolt,
  playCreeperHiss,
  playCreeperExplode,
  playZombieMoan,
  playEndermanNoise,
  playEndermanTeleport,
  playSkeletonShoot,
} from './audio.js';
import { burstAt, burstFromEl } from './fx.js';
import { spawnWeaponHitParticles, weaponFxProfile } from '../render/weaponFx.js';

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function clearChargeClasses(el) {
  el.classList.remove('charge-run', 'charge-back', 'charge-flee', 'battling');
  el.style.removeProperty('--charge-x');
}

function clearMobClasses(el) {
  el.classList.remove(
    'battling',
    'ender-lunge',
    'ender-home',
    'creeper-boom',
  );
  el.style.removeProperty('--ender-x');
  el.style.transform = '';
}

/** Sprinkle trail particles along a bolt flight. */
function spawnBoltTrail(x0, y0, x1, y1, weapon) {
  const profile = weaponFxProfile(weapon);
  const steps = 10;
  for (let i = 0; i < steps; i += 1) {
    const t = i / steps;
    setTimeout(() => {
      const el = document.createElement('div');
      const color = profile.colors[i % profile.colors.length];
      el.className = 'weapon-fx-bit shape-orb';
      el.style.left = `${x0 + (x1 - x0) * t}px`;
      el.style.top = `${y0 + (y1 - y0) * t}px`;
      el.style.background = color;
      el.style.boxShadow = `0 0 0 2px #000, 0 0 12px ${color}`;
      el.style.setProperty('--dx', `${(Math.random() - 0.5) * 40}px`);
      el.style.setProperty('--dy', `${(Math.random() - 0.5) * 40}px`);
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 500);
    }, i * 22);
  }
}

/**
 * Fly a glowing staff bolt from the player canvas to the mob canvas.
 */
function shootBolt(fromEl, toEl, weapon) {
  return new Promise((resolve) => {
    const from = fromEl.getBoundingClientRect();
    const to = toEl.getBoundingClientRect();
    const color = weapon.color;
    const edge = weapon.edge;
    const bolt = document.createElement('div');
    bolt.className = 'battle-bolt';
    const x0 = from.left + from.width * 0.72;
    const y0 = from.top + from.height * 0.32;
    const x1 = to.left + to.width * 0.38;
    const y1 = to.top + to.height * 0.42;
    bolt.style.left = `${x0}px`;
    bolt.style.top = `${y0}px`;
    bolt.style.background = `radial-gradient(circle at 35% 35%, #fff 0%, ${edge || '#ffe080'} 28%, ${color} 70%, ${color} 100%)`;
    bolt.style.boxShadow = `0 0 0 3px #000, 0 0 18px ${color}, 0 0 36px ${color}`;
    document.body.appendChild(bolt);
    spawnBoltTrail(x0, y0, x1, y1, weapon);

    requestAnimationFrame(() => {
      bolt.style.transform = `translate(${x1 - x0}px, ${y1 - y0}px) scale(1.35)`;
      bolt.classList.add('flying');
    });

    setTimeout(() => {
      bolt.classList.add('impact');
      spawnWeaponHitParticles(toEl, weapon, 32);
      setTimeout(() => {
        bolt.remove();
        resolve();
      }, 80);
    }, 240);
  });
}

/** Skeleton arrow flying toward the player. */
function shootArrow(fromEl, toEl) {
  return new Promise((resolve) => {
    const from = fromEl.getBoundingClientRect();
    const to = toEl.getBoundingClientRect();
    const arrow = document.createElement('div');
    arrow.className = 'battle-arrow';
    const x0 = from.left + from.width * 0.25;
    const y0 = from.top + from.height * 0.38;
    const x1 = to.left + to.width * 0.55;
    const y1 = to.top + to.height * 0.4;
    const dx = x1 - x0;
    const dy = y1 - y0;
    const angle = Math.atan2(dy, dx) * (180 / Math.PI);
    arrow.style.left = `${x0}px`;
    arrow.style.top = `${y0}px`;
    arrow.style.setProperty('--rot', `${angle}deg`);
    document.body.appendChild(arrow);

    requestAnimationFrame(() => {
      arrow.style.transform = `translate(${dx}px, ${dy}px) rotate(${angle}deg)`;
      arrow.classList.add('flying');
    });

    setTimeout(() => {
      arrow.classList.add('impact');
      setTimeout(() => {
        arrow.remove();
        resolve();
      }, 80);
    }, 220);
  });
}

function spawnExplosion(el) {
  const r = el.getBoundingClientRect();
  const cx = r.left + r.width / 2;
  const cy = r.top + r.height / 2;
  burstAt(cx, cy, {
    count: 24,
    kinds: ['spark', 'star', 'red'],
    spread: 140,
  });
  const boom = document.createElement('div');
  boom.className = 'creeper-blast';
  boom.style.left = `${cx}px`;
  boom.style.top = `${cy}px`;
  document.body.appendChild(boom);
  setTimeout(() => boom.remove(), 700);
}

function teleportSparkles(el) {
  burstFromEl(el, {
    count: 14,
    kinds: ['spark', 'star'],
    spread: 70,
  });
}

async function counterCreeper({ mobAnimator, mobCanvas, onMobCounter, animator }) {
  playCreeperHiss();
  mobAnimator.fuse(0.55);
  await wait(520);
  playCreeperExplode();
  mobAnimator.explode(0.4);
  spawnExplosion(mobCanvas);
  playHurt();
  onMobCounter?.();
  animator.hurtFlash();
  await wait(220);
  mobAnimator.respawn(0.35);
  await wait(280);
}

async function counterZombie({ mobAnimator, onMobCounter, animator }) {
  playZombieMoan();
  await wait(160);
  mobAnimator.attack();
  await wait(140);
  playHurt();
  onMobCounter?.();
  animator.hurtFlash();
  await wait(120);
}

async function counterEnderman({
  mobAnimator,
  mobFighter,
  playerCanvas,
  mobCanvas,
  onMobCounter,
  animator,
}) {
  playEndermanNoise();
  await wait(100);
  playEndermanTeleport();
  teleportSparkles(mobCanvas);
  mobAnimator.teleportOut(0.22);
  await wait(220);

  const p = playerCanvas.getBoundingClientRect();
  const m = mobCanvas.getBoundingClientRect();
  const lunge = -(m.left - p.right) * 0.75;
  mobFighter.style.setProperty('--ender-x', `${lunge}px`);
  mobFighter.classList.add('ender-lunge');
  playEndermanTeleport();
  mobAnimator.teleportIn(0.22);
  teleportSparkles(playerCanvas);
  await wait(200);

  mobAnimator.attack();
  await wait(140);
  playHurt();
  onMobCounter?.();
  animator.hurtFlash();
  await wait(120);

  playEndermanTeleport();
  teleportSparkles(mobCanvas);
  mobAnimator.teleportOut(0.2);
  await wait(180);
  mobFighter.classList.remove('ender-lunge');
  mobFighter.classList.add('ender-home');
  playEndermanTeleport();
  mobAnimator.teleportIn(0.22);
  teleportSparkles(mobCanvas);
  await wait(220);
  mobFighter.classList.remove('ender-home');
  mobFighter.style.removeProperty('--ender-x');
  mobFighter.style.transform = '';
}

async function counterSkeleton({
  mobAnimator,
  mobCanvas,
  playerCanvas,
  onMobCounter,
  animator,
}) {
  mobAnimator.shoot(0.38);
  await wait(160);
  playSkeletonShoot();
  await shootArrow(mobCanvas, playerCanvas);
  playHurt();
  onMobCounter?.();
  animator.hurtFlash();
  await wait(100);
}

async function counterDefault({ mobAnimator, onMobCounter, animator }) {
  mobAnimator.attack();
  await wait(140);
  playHurt();
  onMobCounter?.();
  animator.hurtFlash();
  await wait(100);
}

/**
 * Full approach → attack → return battle beat.
 */
export async function playBattleSequence(opts) {
  const {
    success,
    animator,
    mobAnimator,
    onPlayerHitMob,
    onMobCounter,
  } = opts;

  const arena = document.querySelector('#battle-arena');
  const playerFighter = document.querySelector('.player-fighter');
  const mobFighter = document.querySelector('.mob-fighter');
  const playerCanvas = document.querySelector('#character-canvas');
  const mobCanvas = document.querySelector('#mob-canvas');
  if (!playerFighter || !mobFighter || !playerCanvas || !mobCanvas) return;

  const weapon = getSword();
  const isStaff = weapon.style === 'staff';
  const mobType = getState().mobType;

  arena?.classList.add('in-battle');
  playerFighter.classList.add('battling');
  mobFighter.classList.add('battling');

  const pRect = playerCanvas.getBoundingClientRect();
  const mRect = mobCanvas.getBoundingClientRect();
  const gap = mRect.left - pRect.right;
  const chargeDist = Math.max(56, Math.min(gap * 0.78, window.innerWidth * 0.42));

  playerFighter.style.setProperty('--charge-x', `${chargeDist}px`);
  playWhoosh();
  playerFighter.classList.add('charge-run');
  await wait(280);

  if (success) {
    if (isStaff) {
      animator.cast();
      await wait(100);
      playBolt();
      await shootBolt(playerCanvas, mobCanvas, weapon);
      playHit();
      playFart();
      onPlayerHitMob?.();
    } else {
      animator.attack();
      await wait(160);
      playHit();
      playFart();
      spawnWeaponHitParticles(mobCanvas, weapon, 28);
      onPlayerHitMob?.();
      await wait(120);
    }

    await wait(80);
    playerFighter.classList.remove('charge-run');
    playerFighter.classList.add('charge-back');
    await wait(240);
  } else {
    // Wind up like they're going to hit…
    animator.attack();
    await wait(120);

    const ctx = { mobAnimator, mobFighter, mobCanvas, playerCanvas, onMobCounter, animator };

    if (mobType === 'creeper') {
      await counterCreeper(ctx);
    } else if (mobType === 'zombie' || mobType === 'giant' || mobType === 'lion') {
      await counterZombie(ctx);
    } else if (mobType === 'enderman' || mobType === 'herobrine') {
      await counterEnderman(ctx);
    } else if (mobType === 'skeleton' || mobType === 'wither_skel' || mobType === 'wither' || mobType === 'op_shiny_wither' || mobType === 'blaze') {
      await counterSkeleton(ctx);
    } else if (mobType === 'spider' || mobType === 'op_rainbow_spider') {
      await counterDefault(ctx);
    } else if (mobType === 'boss_horde' || mobType === 'warden' || mobType === 'super_warden' || mobType === 'op_super_warden' || mobType === 'ender_dragon' || mobType === 'op_rainbow_dragon') {
      await counterDefault(ctx);
    } else {
      await counterDefault(ctx);
    }

    playerFighter.classList.remove('charge-run');
    playerFighter.classList.add('charge-flee');
    playWhoosh();
    await wait(300);
  }

  clearChargeClasses(playerFighter);
  clearMobClasses(mobFighter);
  arena?.classList.remove('in-battle');
  playerFighter.style.transform = '';
  await wait(40);
}
