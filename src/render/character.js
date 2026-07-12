/**
 * Canvas voxel-style Minecraft-inspired character with silly animations.
 */

import { createWeaponParticleSystem } from './weaponFx.js';

const BODY = {
  skin: '#C68642',
  skinDark: '#A86B32',
  skinLight: '#E0A060',
  shirt: '#3A7A2A',
  shirtDark: '#2A5A1A',
  shirtLight: '#4A9A3A',
  pants: '#2C4A7A',
  pantsDark: '#1C3A5A',
  pantsLight: '#3C6A9A',
  hair: '#3B2414',
  eye: '#1a1a1a',
  mouth: '#5a3020',
};

const IDLE_MODES = ['dance', 'laugh', 'fight', 'bounce', 'wiggle'];

function drawBox(ctx, x, y, w, h, d, face, side, top) {
  ctx.fillStyle = face;
  ctx.fillRect(x, y, w, h);
  if (d > 0) {
    ctx.fillStyle = side;
    ctx.beginPath();
    ctx.moveTo(x + w, y);
    ctx.lineTo(x + w + d, y - d * 0.5);
    ctx.lineTo(x + w + d, y + h - d * 0.5);
    ctx.lineTo(x + w, y + h);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = top;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + d, y - d * 0.5);
    ctx.lineTo(x + w + d, y - d * 0.5);
    ctx.lineTo(x + w, y);
    ctx.closePath();
    ctx.fill();
  }
}

function drawWeapon(ctx, weapon, ox, oy, angle, pulse = 0) {
  ctx.save();
  ctx.translate(ox, oy);
  ctx.rotate(angle);
  const style = weapon.style || 'sword';
  const blade = weapon.color;
  const edge = weapon.edge;
  const tip = weapon.tip;
  const glowAmt = weapon.glow ? 12 + pulse * 16 : pulse * 10;

  if (glowAmt > 0) {
    ctx.shadowColor = edge || blade;
    ctx.shadowBlur = glowAmt;
  }

  // Soft energy aura behind enchanted / charged weapons
  if (weapon.glow || pulse > 0.2) {
    ctx.save();
    ctx.globalAlpha = 0.22 + pulse * 0.35;
    ctx.fillStyle = edge || blade;
    ctx.beginPath();
    if (style === 'staff') ctx.arc(0, -28, 18 + pulse * 8, 0, Math.PI * 2);
    else if (style === 'trident') ctx.ellipse(0, -20, 16 + pulse * 6, 28, 0, 0, Math.PI * 2);
    else if (style === 'axe') ctx.ellipse(-12, -6, 20 + pulse * 6, 16, -0.4, 0, Math.PI * 2);
    else ctx.ellipse(0, -18, 12 + pulse * 5, 28 + pulse * 6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  if (style === 'axe') {
    ctx.fillStyle = tip;
    ctx.fillRect(-3, 10, 6, 28);
    ctx.fillStyle = blade;
    ctx.beginPath();
    ctx.moveTo(-4, 12);
    ctx.lineTo(-28, -8);
    ctx.lineTo(-22, -22);
    ctx.lineTo(4, 8);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = edge;
    ctx.fillRect(-20, -14, 10, 4);
  } else if (style === 'trident') {
    ctx.fillStyle = tip;
    ctx.fillRect(-3, 8, 6, 36);
    ctx.fillStyle = blade;
    ctx.fillRect(-14, -40, 6, 28);
    ctx.fillRect(-3, -48, 6, 36);
    ctx.fillRect(8, -40, 6, 28);
    ctx.fillStyle = edge;
    ctx.fillRect(-1, -46, 2, 50);
  } else if (style === 'staff') {
    ctx.fillStyle = tip;
    ctx.fillRect(-3, -20, 6, 55);
    ctx.fillStyle = blade;
    ctx.beginPath();
    ctx.arc(0, -28, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = edge;
    ctx.beginPath();
    ctx.arc(0, -28, 6 + pulse * 3, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.fillStyle = '#5C3A1E';
    ctx.fillRect(-4, 18, 8, 22);
    ctx.fillStyle = tip;
    ctx.fillRect(-12, 14, 24, 6);
    ctx.fillStyle = blade;
    ctx.beginPath();
    ctx.moveTo(-6, 14);
    ctx.lineTo(-6, -36);
    ctx.lineTo(0, -48);
    ctx.lineTo(6, -36);
    ctx.lineTo(6, 14);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = edge;
    ctx.fillRect(-2, -34, 3, 46);
  }

  ctx.shadowBlur = 0;
  ctx.restore();
}

function drawCape(ctx, cape, cx, baseY, sway) {
  if (!cape || cape.kind === 'none') return;
  const color = cape.color || '#C0392B';
  const edge = cape.edge || color;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(cx - 20, baseY - 80);
  ctx.lineTo(cx - 34 + sway, baseY - 10);
  ctx.lineTo(cx + 8 + sway * 0.4, baseY - 10);
  ctx.lineTo(cx - 4, baseY - 80);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = edge;
  ctx.fillRect(cx - 18, baseY - 78, 10, 8);
}

function drawHat(ctx, hat, cx, headY, depth) {
  if (!hat || hat.kind === 'none') return;
  const c = hat.color || '#E8B923';

  if (hat.kind === 'miner') {
    drawBox(ctx, cx - 22, headY - 10, 44, 14, depth, c, '#B8860B', '#FFE566');
    ctx.fillStyle = '#4A90D9';
    ctx.fillRect(cx - 6, headY - 6, 12, 8);
  } else if (hat.kind === 'crown') {
    ctx.fillStyle = c;
    ctx.fillRect(cx - 18, headY - 8, 36, 10);
    ctx.fillRect(cx - 18, headY - 18, 8, 12);
    ctx.fillRect(cx - 4, headY - 22, 8, 16);
    ctx.fillRect(cx + 10, headY - 18, 8, 12);
    ctx.fillStyle = '#E74C3C';
    ctx.fillRect(cx - 1, headY - 24, 4, 4);
  } else if (hat.kind === 'pumpkin') {
    drawBox(ctx, cx - 22, headY - 4, 44, 44, depth + 2, c, '#A05010', '#F09040');
    ctx.fillStyle = '#111';
    ctx.fillRect(cx - 12, headY + 10, 8, 8);
    ctx.fillRect(cx + 6, headY + 10, 8, 8);
    ctx.fillRect(cx - 6, headY + 24, 14, 6);
    ctx.fillStyle = '#3A7A2A';
    ctx.fillRect(cx - 4, headY - 10, 8, 8);
  } else if (hat.kind === 'shades') {
    ctx.fillStyle = '#111';
    ctx.fillRect(cx - 16, headY + 16, 14, 8);
    ctx.fillRect(cx + 4, headY + 16, 14, 8);
    ctx.fillRect(cx - 2, headY + 18, 6, 3);
  } else if (hat.kind === 'wizard') {
    ctx.fillStyle = c;
    ctx.beginPath();
    ctx.moveTo(cx, headY - 48);
    ctx.lineTo(cx - 24, headY + 4);
    ctx.lineTo(cx + 24, headY + 4);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#E8B923';
    ctx.fillRect(cx - 3, headY - 40, 6, 6);
  }
}

function drawAccessory(ctx, acc, cx, baseY, depth, parrotBob = 0) {
  if (!acc || acc.kind === 'none') return;

  if (acc.kind === 'backpack') {
    drawBox(ctx, cx - 30, baseY - 78, 14, 28, depth - 2, acc.color, '#5C3A1E', '#C4A484');
  } else if (acc.kind === 'parrot') {
    const px = cx - 34;
    const py = baseY - 100 + parrotBob;
    ctx.fillStyle = acc.color;
    ctx.fillRect(px, py, 16, 14);
    ctx.fillStyle = '#2ECC71';
    ctx.fillRect(px + 2, py + 4, 6, 6);
    ctx.fillStyle = '#F1C40F';
    ctx.fillRect(px + 14, py + 6, 8, 4);
    ctx.fillStyle = '#111';
    ctx.fillRect(px + 10, py + 4, 3, 3);
  } else if (acc.kind === 'boots') {
    ctx.fillStyle = acc.color;
    ctx.shadowColor = acc.color;
    ctx.shadowBlur = 8;
    ctx.fillRect(cx - 20, baseY - 8, 16, 10);
    ctx.fillRect(cx + 4, baseY - 8, 16, 10);
    ctx.shadowBlur = 0;
  }
}

function drawLimb(ctx, x, y, w, h, d, colors, angle, pivotX, pivotY) {
  ctx.save();
  ctx.translate(pivotX, pivotY);
  ctx.rotate(angle);
  ctx.translate(-pivotX, -pivotY);
  drawBox(ctx, x, y, w, h, d, colors[0], colors[1], colors[2]);
  ctx.restore();
}

/**
 * @param {HTMLCanvasElement} canvas
 * @param {{ sword: object, cosmetics?: object, pose?: object, flash?: number, hurt?: number, weaponPulse?: number }} opts
 */
export function drawCharacter(canvas, opts) {
  const {
    sword,
    cosmetics = {},
    pose = {},
    flash = 0,
    hurt = 0,
    weaponPulse = 0,
  } = opts;
  const hat = cosmetics.hat;
  const cape = cosmetics.cape;
  const accessory = cosmetics.accessory;

  const {
    bob = 0,
    lean = 0,
    jump = 0,
    squash = 1,
    stretch = 1,
    legL = 0,
    legR = 0,
    armL = 0,
    armR = 0,
    swing = 0,
    headTilt = 0,
    headBob = 0,
    mouthOpen = 0,
    eyesSquint = 0,
    lunge = 0,
    spin = 0,
    capeSway = 0,
    expression = 'normal',
  } = pose;

  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;
  ctx.clearRect(0, 0, w, h);

  const cx = w * 0.42 + lunge;
  const baseY = h * 0.78 + bob - jump;
  const depth = 10;

  ctx.fillStyle = 'rgba(0,0,0,0.18)';
  ctx.beginPath();
  ctx.ellipse(cx + 8 - lunge * 0.3, h * 0.86, 48 + Math.abs(lunge) * 0.1, 12, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.save();
  ctx.translate(cx, baseY);
  ctx.rotate(lean + spin);
  ctx.scale(squash, stretch);
  ctx.translate(-cx, -baseY);

  drawCape(ctx, cape, cx, baseY, capeSway);

  const pants = [BODY.pants, BODY.pantsDark, BODY.pantsLight];
  drawLimb(ctx, cx - 18, baseY - 36, 14, 36, depth, pants, legL, cx - 11, baseY - 36);
  drawLimb(ctx, cx + 4, baseY - 36, 14, 36, depth, pants, legR, cx + 11, baseY - 36);
  drawAccessory(ctx, accessory?.kind === 'boots' ? accessory : null, cx, baseY, depth);

  drawBox(ctx, cx - 22, baseY - 84, 44, 48, depth + 2, BODY.shirt, BODY.shirtDark, BODY.shirtLight);
  drawAccessory(ctx, accessory?.kind === 'backpack' ? accessory : null, cx, baseY, depth);

  const skin = [BODY.skin, BODY.skinDark, BODY.skinLight];
  drawLimb(ctx, cx - 36, baseY - 80, 12, 40, depth - 2, skin, armL, cx - 30, baseY - 78);

  const headY = baseY - 124 + headBob;
  ctx.save();
  ctx.translate(cx, headY + 20);
  ctx.rotate(headTilt);
  ctx.translate(-cx, -(headY + 20));

  const hideFace = hat?.kind === 'pumpkin';
  if (!hideFace) {
    drawBox(ctx, cx - 20, headY, 40, 40, depth + 4, BODY.skin, BODY.skinDark, BODY.skinLight);
    ctx.fillStyle = BODY.hair;
    ctx.fillRect(cx - 20, headY, 40, 10);
    ctx.fillRect(cx - 20, headY + 10, 8, 14);
    ctx.fillRect(cx + 12, headY + 10, 8, 14);

    if (hat?.kind !== 'shades') {
      const eyeH = eyesSquint > 0.5 ? 3 : 8;
      const eyeY = headY + 18 + (eyesSquint > 0.5 ? 3 : 0);
      ctx.fillStyle = '#fff';
      ctx.fillRect(cx - 10, eyeY, 8, eyeH);
      ctx.fillRect(cx + 4, eyeY, 8, eyeH);
      if (eyesSquint < 0.7) {
        ctx.fillStyle = BODY.eye;
        ctx.fillRect(cx - 7, eyeY + Math.max(1, eyeH * 0.35), 4, 4);
        ctx.fillRect(cx + 7, eyeY + Math.max(1, eyeH * 0.35), 4, 4);
      }
    }

    // Mouth / expression
    ctx.fillStyle = BODY.mouth;
    if (expression === 'laugh' || mouthOpen > 0.3) {
      const mh = 4 + mouthOpen * 10;
      ctx.fillRect(cx - 6, headY + 28, 14, mh);
      ctx.fillStyle = '#fff';
      ctx.fillRect(cx - 4, headY + 28, 10, Math.max(2, mh * 0.35));
    } else if (expression === 'angry') {
      ctx.fillRect(cx - 5, headY + 31, 12, 3);
      ctx.fillStyle = BODY.eye;
      ctx.fillRect(cx - 12, headY + 14, 8, 2);
      ctx.fillRect(cx + 6, headY + 14, 8, 2);
    } else if (expression === 'wow') {
      ctx.beginPath();
      ctx.arc(cx + 1, headY + 32, 5, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillRect(cx - 4, headY + 30, 10, 3);
    }
  }

  drawHat(ctx, hat, cx, headY, depth);
  ctx.restore();

  drawAccessory(
    ctx,
    accessory?.kind === 'parrot' ? accessory : null,
    cx,
    baseY,
    depth,
    Math.sin(headBob) * 2,
  );

  // Weapon arm
  ctx.save();
  const armX = cx + 24;
  const armY = baseY - 78;
  ctx.translate(armX + 6, armY + 8);
  ctx.rotate(-0.35 + swing + armR);
  ctx.translate(-(armX + 6), -(armY + 8));
  drawBox(ctx, armX, armY, 12, 40, depth - 2, BODY.skin, BODY.skinDark, BODY.skinLight);
  drawWeapon(ctx, sword, armX + 6, armY + 8, -0.9, weaponPulse);
  ctx.restore();

  ctx.restore();

  if (flash > 0) {
    ctx.fillStyle = `rgba(255,255,200,${flash * 0.35})`;
    ctx.fillRect(0, 0, w, h);
  }
  if (hurt > 0) {
    ctx.fillStyle = `rgba(255,40,40,${hurt * 0.4})`;
    ctx.fillRect(0, 0, w, h);
  }
}

function pickIdleMode(exclude) {
  const pool = IDLE_MODES.filter((m) => m !== exclude);
  return pool[Math.floor(Math.random() * pool.length)];
}

function idlePose(mode, t, phase) {
  const p = { expression: 'normal' };
  if (mode === 'dance') {
    p.bob = Math.sin(t * 8) * 6;
    p.lean = Math.sin(t * 4) * 0.18;
    p.legL = Math.sin(t * 8) * 0.55;
    p.legR = -Math.sin(t * 8) * 0.55;
    p.armL = Math.sin(t * 8 + 1) * 1.1;
    p.armR = Math.sin(t * 8) * 0.6;
    p.swing = Math.sin(t * 8) * 0.35;
    p.headTilt = Math.sin(t * 5) * 0.25;
    p.jump = Math.max(0, Math.sin(t * 8)) * 10;
    p.capeSway = Math.sin(t * 4) * 10;
    p.expression = 'laugh';
    p.mouthOpen = 0.4 + Math.sin(t * 10) * 0.3;
  } else if (mode === 'laugh') {
    p.bob = Math.sin(t * 14) * 4;
    p.squash = 1 + Math.sin(t * 14) * 0.08;
    p.stretch = 1 - Math.sin(t * 14) * 0.06;
    p.headTilt = Math.sin(t * 7) * 0.35;
    p.headBob = Math.sin(t * 14) * 3;
    p.armL = -0.8 + Math.sin(t * 12) * 0.4;
    p.armR = 0.3 + Math.sin(t * 12 + 1) * 0.2;
    p.legL = Math.sin(t * 10) * 0.15;
    p.legR = -Math.sin(t * 10) * 0.15;
    p.expression = 'laugh';
    p.mouthOpen = 0.7 + Math.sin(t * 16) * 0.3;
    p.eyesSquint = 0.8;
    p.capeSway = Math.sin(t * 6) * 6;
  } else if (mode === 'fight') {
    p.bob = Math.sin(t * 6) * 3;
    p.lean = -0.12 + Math.sin(t * 3) * 0.05;
    p.legL = 0.35;
    p.legR = -0.25;
    p.armL = -0.4 + Math.sin(t * 5) * 0.3;
    p.swing = -0.5 + Math.sin(t * 5 + phase) * 0.7;
    p.armR = Math.sin(t * 5 + phase) * 0.5;
    p.headTilt = -0.1;
    p.expression = 'angry';
    p.lunge = Math.sin(t * 5) * 4;
    p.capeSway = -4;
  } else if (mode === 'bounce') {
    const b = Math.abs(Math.sin(t * 5));
    p.jump = b * 18;
    p.squash = 1 + (1 - b) * 0.2;
    p.stretch = 1 - (1 - b) * 0.12;
    p.armL = -b * 1.2;
    p.armR = -b * 0.4;
    p.swing = -b * 0.3;
    p.legL = (1 - b) * 0.4;
    p.legR = (1 - b) * 0.4;
    p.expression = 'wow';
    p.headBob = -b * 4;
    p.capeSway = Math.sin(t * 5) * 8;
  } else {
    // wiggle
    p.bob = Math.sin(t * 3) * 2;
    p.lean = Math.sin(t * 9) * 0.22;
    p.spin = Math.sin(t * 2) * 0.05;
    p.headTilt = Math.sin(t * 11) * 0.4;
    p.armL = Math.sin(t * 9) * 0.8;
    p.armR = Math.cos(t * 9) * 0.5;
    p.swing = Math.cos(t * 9) * 0.4;
    p.legL = Math.sin(t * 9 + 0.5) * 0.35;
    p.legR = Math.cos(t * 9) * 0.35;
    p.expression = 'laugh';
    p.mouthOpen = 0.35;
    p.capeSway = Math.sin(t * 9) * 12;
  }
  return p;
}

export function createCharacterAnimator(canvas, getLoadoutFn) {
  let flash = 0;
  let hurt = 0;
  let raf = 0;
  let t0 = performance.now();
  let pose = {};
  let idleMode = 'dance';
  let modeUntil = 2.5;
  let action = null; // { type, t0, dur }
  let phase = Math.random() * 10;
  let weaponPulse = 0;
  let fxIntensity = 0;
  let fxAttacking = false;
  let fxCasting = false;
  const weaponFx = createWeaponParticleSystem();

  function loadout() {
    return getLoadoutFn();
  }

  function startAction(type, dur = 0.55) {
    action = { type, t0: performance.now(), dur };
    if (type === 'attack' || type === 'cast') {
      const { sword } = loadout();
      weaponFx.burst(sword, pose, canvas.width, canvas.height, type === 'cast' ? 36 : 28);
    }
  }

  function frame(now) {
    const t = (now - t0) / 1000;
    flash = Math.max(0, flash - 0.04);
    hurt = Math.max(0, hurt - 0.05);
    fxIntensity = 0;
    fxAttacking = false;
    fxCasting = false;

    if (t > modeUntil && !action) {
      idleMode = pickIdleMode(idleMode);
      modeUntil = t + 2.2 + Math.random() * 2.5;
      phase = Math.random() * 10;
    }

    if (action) {
      const u = Math.min(1, (now - action.t0) / (action.dur * 1000));
      if (action.type === 'attack') {
        const swingUp = u < 0.35 ? u / 0.35 : 1 - (u - 0.35) / 0.65;
        const strike = u > 0.3 && u < 0.65 ? Math.sin(((u - 0.3) / 0.35) * Math.PI) : 0;
        fxAttacking = true;
        fxIntensity = Math.max(swingUp * 0.55, strike);
        weaponPulse = fxIntensity;
        pose = {
          expression: 'angry',
          lean: -0.2 - strike * 0.25,
          lunge: strike * 28,
          jump: strike * 8,
          swing: -1.4 * swingUp - strike * 0.5,
          armR: -strike * 0.8,
          armL: -0.6 - strike * 0.4,
          legL: 0.5,
          legR: -0.4,
          headTilt: -0.15,
          squash: 1 + strike * 0.1,
          stretch: 1 - strike * 0.08,
          capeSway: -strike * 14,
          bob: Math.sin(t * 10) * 2,
        };
      } else if (action.type === 'cast') {
        // Staff blast: plant feet, thrust weapon arm forward
        const charge = u < 0.4 ? u / 0.4 : 1;
        const release = u > 0.4 ? Math.sin(((u - 0.4) / 0.6) * Math.PI) : 0;
        fxCasting = true;
        fxIntensity = Math.max(charge * 0.7, release);
        weaponPulse = fxIntensity;
        pose = {
          expression: 'angry',
          lean: -0.15 - release * 0.2,
          lunge: release * 10,
          jump: release * 4,
          swing: -0.2 - charge * 0.9 - release * 0.5,
          armR: -0.3 - release * 0.6,
          armL: 0.4,
          legL: 0.25,
          legR: -0.2,
          headTilt: -0.1,
          mouthOpen: 0.3 + release * 0.4,
          flashHint: release,
          capeSway: -6,
        };
      } else if (action.type === 'hurt') {
        const recoil = Math.sin(u * Math.PI);
        pose = {
          expression: 'wow',
          lean: 0.35 * recoil,
          lunge: -18 * recoil,
          headTilt: 0.4 * recoil,
          armL: 0.8,
          swing: 0.6,
          legL: -0.3,
          legR: 0.4,
          jump: recoil * 6,
          mouthOpen: 0.8,
          capeSway: recoil * 10,
        };
      } else if (action.type === 'celebrate') {
        pose = {
          ...idlePose('dance', t * 1.4, phase),
          jump: Math.abs(Math.sin(u * Math.PI * 3)) * 16,
          expression: 'laugh',
          mouthOpen: 0.9,
          spin: Math.sin(u * Math.PI * 2) * 0.15,
        };
      } else if (action.type === 'robot') {
        pose = {
          expression: 'wow',
          armL: Math.sin(u * Math.PI * 8) > 0 ? -1.2 : 0.4,
          armR: Math.sin(u * Math.PI * 8) > 0 ? 0.4 : -1.0,
          swing: Math.sin(u * Math.PI * 8) * 0.8,
          legL: Math.sin(u * Math.PI * 8) * 0.5,
          legR: -Math.sin(u * Math.PI * 8) * 0.5,
          headTilt: Math.sin(u * Math.PI * 6) * 0.3,
          bob: Math.abs(Math.sin(u * Math.PI * 8)) * 6,
          mouthOpen: 0.5,
        };
      } else if (action.type === 'spinDance') {
        pose = {
          expression: 'laugh',
          spin: u * Math.PI * 4,
          jump: Math.abs(Math.sin(u * Math.PI * 4)) * 22,
          armL: -1.2,
          armR: -0.8,
          swing: -0.6,
          mouthOpen: 0.9,
          capeSway: Math.sin(u * 20) * 16,
        };
      } else if (action.type === 'highfive') {
        pose = {
          expression: 'laugh',
          armL: -1.5,
          swing: -1.6,
          armR: -1.4,
          jump: Math.sin(u * Math.PI) * 28,
          lean: -0.25,
          mouthOpen: 1,
          headTilt: -0.2,
        };
      }
      if (u >= 1) {
        action = null;
        weaponPulse = 0;
      }
    } else {
      pose = idlePose(idleMode, t, phase);
      weaponPulse = Math.max(0, weaponPulse - 0.06);
      // Soft idle shimmer on glow weapons
      const { sword: idleSword } = loadout();
      if (idleSword?.glow) weaponPulse = 0.25 + Math.sin(t * 6) * 0.15;
    }

    const { sword, cosmetics } = loadout();
    drawCharacter(canvas, { sword, cosmetics, pose, flash, hurt, weaponPulse });
    const slashInfo = weaponFx.tick(sword, pose, canvas.width, canvas.height, {
      attacking: fxAttacking,
      casting: fxCasting,
      intensity: fxIntensity,
    });
    const ctx = canvas.getContext('2d');
    weaponFx.draw(ctx, slashInfo);
    raf = requestAnimationFrame(frame);
  }

  return {
    start() {
      cancelAnimationFrame(raf);
      t0 = performance.now();
      modeUntil = 2.5;
      idleMode = 'dance';
      weaponFx.clear();
      raf = requestAnimationFrame(frame);
    },
    stop() {
      cancelAnimationFrame(raf);
      weaponFx.clear();
    },
    celebrate() {
      startAction('celebrate', 0.7);
    },
    victoryDance(kind = 'spin') {
      if (kind === 'robot') startAction('robot', 1.1);
      else if (kind === 'highfive') startAction('highfive', 1.0);
      else startAction('spinDance', 1.1);
    },
    attack() {
      const { sword } = loadout();
      if (sword?.style === 'staff') startAction('cast', 0.55);
      else startAction('attack', 0.55);
    },
    cast() {
      startAction('cast', 0.55);
    },
    equipFlash() {
      flash = 1;
      const { sword } = loadout();
      weaponFx.burst(sword, pose, canvas.width, canvas.height, 40);
    },
    hurtFlash() {
      hurt = 1;
      startAction('hurt', 0.45);
    },
    capeFlap() {
      // brief celebrate-like cape whip via jump action
      if (!action) startAction('celebrate', 0.35);
    },
    redraw() {
      const { sword, cosmetics } = loadout();
      drawCharacter(canvas, { sword, cosmetics, pose, flash, hurt, weaponPulse });
      const slashInfo = weaponFx.tick(sword, pose, canvas.width, canvas.height, {
        attacking: false,
        casting: false,
        intensity: 0,
      });
      weaponFx.draw(canvas.getContext('2d'), slashInfo);
    },
  };
}
