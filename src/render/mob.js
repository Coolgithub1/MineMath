/**
 * Canvas voxel-style Minecraft-inspired mobs with silly animations.
 */

import { playSillyWardenNoise } from '../game/audio.js';

const IDLE_MODES = ['dance', 'laugh', 'fight', 'bounce', 'taunt'];
const CRAZY_IDLE_MODES = ['dance', 'laugh', 'bounce', 'taunt'];

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

function drawLimb(ctx, x, y, w, h, d, colors, angle, pivotX, pivotY) {
  ctx.save();
  ctx.translate(pivotX, pivotY);
  ctx.rotate(angle);
  ctx.translate(-pivotX, -pivotY);
  drawBox(ctx, x, y, w, h, d, colors[0], colors[1], colors[2]);
  ctx.restore();
}

function faceExtras(ctx, cx, headY, expression, mouthOpen, eyeColor = '#111') {
  if (expression === 'laugh' || mouthOpen > 0.25) {
    const mh = 4 + mouthOpen * 8;
    ctx.fillStyle = eyeColor;
    ctx.fillRect(cx - 7, headY + 28, 16, mh);
    ctx.fillStyle = '#fff';
    ctx.fillRect(cx - 5, headY + 28, 12, Math.max(2, mh * 0.3));
  } else if (expression === 'angry') {
    ctx.fillStyle = eyeColor;
    ctx.fillRect(cx - 8, headY + 30, 18, 4);
    ctx.fillRect(cx - 14, headY + 10, 10, 3);
    ctx.fillRect(cx + 6, headY + 10, 10, 3);
  } else if (expression === 'wow') {
    ctx.fillStyle = eyeColor;
    ctx.beginPath();
    ctx.arc(cx + 1, headY + 32, 5, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawZombie(ctx, cx, baseY, depth, hurt, pose) {
  const green = hurt ? '#8a3a3a' : '#4A7A3A';
  const greenD = hurt ? '#5a2020' : '#2A5A2A';
  const greenL = hurt ? '#b06060' : '#6A9A5A';
  const shirt = '#3A4A6A';
  const pants = '#2C3A4A';
  const {
    legL = 0, legR = 0, armL = 0, armR = 0,
    headTilt = 0, headBob = 0, expression = 'normal', mouthOpen = 0,
  } = pose;

  drawLimb(ctx, cx - 18, baseY - 36, 14, 36, depth, [pants, '#1a2838', '#3a4a5a'], legL, cx - 11, baseY - 36);
  drawLimb(ctx, cx + 4, baseY - 36, 14, 36, depth, [pants, '#1a2838', '#3a4a5a'], legR, cx + 11, baseY - 36);
  drawBox(ctx, cx - 22, baseY - 84, 44, 48, depth + 2, shirt, '#2a3a4a', '#4a5a7a');
  drawLimb(ctx, cx - 36, baseY - 70, 12, 44, depth - 2, [green, greenD, greenL], armL, cx - 30, baseY - 68);
  drawLimb(ctx, cx + 24, baseY - 70, 12, 44, depth - 2, [green, greenD, greenL], armR, cx + 30, baseY - 68);

  const headY = baseY - 124 + headBob;
  ctx.save();
  ctx.translate(cx, headY + 20);
  ctx.rotate(headTilt);
  ctx.translate(-cx, -(headY + 20));
  drawBox(ctx, cx - 20, headY, 40, 40, depth + 4, green, greenD, greenL);
  ctx.fillStyle = '#111';
  ctx.fillRect(cx - 12, headY + 16, 8, 8);
  ctx.fillRect(cx + 6, headY + 16, 8, 8);
  faceExtras(ctx, cx, headY, expression, mouthOpen, '#2a1a10');
  if (expression === 'normal' && mouthOpen < 0.2) {
    ctx.fillStyle = '#2a1a10';
    ctx.fillRect(cx - 6, headY + 30, 14, 4);
  }
  ctx.restore();
}

function drawCreeper(ctx, cx, baseY, depth, hurt, pose) {
  if (pose.exploded) return;
  const fuse = pose.fuse || 0;
  const flash = fuse > 0 && Math.floor(fuse * 14) % 2 === 0;
  const face = hurt || flash ? '#8a3a3a' : '#3A8A3A';
  const side = hurt || flash ? '#5a2020' : '#1A5A1A';
  const top = hurt || flash ? '#b06060' : '#5AAA5A';
  const { legL = 0, legR = 0, headTilt = 0, headBob = 0, expression = 'normal', mouthOpen = 0 } = pose;

  drawLimb(ctx, cx - 20, baseY - 40, 16, 40, depth, [face, side, top], legL, cx - 12, baseY - 40);
  drawLimb(ctx, cx + 4, baseY - 40, 16, 40, depth, [face, side, top], legR, cx + 12, baseY - 40);
  drawBox(ctx, cx - 22, baseY - 100, 44, 60, depth + 2, face, side, top);
  const headY = baseY - 140 + headBob;
  ctx.save();
  ctx.translate(cx, headY + 20);
  ctx.rotate(headTilt);
  ctx.translate(-cx, -(headY + 20));
  drawBox(ctx, cx - 22, headY, 44, 40, depth + 4, face, side, top);
  ctx.fillStyle = '#111';
  ctx.fillRect(cx - 14, headY + 12, 10, 10);
  ctx.fillRect(cx + 6, headY + 12, 10, 10);
  if (expression === 'laugh' || mouthOpen > 0.25) {
    const mh = 6 + mouthOpen * 8;
    ctx.fillRect(cx - 8, headY + 24, 18, mh);
  } else {
    ctx.fillRect(cx - 6, headY + 24, 14, 8);
    ctx.fillRect(cx - 10, headY + 28, 6, 8);
    ctx.fillRect(cx + 6, headY + 28, 6, 8);
  }
  ctx.restore();
}

function drawBow(ctx, cx, baseY, armAngle = 0) {
  ctx.save();
  const bx = cx - 34;
  const by = baseY - 78;
  ctx.translate(bx + 6, by + 20);
  ctx.rotate(-0.55 + armAngle);
  ctx.translate(-(bx + 6), -(by + 20));
  ctx.strokeStyle = '#5C3A1E';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.arc(bx, by + 8, 28, -1.1, 1.1);
  ctx.stroke();
  ctx.strokeStyle = '#C4A484';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(bx - 8, by - 16);
  ctx.lineTo(bx - 8, by + 32);
  ctx.stroke();
  ctx.fillStyle = '#8B5A2B';
  ctx.fillRect(bx - 40, by + 6, 36, 4);
  ctx.fillStyle = '#C0C0C0';
  ctx.beginPath();
  ctx.moveTo(bx - 44, by + 8);
  ctx.lineTo(bx - 36, by + 2);
  ctx.lineTo(bx - 36, by + 14);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#C0392B';
  ctx.fillRect(bx - 8, by + 4, 4, 8);
  ctx.restore();
}

function drawSkeleton(ctx, cx, baseY, depth, hurt, pose) {
  const bone = hurt ? '#e0a0a0' : '#E8E0D0';
  const boneD = hurt ? '#a06060' : '#B0A890';
  const boneL = hurt ? '#ffd0d0' : '#FFF8F0';
  const {
    legL = 0, legR = 0, armL = 0, armR = 0,
    headTilt = 0, headBob = 0, expression = 'normal', mouthOpen = 0,
    bowDraw = 0,
  } = pose;
  const colors = [bone, boneD, boneL];

  drawLimb(ctx, cx - 14, baseY - 36, 10, 36, depth - 2, colors, legL, cx - 9, baseY - 36);
  drawLimb(ctx, cx + 6, baseY - 36, 10, 36, depth - 2, colors, legR, cx + 11, baseY - 36);
  drawBox(ctx, cx - 16, baseY - 84, 34, 48, depth, bone, boneD, boneL);
  drawLimb(ctx, cx - 28, baseY - 80, 10, 40, depth - 2, colors, armL - bowDraw * 0.4, cx - 23, baseY - 78);
  drawLimb(ctx, cx + 20, baseY - 80, 10, 40, depth - 2, colors, armR + bowDraw * 0.5, cx + 25, baseY - 78);
  drawBow(ctx, cx, baseY, -bowDraw * 0.35);

  const headY = baseY - 120 + headBob;
  ctx.save();
  ctx.translate(cx, headY + 18);
  ctx.rotate(headTilt);
  ctx.translate(-cx, -(headY + 18));
  drawBox(ctx, cx - 18, headY, 38, 36, depth + 2, bone, boneD, boneL);
  ctx.fillStyle = '#111';
  ctx.fillRect(cx - 10, headY + 12, 8, 10);
  ctx.fillRect(cx + 6, headY + 12, 8, 10);
  faceExtras(ctx, cx, headY - 2, expression, mouthOpen);
  if (expression === 'normal' && mouthOpen < 0.2) {
    ctx.fillRect(cx - 4, headY + 26, 12, 3);
  }
  ctx.restore();
}

function drawSpider(ctx, cx, baseY, depth, hurt, pose, rainbow = false) {
  const hue = rainbow ? (performance.now() / 9) % 360 : 0;
  const rh = (h, sat = 75, light = 45) => {
    const hh = ((h % 360) + 360) % 360;
    const s = sat / 100;
    const l = light / 100;
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs(((hh / 60) % 2) - 1));
    const m = l - c / 2;
    let r = 0;
    let g = 0;
    let b = 0;
    if (hh < 60) [r, g, b] = [c, x, 0];
    else if (hh < 120) [r, g, b] = [x, c, 0];
    else if (hh < 180) [r, g, b] = [0, c, x];
    else if (hh < 240) [r, g, b] = [0, x, c];
    else if (hh < 300) [r, g, b] = [x, 0, c];
    else [r, g, b] = [c, 0, x];
    const to = (n) => Math.round((n + m) * 255).toString(16).padStart(2, '0');
    return `#${to(r)}${to(g)}${to(b)}`;
  };

  const body = hurt ? '#8a3a3a' : rainbow ? rh(hue, 80, 38) : '#2A1A1A';
  const side = hurt ? '#5a2020' : rainbow ? rh(hue + 50, 70, 28) : '#111';
  const top = hurt ? '#b06060' : rainbow ? rh(hue + 110, 85, 58) : '#3A2A2A';
  const { legL = 0, armL = 0, headTilt = 0, expression = 'normal', mouthOpen = 0, bob = 0 } = pose;
  const size = rainbow ? 1.55 : 1;

  if (rainbow) {
    ctx.save();
    ctx.shadowColor = rh(hue, 90, 60);
    ctx.shadowBlur = 24;
    for (let i = 0; i < 12; i += 1) {
      const a = (i / 12) * Math.PI * 2 + hue * 0.03;
      const rad = 70 + Math.sin(hue * 0.05 + i) * 14;
      ctx.fillStyle = rh(hue + i * 30, 95, 62);
      ctx.globalAlpha = 0.5;
      ctx.beginPath();
      ctx.arc(cx + Math.cos(a) * rad, baseY - 55 + Math.sin(a) * 22, 5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  drawBox(
    ctx,
    cx - 28 * size,
    baseY - 50 * size,
    56 * size,
    36 * size,
    depth + 4,
    body,
    side,
    top,
  );
  ctx.save();
  ctx.translate(cx, baseY - 64 * size);
  ctx.rotate(headTilt);
  ctx.translate(-cx, -(baseY - 64 * size));
  drawBox(
    ctx,
    cx - 16 * size,
    baseY - 78 * size,
    32 * size,
    28 * size,
    depth + 2,
    body,
    side,
    top,
  );
  ctx.fillStyle = rainbow ? rh(hue + 200, 95, 65) : '#E74C3C';
  if (rainbow) {
    ctx.shadowColor = ctx.fillStyle;
    ctx.shadowBlur = 14;
  }
  ctx.fillRect(cx - 10 * size, baseY - 68 * size, 8 * size, 8 * size);
  ctx.fillRect(cx + 4 * size, baseY - 68 * size, 8 * size, 8 * size);
  ctx.shadowBlur = 0;
  if (expression === 'laugh' || mouthOpen > 0.3 || rainbow) {
    ctx.fillStyle = '#111';
    ctx.fillRect(cx - 10 * size, baseY - 58 * size, 22 * size, 6 + mouthOpen * 8);
    if (rainbow) {
      ctx.fillStyle = '#fff';
      ctx.fillRect(cx - 8 * size, baseY - 56 * size, 4 * size, 6);
      ctx.fillRect(cx + 4 * size, baseY - 56 * size, 4 * size, 6);
    }
  }
  ctx.restore();

  ctx.strokeStyle = rainbow ? rh(hue + 160, 85, 50) : body;
  ctx.lineWidth = rainbow ? 7 : 4;
  if (rainbow) {
    ctx.shadowColor = ctx.strokeStyle;
    ctx.shadowBlur = 10;
  }
  const kick = legL * 12 + armL * 8;
  const legs = rainbow
    ? [[-70, -30], [-64, 0], [-72, -55], [70, -30], [64, 0], [72, -55], [-50, 10], [50, 10]]
    : [[-40, -20], [-36, 0], [40, -20], [36, 0], [-42, -40], [42, -40]];
  legs.forEach(([lx, ly], i) => {
    const wave = Math.sin(i + bob * 0.2) * (rainbow ? 10 : 6) + (i % 2 === 0 ? kick : -kick);
    if (rainbow) ctx.strokeStyle = rh(hue + i * 40, 90, 52);
    ctx.beginPath();
    ctx.moveTo(cx, baseY - 40 * size);
    ctx.lineTo(cx + lx * (rainbow ? 1 : 1) + wave, baseY + ly);
    ctx.stroke();
  });
  ctx.shadowBlur = 0;

  if (rainbow) {
    ctx.save();
    ctx.font = 'bold 13px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#FFE566';
    ctx.shadowColor = '#FF4D6D';
    ctx.shadowBlur = 12;
    ctx.fillText('OP RAINBOW SPIDER', cx, baseY - 120);
    ctx.font = 'bold 9px sans-serif';
    ctx.fillStyle = '#fff';
    ctx.fillText('BILLION THOUSAND HEARTS!!!', cx, baseY - 106);
    ctx.restore();
  }
}

function drawEnderman(ctx, cx, baseY, depth, hurt, pose) {
  if (pose.invisible) {
    ctx.fillStyle = '#C9B6FF';
    for (let i = 0; i < 8; i += 1) {
      const a = (i / 8) * Math.PI * 2 + (pose.teleportSpin || 0);
      const r = 18 + (i % 3) * 8;
      ctx.fillRect(cx + Math.cos(a) * r - 3, baseY - 90 + Math.sin(a) * r - 3, 6, 6);
    }
    return;
  }

  const body = hurt ? '#5a2030' : '#1A0A1A';
  const side = '#0A000A';
  const top = hurt ? '#8a4060' : '#2A1A2A';
  const {
    legL = 0, legR = 0, armL = 0, armR = 0,
    headTilt = 0, headBob = 0, expression = 'normal', mouthOpen = 0,
  } = pose;
  const colors = [body, side, top];

  drawLimb(ctx, cx - 12, baseY - 50, 10, 50, depth - 2, colors, legL, cx - 7, baseY - 50);
  drawLimb(ctx, cx + 4, baseY - 50, 10, 50, depth - 2, colors, legR, cx + 9, baseY - 50);
  drawBox(ctx, cx - 16, baseY - 120, 34, 70, depth, body, side, top);
  drawLimb(ctx, cx - 28, baseY - 115, 10, 70, depth - 2, colors, armL, cx - 23, baseY - 112);
  drawLimb(ctx, cx + 20, baseY - 115, 10, 70, depth - 2, colors, armR, cx + 25, baseY - 112);

  const headY = baseY - 156 + headBob;
  ctx.save();
  ctx.translate(cx, headY + 17);
  ctx.rotate(headTilt);
  ctx.translate(-cx, -(headY + 17));
  drawBox(ctx, cx - 16, headY, 34, 34, depth + 2, body, side, top);
  ctx.fillStyle = '#E74C3C';
  ctx.fillRect(cx - 10, headY + 12, 12, 5);
  ctx.fillRect(cx + 4, headY + 12, 12, 5);
  if (expression === 'laugh' || mouthOpen > 0.3) {
    ctx.fillStyle = '#E74C3C';
    ctx.fillRect(cx - 6, headY + 22, 14, 4 + mouthOpen * 6);
  }
  ctx.restore();
}

function drawWitherSkel(ctx, cx, baseY, depth, hurt, pose) {
  const bone = hurt ? '#5a3030' : '#2A2A2A';
  const boneD = '#111';
  const boneL = hurt ? '#8a5050' : '#4A4A4A';
  const {
    legL = 0, legR = 0, armL = 0, armR = 0,
    headTilt = 0, headBob = 0, expression = 'normal', mouthOpen = 0,
  } = pose;
  const colors = [bone, boneD, boneL];

  drawLimb(ctx, cx - 14, baseY - 40, 10, 40, depth - 2, colors, legL, cx - 9, baseY - 40);
  drawLimb(ctx, cx + 6, baseY - 40, 10, 40, depth - 2, colors, legR, cx + 11, baseY - 40);
  drawBox(ctx, cx - 18, baseY - 100, 38, 60, depth, bone, boneD, boneL);
  drawLimb(ctx, cx - 30, baseY - 95, 10, 50, depth - 2, colors, armL, cx - 25, baseY - 92);
  drawLimb(ctx, cx + 22, baseY - 95, 10, 50, depth - 2, colors, armR, cx + 27, baseY - 92);

  const headY = baseY - 140 + headBob;
  ctx.save();
  ctx.translate(cx, headY + 20);
  ctx.rotate(headTilt);
  ctx.translate(-cx, -(headY + 20));
  drawBox(ctx, cx - 20, headY, 42, 40, depth + 2, bone, boneD, boneL);
  ctx.fillStyle = '#E74C3C';
  ctx.fillRect(cx - 12, headY + 14, 10, 8);
  ctx.fillRect(cx + 6, headY + 14, 10, 8);
  if (expression === 'laugh' || mouthOpen > 0.3) {
    ctx.fillRect(cx - 6, headY + 28, 16, 5 + mouthOpen * 6);
  }
  ctx.restore();
}

function drawGiant(ctx, cx, baseY, depth, hurt, pose) {
  drawZombie(ctx, cx, baseY, depth + 2, hurt, pose);
  const green = hurt ? '#8a3a3a' : '#4A7A3A';
  ctx.fillStyle = green;
  ctx.globalAlpha = 0.35;
  ctx.fillRect(cx - 34, baseY - 130, 70, 100);
  ctx.globalAlpha = 1;
}

/** Steve-like figure with glowing white eyes — Herobrine. */
function drawHerobrine(ctx, cx, baseY, depth, hurt, pose) {
  const skin = hurt ? '#c07070' : '#C68642';
  const skinD = '#A86B32';
  const shirt = hurt ? '#5a2020' : '#3A7A2A';
  const pants = '#2C4A7A';
  const {
    legL = 0, legR = 0, armL = 0, armR = 0,
    headTilt = 0, headBob = 0, expression = 'angry',
  } = pose;
  drawLimb(ctx, cx - 18, baseY - 36, 14, 36, depth, [pants, '#1C3A5A', '#3C6A9A'], legL, cx - 11, baseY - 36);
  drawLimb(ctx, cx + 4, baseY - 36, 14, 36, depth, [pants, '#1C3A5A', '#3C6A9A'], legR, cx + 11, baseY - 36);
  drawBox(ctx, cx - 22, baseY - 84, 44, 48, depth + 2, shirt, '#2A5A1A', '#4A9A3A');
  drawLimb(ctx, cx - 36, baseY - 80, 12, 40, depth - 2, [skin, skinD, skin], armL, cx - 30, baseY - 78);
  drawLimb(ctx, cx + 24, baseY - 80, 12, 40, depth - 2, [skin, skinD, skin], armR, cx + 30, baseY - 78);
  const headY = baseY - 124 + headBob;
  ctx.save();
  ctx.translate(cx, headY + 20);
  ctx.rotate(headTilt);
  ctx.translate(-cx, -(headY + 20));
  drawBox(ctx, cx - 20, headY, 40, 40, depth + 4, skin, skinD, '#E0A060');
  ctx.fillStyle = '#3B2414';
  ctx.fillRect(cx - 20, headY, 40, 10);
  ctx.shadowColor = '#fff';
  ctx.shadowBlur = 14;
  ctx.fillStyle = '#fff';
  ctx.fillRect(cx - 12, headY + 16, 10, 8);
  ctx.fillRect(cx + 4, headY + 16, 10, 8);
  ctx.shadowBlur = 0;
  if (expression === 'angry') {
    ctx.fillStyle = '#111';
    ctx.fillRect(cx - 6, headY + 30, 14, 3);
  }
  ctx.restore();
}

function drawEnderDragon(ctx, cx, baseY, depth, hurt, pose, rainbow = false) {
  const hue = rainbow ? (performance.now() / 10) % 360 : 0;
  const rainbowHex = (h, sat = 75, light = 48) => {
    const hh = ((h % 360) + 360) % 360;
    const s = sat / 100;
    const l = light / 100;
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs(((hh / 60) % 2) - 1));
    const m = l - c / 2;
    let r = 0;
    let g = 0;
    let b = 0;
    if (hh < 60) [r, g, b] = [c, x, 0];
    else if (hh < 120) [r, g, b] = [x, c, 0];
    else if (hh < 180) [r, g, b] = [0, c, x];
    else if (hh < 240) [r, g, b] = [0, x, c];
    else if (hh < 300) [r, g, b] = [x, 0, c];
    else [r, g, b] = [c, 0, x];
    const to = (n) => Math.round((n + m) * 255).toString(16).padStart(2, '0');
    return `#${to(r)}${to(g)}${to(b)}`;
  };

  const body = hurt
    ? '#6a3060'
    : rainbow
      ? rainbowHex(hue, 80, 42)
      : '#1A0A2A';
  const wing = hurt
    ? '#a05090'
    : rainbow
      ? rainbowHex(hue + 80, 85, 55)
      : '#4A2A6A';
  const wing2 = rainbow ? rainbowHex(hue + 160, 90, 58) : wing;
  const eye = rainbow ? rainbowHex(hue + 200, 95, 65) : '#E74C3C';
  const {
    armL = 0, armR = 0, headTilt = 0, headBob = 0, bob = 0, jump = 0,
  } = pose;
  const flap = Math.sin((armL + armR + bob) * 2) * 0.5;

  if (rainbow) {
    ctx.save();
    ctx.shadowColor = rainbowHex(hue, 90, 60);
    ctx.shadowBlur = 22;
    for (let i = 0; i < 10; i += 1) {
      const a = (i / 10) * Math.PI * 2 + hue * 0.02;
      const rr = 55 + Math.sin(hue * 0.04 + i) * 12;
      ctx.fillStyle = rainbowHex(hue + i * 36, 95, 65);
      ctx.globalAlpha = 0.55;
      ctx.beginPath();
      ctx.arc(cx + Math.cos(a) * rr, baseY - 90 + Math.sin(a) * 28, 4, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  // Wings
  ctx.fillStyle = wing;
  if (rainbow) {
    ctx.shadowColor = wing;
    ctx.shadowBlur = 16;
  }
  ctx.beginPath();
  ctx.moveTo(cx - 10, baseY - 90);
  ctx.lineTo(cx - 100, baseY - 120 - flap * 45 - jump);
  ctx.lineTo(cx - 20, baseY - 70);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = wing2;
  ctx.beginPath();
  ctx.moveTo(cx + 10, baseY - 90);
  ctx.lineTo(cx + 100, baseY - 120 + flap * 45 - jump);
  ctx.lineTo(cx + 20, baseY - 70);
  ctx.closePath();
  ctx.fill();
  ctx.shadowBlur = 0;

  // Body + neck
  const side = rainbow ? rainbowHex(hue + 40, 70, 30) : '#0A0010';
  const top = rainbow ? rainbowHex(hue + 120, 85, 62) : '#2A1A3A';
  drawBox(ctx, cx - 30, baseY - 72, 60, 44, depth + 4, body, side, top);
  drawBox(ctx, cx - 12, baseY - 115, 24, 44, depth, body, side, top);
  const headY = baseY - 148 + headBob;
  ctx.save();
  ctx.translate(cx, headY + 16);
  ctx.rotate(headTilt);
  ctx.translate(-cx, -(headY + 16));
  drawBox(ctx, cx - 24, headY, 48, 34, depth + 2, body, side, top);
  ctx.fillStyle = eye;
  ctx.shadowColor = eye;
  ctx.shadowBlur = rainbow ? 16 : 10;
  ctx.fillRect(cx - 16, headY + 12, 14, 7);
  ctx.fillRect(cx + 4, headY + 12, 14, 7);
  ctx.shadowBlur = 0;
  ctx.fillStyle = rainbow ? '#fff' : '#C9B6FF';
  ctx.fillRect(cx - 5, headY + 24, 12, 6);
  ctx.restore();
  // Tail
  ctx.fillStyle = body;
  ctx.fillRect(cx - 6, baseY - 30, 12, 28);
  ctx.fillStyle = rainbow ? wing2 : body;
  ctx.fillRect(cx + 4, baseY - 8, 22, 12);

  if (rainbow) {
    ctx.save();
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#FFE566';
    ctx.shadowColor = '#FF4D6D';
    ctx.shadowBlur = 10;
    ctx.fillText('OP RAINBOW DRAGON', cx, baseY - 165);
    ctx.restore();
  }
}

function drawWarden(ctx, cx, baseY, depth, hurt, pose, mode = false) {
  const opMode = mode === 'op';
  const superMode = mode === true || mode === 'super' || opMode;
  const hue = opMode ? (performance.now() / 8) % 360 : 0;
  const rh = (h, sat = 75, light = 48) => {
    const s = Math.max(0, Math.min(100, sat));
    const l = Math.max(0, Math.min(100, light));
    return `hsl(${((h % 360) + 360) % 360} ${s}% ${l}%)`;
  };
  const body = hurt
    ? '#3a5a6a'
    : opMode
      ? rh(hue, 70, 28)
      : (superMode ? '#0A2A4A' : '#0E2A3A');
  const glow = opMode ? rh(hue + 140, 95, 62) : (superMode ? '#7DFFB0' : '#4AEDD9');
  const side = opMode ? rh(hue + 40, 65, 18) : '#061018';
  const top = opMode ? rh(hue + 90, 85, 55) : glow;
  const {
    legL = 0, legR = 0, armL = 0, armR = 0,
    headTilt = 0, headBob = 0, expression = 'angry',
  } = pose;
  const thick = opMode ? 14 : (superMode ? 6 : 0);
  const size = opMode ? 1.12 : 1;

  if (opMode) {
    ctx.save();
    ctx.shadowColor = glow;
    ctx.shadowBlur = 28;
    for (let i = 0; i < 10; i += 1) {
      const a = (i / 10) * Math.PI * 2 + performance.now() / 220;
      const r = 52 + Math.sin(performance.now() / 140 + i) * 10;
      ctx.fillStyle = rh(hue + i * 36, 95, 65);
      ctx.beginPath();
      ctx.arc(
        cx + Math.cos(a) * r,
        baseY - 90 + Math.sin(a) * r * 0.55,
        4 + (i % 3),
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }
    ctx.restore();
  }

  drawLimb(ctx, cx - 22 * size - thick / 2, baseY - 44 * size, (18 + thick) * size, 44 * size, depth, [body, side, top], legL, cx - 13 * size, baseY - 44 * size);
  drawLimb(ctx, cx + 4 * size, baseY - 44 * size, (18 + thick) * size, 44 * size, depth, [body, side, top], legR, cx + 13 * size, baseY - 44 * size);
  drawBox(ctx, cx - 30 * size - thick / 2, baseY - 110 * size, (60 + thick) * size, 66 * size, depth + 4, body, side, top);
  drawLimb(ctx, cx - 48 * size, baseY - 100 * size, 16 * size, 70 * size, depth, [body, side, top], armL, cx - 40 * size, baseY - 98 * size);
  drawLimb(ctx, cx + 32 * size, baseY - 100 * size, 16 * size, 70 * size, depth, [body, side, top], armR, cx + 40 * size, baseY - 98 * size);
  ctx.fillStyle = glow;
  ctx.shadowColor = glow;
  ctx.shadowBlur = opMode ? 26 : (superMode ? 18 : 10);
  ctx.fillRect(cx - 14 * size, baseY - 90 * size, 8 * size, 28 * size);
  ctx.fillRect(cx + 6 * size, baseY - 90 * size, 8 * size, 28 * size);
  if (superMode) {
    ctx.fillRect(cx - 4 * size, baseY - 95 * size, 8 * size, 36 * size);
    ctx.fillStyle = opMode ? rh(hue + 200, 95, 58) : '#FF4D6D';
    ctx.fillRect(cx - 18 * size, baseY - 70 * size, 36 * size, 6 * size);
  }
  ctx.shadowBlur = 0;
  const headY = baseY - 150 * size + headBob;
  ctx.save();
  ctx.translate(cx, headY + 20 * size);
  ctx.rotate(headTilt);
  ctx.translate(-cx, -(headY + 20 * size));
  drawBox(ctx, cx - 24 * size, headY, 48 * size, 42 * size, depth + 3, body, side, top);
  ctx.fillStyle = body;
  ctx.fillRect(cx - 28 * size, headY - 16 * size, 12 * size, 20 * size);
  ctx.fillRect(cx + 16 * size, headY - 16 * size, 12 * size, 20 * size);
  if (opMode) {
    ctx.fillStyle = rh(hue + 180, 90, 60);
    ctx.shadowColor = glow;
    ctx.shadowBlur = 14;
    ctx.fillRect(cx - 30 * size, headY - 28 * size, 8 * size, 14 * size);
    ctx.fillRect(cx + 22 * size, headY - 28 * size, 8 * size, 14 * size);
  }
  ctx.fillStyle = glow;
  ctx.shadowColor = glow;
  ctx.shadowBlur = opMode ? 20 : 12;
  ctx.fillRect(cx - 10 * size, headY + 14 * size, 8 * size, 8 * size);
  ctx.fillRect(cx + 4 * size, headY + 14 * size, 8 * size, 8 * size);
  ctx.shadowBlur = 0;
  if (expression === 'laugh' || expression === 'wow' || opMode) {
    ctx.fillStyle = '#111';
    const mh = opMode ? 10 + Math.abs(Math.sin(performance.now() / 90)) * 8 : 8;
    ctx.fillRect(cx - 10 * size, headY + 26 * size, 22 * size, mh);
    ctx.fillStyle = '#fff';
    ctx.fillRect(cx - 6 * size, headY + 28 * size, 4 * size, 5 * size);
    ctx.fillRect(cx + 4 * size, headY + 28 * size, 4 * size, 5 * size);
  } else if (expression === 'angry') {
    ctx.fillStyle = '#111';
    ctx.fillRect(cx - 8 * size, headY + 28 * size, 18 * size, 4 * size);
  }
  ctx.restore();
}

function drawBlaze(ctx, cx, baseY, depth, hurt, pose) {
  const fire = hurt ? '#ff8080' : '#FF8C20';
  const core = hurt ? '#ffe0a0' : '#FFE566';
  const { headBob = 0, bob = 0, armL = 0, jump = 0 } = pose;
  // Rods orbiting
  for (let i = 0; i < 8; i += 1) {
    const a = (i / 8) * Math.PI * 2 + bob * 0.15 + armL;
    const r = 34 + (i % 2) * 10;
    const rx = cx + Math.cos(a) * r;
    const ry = baseY - 70 + Math.sin(a) * 22 - jump * 0.3;
    ctx.fillStyle = i % 2 ? fire : core;
    ctx.shadowColor = fire;
    ctx.shadowBlur = 8;
    ctx.fillRect(rx - 3, ry - 14, 6, 28);
  }
  ctx.shadowBlur = 0;
  const headY = baseY - 100 + headBob;
  drawBox(ctx, cx - 18, headY, 36, 36, depth + 2, fire, '#8B3A00', core);
  ctx.fillStyle = '#111';
  ctx.fillRect(cx - 10, headY + 12, 8, 8);
  ctx.fillRect(cx + 4, headY + 12, 8, 8);
  ctx.fillStyle = core;
  ctx.fillRect(cx - 4, headY + 24, 10, 4);
}

function drawWither(ctx, cx, baseY, depth, hurt, pose, shiny = false) {
  const hue = shiny ? (performance.now() / 9) % 360 : 0;
  const rh = (h, sat = 75, light = 48) => {
    const s = Math.max(0, Math.min(100, sat));
    const l = Math.max(0, Math.min(100, light));
    return `hsl(${((h % 360) + 360) % 360} ${s}% ${l}%)`;
  };
  const bone = hurt
    ? '#5a3030'
    : shiny
      ? rh(hue, 35, 22)
      : '#2A2A2A';
  const side = shiny ? rh(hue + 40, 50, 12) : '#111';
  const top = shiny ? rh(hue + 90, 85, 58) : '#4A4A4A';
  const eye = shiny ? rh(hue + 200, 95, 65) : '#E74C3C';
  const {
    armL = 0, armR = 0, headTilt = 0, headBob = 0, expression = 'angry',
  } = pose;

  if (shiny) {
    ctx.save();
    ctx.shadowColor = rh(hue, 95, 60);
    ctx.shadowBlur = 26;
    for (let i = 0; i < 12; i += 1) {
      const a = (i / 12) * Math.PI * 2 + performance.now() / 200;
      const r = 58 + Math.sin(performance.now() / 160 + i) * 8;
      ctx.fillStyle = rh(hue + i * 30, 95, 65);
      ctx.beginPath();
      ctx.arc(cx + Math.cos(a) * r, baseY - 100 + Math.sin(a) * r * 0.45, 3 + (i % 3), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  // Three heads
  const heads = [-36, 0, 36];
  heads.forEach((ox, i) => {
    const hy = baseY - 130 + headBob + (i === 1 ? -8 : 0);
    if (shiny) {
      ctx.shadowColor = eye;
      ctx.shadowBlur = 16;
    }
    drawBox(ctx, cx + ox - 16, hy, 32, 32, depth + 2, bone, side, top);
    ctx.fillStyle = eye;
    ctx.shadowColor = eye;
    ctx.shadowBlur = shiny ? 14 : 8;
    ctx.fillRect(cx + ox - 10, hy + 12, 8, 6);
    ctx.fillRect(cx + ox + 4, hy + 12, 8, 6);
    ctx.shadowBlur = 0;
    if (shiny) {
      ctx.fillStyle = '#fff';
      ctx.fillRect(cx + ox - 8, hy + 13, 3, 3);
      ctx.fillRect(cx + ox + 6, hy + 13, 3, 3);
    }
  });
  // Body spine
  drawBox(ctx, cx - 14, baseY - 90, 28, 50, depth, bone, side, top);
  drawLimb(ctx, cx - 40, baseY - 85, 12, 50, depth - 2, [bone, side, top], armL, cx - 34, baseY - 82);
  drawLimb(ctx, cx + 28, baseY - 85, 12, 50, depth - 2, [bone, side, top], armR, cx + 34, baseY - 82);
  // Ribs
  ctx.strokeStyle = shiny ? rh(hue + 160, 90, 60) : bone;
  ctx.lineWidth = shiny ? 5 : 4;
  if (shiny) {
    ctx.shadowColor = rh(hue + 160, 95, 65);
    ctx.shadowBlur = 10;
  }
  for (let i = 0; i < 3; i += 1) {
    ctx.beginPath();
    ctx.moveTo(cx - 22, baseY - 80 + i * 12);
    ctx.lineTo(cx + 22, baseY - 80 + i * 12);
    ctx.stroke();
  }
  ctx.shadowBlur = 0;
  if (expression === 'angry' || shiny) {
    ctx.fillStyle = eye;
    ctx.fillRect(cx - 6, baseY - 55, 12, 4);
  }
  void headTilt;
}

function drawLion(ctx, cx, baseY, depth, hurt, pose) {
  const fur = hurt ? '#c07040' : '#E8A040';
  const mane = hurt ? '#8a4020' : '#C0392B';
  const dark = '#8B5A2B';
  const {
    legL = 0, legR = 0, armL = 0, headTilt = 0, headBob = 0, expression = 'angry', mouthOpen = 0,
  } = pose;
  drawLimb(ctx, cx - 22, baseY - 32, 14, 32, depth, [fur, dark, '#FFE080'], legL, cx - 15, baseY - 32);
  drawLimb(ctx, cx + 8, baseY - 32, 14, 32, depth, [fur, dark, '#FFE080'], legR, cx + 15, baseY - 32);
  drawBox(ctx, cx - 30, baseY - 70, 60, 40, depth + 3, fur, dark, '#FFE080');
  // Tail
  ctx.strokeStyle = fur;
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(cx + 28, baseY - 50);
  ctx.quadraticCurveTo(cx + 50, baseY - 70 + armL * 10, cx + 58, baseY - 40);
  ctx.stroke();
  ctx.fillStyle = mane;
  ctx.fillRect(cx + 54, baseY - 44, 10, 10);
  // Mane
  ctx.fillStyle = mane;
  for (let i = 0; i < 8; i += 1) {
    const a = -0.4 + i * 0.35;
    ctx.beginPath();
    ctx.arc(cx - 8 + Math.cos(a) * 6, baseY - 100 + Math.sin(a) * 4, 14, 0, Math.PI * 2);
    ctx.fill();
  }
  const headY = baseY - 112 + headBob;
  ctx.save();
  ctx.translate(cx - 8, headY + 18);
  ctx.rotate(headTilt);
  ctx.translate(-(cx - 8), -(headY + 18));
  drawBox(ctx, cx - 28, headY, 40, 36, depth + 2, fur, dark, '#FFE080');
  ctx.fillStyle = '#111';
  ctx.fillRect(cx - 20, headY + 14, 8, 6);
  ctx.fillRect(cx - 2, headY + 14, 8, 6);
  ctx.fillStyle = '#fff';
  ctx.fillRect(cx - 18, headY + 15, 3, 3);
  const mh = 4 + mouthOpen * 10;
  ctx.fillStyle = '#111';
  ctx.fillRect(cx - 14, headY + 24, 18, mh);
  if (expression === 'angry' || mouthOpen > 0.2) {
    ctx.fillStyle = '#fff';
    ctx.fillRect(cx - 12, headY + 24, 4, 6);
    ctx.fillRect(cx + 2, headY + 24, 4, 6);
  }
  ctx.restore();
}

function drawMobBody(ctx, mobType, cx, baseY, depth, hurt, pose) {
  if (mobType === 'creeper') drawCreeper(ctx, cx, baseY, depth, hurt, pose);
  else if (mobType === 'skeleton') drawSkeleton(ctx, cx, baseY, depth, hurt, pose);
  else if (mobType === 'spider') drawSpider(ctx, cx, baseY, depth, hurt, pose, false);
  else if (mobType === 'op_rainbow_spider') drawSpider(ctx, cx, baseY, depth, hurt, pose, true);
  else if (mobType === 'enderman') drawEnderman(ctx, cx, baseY, depth, hurt, pose);
  else if (mobType === 'wither_skel') drawWitherSkel(ctx, cx, baseY, depth, hurt, pose);
  else if (mobType === 'giant') drawGiant(ctx, cx, baseY, depth, hurt, pose);
  else if (mobType === 'herobrine') drawHerobrine(ctx, cx, baseY, depth, hurt, pose);
  else if (mobType === 'ender_dragon') drawEnderDragon(ctx, cx, baseY, depth, hurt, pose, false);
  else if (mobType === 'op_rainbow_dragon') drawEnderDragon(ctx, cx, baseY, depth, hurt, pose, true);
  else if (mobType === 'warden') drawWarden(ctx, cx, baseY, depth, hurt, pose, false);
  else if (mobType === 'super_warden') drawWarden(ctx, cx, baseY, depth, hurt, pose, 'super');
  else if (mobType === 'op_super_warden') drawWarden(ctx, cx, baseY, depth, hurt, pose, 'op');
  else if (mobType === 'blaze') drawBlaze(ctx, cx, baseY, depth, hurt, pose);
  else if (mobType === 'wither') drawWither(ctx, cx, baseY, depth, hurt, pose, false);
  else if (mobType === 'op_shiny_wither') drawWither(ctx, cx, baseY, depth, hurt, pose, true);
  else if (mobType === 'lion') drawLion(ctx, cx, baseY, depth, hurt, pose);
  else drawZombie(ctx, cx, baseY, depth, hurt, pose);
}

const BOSS_PARADE = [
  { id: 'herobrine', x: 0.16, y: 0.88, s: 0.78 },
  { id: 'lion', x: 0.38, y: 0.90, s: 0.72 },
  { id: 'warden', x: 0.62, y: 0.90, s: 0.7 },
  { id: 'blaze', x: 0.84, y: 0.86, s: 0.68 },
  { id: 'wither', x: 0.22, y: 0.58, s: 0.62 },
  { id: 'super_warden', x: 0.72, y: 0.55, s: 0.75 },
  { id: 'ender_dragon', x: 0.48, y: 0.42, s: 0.8 },
];

function drawBossHorde(ctx, w, h, pose, hurt) {
  // Title banner glow
  ctx.save();
  ctx.font = 'bold 14px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillStyle = '#FFE566';
  ctx.shadowColor = '#FF4D6D';
  ctx.shadowBlur = 12;
  ctx.fillText('BOSS HORDE!!!', w / 2, 22);
  ctx.restore();

  BOSS_PARADE.forEach((slot, i) => {
    ctx.save();
    const px = w * slot.x;
    const py = h * slot.y;
    ctx.translate(px, py);
    ctx.scale(slot.s, slot.s);
    const localPose = {
      ...pose,
      bob: (pose.bob || 0) + Math.sin((pose.bob || 0) * 0.2 + i) * 3,
      armL: (pose.armL || 0) + Math.sin(i + 1) * 0.2,
      armR: (pose.armR || 0) - Math.sin(i + 2) * 0.2,
    };
    // Local origin as character feet
    drawMobBody(ctx, slot.id, 0, 0, 8, hurt, localPose);
    ctx.restore();
  });
}

/**
 * @param {HTMLCanvasElement} canvas
 * @param {{ mobType: string, pose?: object, hurt?: number, shake?: number, scale?: number }} opts
 */
export function drawMob(canvas, opts) {
  const {
    mobType = 'zombie',
    pose = {},
    hurt = 0,
    shake = 0,
    scale = 1,
  } = opts;
  const {
    bob = 0,
    lean = 0,
    jump = 0,
    squash = 1,
    stretch = 1,
    lunge = 0,
    spin = 0,
    fuse = 0,
    explodeFlash = 0,
  } = pose;

  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;
  ctx.clearRect(0, 0, w, h);

  const isHurt = hurt > 0;

  if (mobType === 'boss_horde') {
    ctx.save();
    ctx.translate(shake + lunge * 0.3, -jump * 0.3);
    drawBossHorde(ctx, w, h, pose, isHurt);
    ctx.restore();
    if (hurt > 0) {
      ctx.fillStyle = `rgba(255,40,40,${hurt * 0.35})`;
      ctx.fillRect(0, 0, w, h);
    }
    return;
  }

  const fuseSwell = 1 + fuse * 0.35;

  ctx.save();
  const cx0 = w * 0.5;
  const base0 = h * 0.88;
  ctx.translate(cx0 + shake + lunge, base0 - jump);
  ctx.rotate(lean + spin);
  ctx.scale(scale * squash * fuseSwell, scale * stretch * fuseSwell);
  ctx.translate(-w * 0.42, -h * 0.78);

  const cx = w * 0.42;
  const baseY = h * 0.78 + bob / Math.max(scale, 0.01);
  const depth = 10;

  ctx.fillStyle = 'rgba(0,0,0,0.18)';
  ctx.beginPath();
  ctx.ellipse(cx + 8, h * 0.86, 48 * Math.min(scale, 1.2), 12, 0, 0, Math.PI * 2);
  ctx.fill();

  drawMobBody(ctx, mobType, cx, baseY, depth, isHurt, pose);

  ctx.restore();

  if (hurt > 0) {
    ctx.fillStyle = `rgba(255,40,40,${hurt * 0.35})`;
    ctx.fillRect(0, 0, w, h);
  }
  if (explodeFlash > 0) {
    ctx.fillStyle = `rgba(255,255,220,${explodeFlash})`;
    ctx.fillRect(0, 0, w, h);
  }
}

function pickIdleMode(exclude, crazy = false) {
  const pool = (crazy ? CRAZY_IDLE_MODES : IDLE_MODES).filter((m) => m !== exclude);
  return pool[Math.floor(Math.random() * pool.length)] || 'dance';
}

function amplifyCrazyPose(p, t) {
  return {
    ...p,
    bob: (p.bob || 0) * 2.2 + Math.sin(t * 17) * 6,
    lean: (p.lean || 0) * 1.8 + Math.sin(t * 11) * 0.25,
    jump: Math.max(p.jump || 0, 0) * 1.6 + Math.abs(Math.sin(t * 9)) * 10,
    armL: (p.armL || 0) * 1.5 + Math.sin(t * 13) * 0.5,
    armR: (p.armR || 0) * 1.5 - Math.sin(t * 14) * 0.5,
    legL: (p.legL || 0) * 1.4,
    legR: (p.legR || 0) * 1.4,
    headTilt: (p.headTilt || 0) * 1.6 + Math.sin(t * 15) * 0.35,
    spin: Math.sin(t * 6) * 0.18,
    mouthOpen: Math.max(p.mouthOpen || 0, 0.55 + Math.sin(t * 20) * 0.35),
    expression: 'laugh',
    squash: 1 + Math.sin(t * 16) * 0.12,
    stretch: 1 - Math.sin(t * 16) * 0.1,
  };
}

function idlePose(mode, t, phase) {
  const p = { expression: 'normal', bob: 0 };
  if (mode === 'dance') {
    p.bob = Math.sin(t * 7) * 5;
    p.lean = Math.sin(t * 3.5) * 0.2;
    p.legL = Math.sin(t * 7) * 0.6;
    p.legR = -Math.sin(t * 7) * 0.6;
    p.armL = Math.sin(t * 7 + 1) * 1.0;
    p.armR = -Math.sin(t * 7) * 1.0;
    p.headTilt = Math.sin(t * 5) * 0.3;
    p.jump = Math.max(0, Math.sin(t * 7)) * 8;
    p.expression = 'laugh';
    p.mouthOpen = 0.45 + Math.sin(t * 9) * 0.25;
  } else if (mode === 'laugh') {
    p.bob = Math.sin(t * 13) * 4;
    p.squash = 1 + Math.sin(t * 13) * 0.1;
    p.stretch = 1 - Math.sin(t * 13) * 0.08;
    p.headTilt = Math.sin(t * 8) * 0.4;
    p.headBob = Math.sin(t * 13) * 4;
    p.armL = -0.9 + Math.sin(t * 11) * 0.35;
    p.armR = 0.9 - Math.sin(t * 11) * 0.35;
    p.expression = 'laugh';
    p.mouthOpen = 0.75 + Math.sin(t * 15) * 0.25;
  } else if (mode === 'fight') {
    p.bob = Math.sin(t * 5) * 3;
    p.lean = 0.1 + Math.sin(t * 4) * 0.08;
    p.legL = -0.3;
    p.legR = 0.35;
    p.armL = -0.8 + Math.sin(t * 6 + phase) * 0.9;
    p.armR = 0.5 + Math.sin(t * 6 + phase + 1) * 0.6;
    p.headTilt = 0.12;
    p.expression = 'angry';
    p.lunge = Math.sin(t * 5) * -5;
  } else if (mode === 'bounce') {
    const b = Math.abs(Math.sin(t * 4.5));
    p.jump = b * 16;
    p.squash = 1 + (1 - b) * 0.22;
    p.stretch = 1 - (1 - b) * 0.14;
    p.armL = -b * 1.1;
    p.armR = -b * 1.1;
    p.legL = (1 - b) * 0.35;
    p.legR = (1 - b) * 0.35;
    p.expression = 'wow';
    p.mouthOpen = b * 0.6;
  } else {
    // taunt
    p.bob = Math.sin(t * 4) * 2;
    p.armL = -1.2 + Math.sin(t * 8) * 0.3;
    p.armR = Math.sin(t * 3) * 0.4;
    p.headTilt = Math.sin(t * 6) * 0.25;
    p.lean = Math.sin(t * 3) * 0.12;
    p.expression = 'laugh';
    p.mouthOpen = 0.5 + Math.sin(t * 10) * 0.3;
    p.legL = Math.sin(t * 4) * 0.2;
    p.legR = -Math.sin(t * 4) * 0.2;
  }
  return p;
}

export function createMobAnimator(canvas, getMobFn) {
  let hurt = 0;
  let shake = 0;
  let raf = 0;
  let t0 = performance.now();
  let pose = {};
  let idleMode = 'taunt';
  let modeUntil = 2.2;
  let action = null;
  let phase = Math.random() * 10;
  let nextSillySound = 1.2;

  function startAction(type, dur = 0.55) {
    action = { type, t0: performance.now(), dur };
  }

  function frame(now) {
    const t = (now - t0) / 1000;
    hurt = Math.max(0, hurt - 0.05);
    shake = hurt > 0 ? Math.sin(now / 30) * 6 : 0;
    const mobSnap = getMobFn();
    const crazy = mobSnap.mobType === 'op_super_warden';

    if (t > modeUntil && !action) {
      idleMode = pickIdleMode(idleMode, crazy);
      modeUntil = t + (crazy ? 0.7 + Math.random() * 1.1 : 2 + Math.random() * 2.8);
      phase = Math.random() * 10;
    }

    if (crazy && t > nextSillySound && !action) {
      playSillyWardenNoise();
      nextSillySound = t + 0.9 + Math.random() * 1.6;
    }

    if (action) {
      const u = Math.min(1, (now - action.t0) / (action.dur * 1000));
      if (action.type === 'attack') {
        const strike = u > 0.2 && u < 0.7 ? Math.sin(((u - 0.2) / 0.5) * Math.PI) : 0;
        pose = {
          expression: 'angry',
          lean: 0.25 + strike * 0.2,
          lunge: -strike * 32,
          jump: strike * 10,
          armL: -1.2 - strike * 0.6,
          armR: -0.8 - strike * 0.8,
          legL: -0.45,
          legR: 0.5,
          headTilt: 0.2,
          squash: 1 + strike * 0.12,
          stretch: 1 - strike * 0.1,
          mouthOpen: 0.4,
          bob: Math.sin(t * 12) * 2,
        };
      } else if (action.type === 'fuse') {
        pose = {
          expression: 'angry',
          fuse: u,
          squash: 1 + u * 0.15,
          stretch: 1 + u * 0.1,
          bob: Math.sin(t * 30) * (2 + u * 4),
          mouthOpen: 0.5,
        };
      } else if (action.type === 'explode') {
        pose = {
          exploded: u > 0.15,
          explodeFlash: u < 0.35 ? 1 - u / 0.35 : Math.max(0, 1 - (u - 0.35) / 0.65),
          fuse: 1,
          squash: 1.4 + u * 0.8,
          stretch: 1.4 + u * 0.8,
        };
      } else if (action.type === 'respawn') {
        pose = {
          expression: 'wow',
          squash: 0.4 + u * 0.6,
          stretch: 0.4 + u * 0.6,
          jump: (1 - u) * 20,
          mouthOpen: 0.6,
        };
      } else if (action.type === 'shoot') {
        pose = {
          expression: 'angry',
          bowDraw: u < 0.55 ? u / 0.55 : Math.max(0, 1 - (u - 0.55) / 0.45),
          armL: -0.3,
          armR: 0.4,
          lean: 0.1,
          headTilt: 0.05,
        };
      } else if (action.type === 'teleportOut') {
        pose = {
          invisible: u > 0.35,
          teleportSpin: u * 10,
          squash: 1 - u * 0.5,
          stretch: 1 + u * 0.4,
          expression: 'angry',
        };
      } else if (action.type === 'teleportIn') {
        pose = {
          invisible: u < 0.3,
          teleportSpin: (1 - u) * 10,
          squash: 0.5 + u * 0.5,
          stretch: 1.4 - u * 0.4,
          expression: 'angry',
          mouthOpen: 0.4,
        };
      } else if (action.type === 'hurt') {
        const recoil = Math.sin(u * Math.PI);
        pose = {
          expression: 'wow',
          lean: -0.4 * recoil,
          lunge: 16 * recoil,
          headTilt: -0.45 * recoil,
          armL: 0.9,
          armR: -0.9,
          jump: recoil * 8,
          mouthOpen: 0.9,
          spin: Math.sin(u * Math.PI * 2) * 0.12,
        };
      } else if (action.type === 'defeat') {
        pose = {
          expression: 'wow',
          lean: Math.sin(u * Math.PI) * 0.6,
          spin: u * 0.8,
          jump: Math.sin(u * Math.PI) * 20,
          squash: 1 + u * 0.3,
          stretch: 1 - u * 0.25,
          mouthOpen: 1,
          armL: 1.2,
          armR: -1.2,
        };
      }
      if (u >= 1) {
        if (action.type === 'explode') {
          pose = { exploded: true };
        }
        action = null;
      }
    } else if (!pose.exploded) {
      pose = idlePose(idleMode, t, phase);
      if (crazy) pose = amplifyCrazyPose(pose, t);
      // Keep bow visible on skeletons during idle
      if (mobSnap.mobType === 'skeleton' || mobSnap.mobType === 'wither_skel') {
        pose.bowDraw = 0.15;
      }
    }

    const { mobType, scale } = mobSnap;
    drawMob(canvas, { mobType, pose, hurt, shake, scale });
    raf = requestAnimationFrame(frame);
  }

  return {
    start() {
      cancelAnimationFrame(raf);
      t0 = performance.now();
      modeUntil = 2.2;
      idleMode = 'dance';
      nextSillySound = 0.4;
      pose = {};
      raf = requestAnimationFrame(frame);
    },
    stop() {
      cancelAnimationFrame(raf);
    },
    takeHit() {
      hurt = 1;
      startAction('hurt', 0.4);
    },
    attack() {
      startAction('attack', 0.55);
    },
    fuse(dur = 0.85) {
      startAction('fuse', dur);
    },
    explode(dur = 0.55) {
      startAction('explode', dur);
    },
    respawn(dur = 0.45) {
      pose = {};
      startAction('respawn', dur);
    },
    shoot(dur = 0.55) {
      startAction('shoot', dur);
    },
    teleportOut(dur = 0.35) {
      startAction('teleportOut', dur);
    },
    teleportIn(dur = 0.35) {
      startAction('teleportIn', dur);
    },
    defeat() {
      hurt = 1;
      startAction('defeat', 0.7);
    },
    redraw() {
      const { mobType, scale } = getMobFn();
      drawMob(canvas, { mobType, pose, hurt, shake, scale });
    },
  };
}
