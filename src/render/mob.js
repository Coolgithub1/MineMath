/**
 * Canvas voxel-style Minecraft-inspired mobs with silly animations.
 */

const IDLE_MODES = ['dance', 'laugh', 'fight', 'bounce', 'taunt'];

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

function drawSpider(ctx, cx, baseY, depth, hurt, pose) {
  const body = hurt ? '#8a3a3a' : '#2A1A1A';
  const side = hurt ? '#5a2020' : '#111';
  const top = hurt ? '#b06060' : '#3A2A2A';
  const { legL = 0, armL = 0, headTilt = 0, expression = 'normal', mouthOpen = 0, bob = 0 } = pose;

  drawBox(ctx, cx - 28, baseY - 50, 56, 36, depth + 4, body, side, top);
  ctx.save();
  ctx.translate(cx, baseY - 64);
  ctx.rotate(headTilt);
  ctx.translate(-cx, -(baseY - 64));
  drawBox(ctx, cx - 16, baseY - 78, 32, 28, depth + 2, body, side, top);
  ctx.fillStyle = '#E74C3C';
  ctx.fillRect(cx - 10, baseY - 68, 6, 6);
  ctx.fillRect(cx + 6, baseY - 68, 6, 6);
  if (expression === 'laugh' || mouthOpen > 0.3) {
    ctx.fillStyle = '#111';
    ctx.fillRect(cx - 8, baseY - 58, 18, 6 + mouthOpen * 6);
  }
  ctx.restore();

  ctx.strokeStyle = body;
  ctx.lineWidth = 4;
  const kick = legL * 12 + armL * 8;
  [[-40, -20], [-36, 0], [40, -20], [36, 0], [-42, -40], [42, -40]].forEach(([lx, ly], i) => {
    const wave = Math.sin(i + bob * 0.2) * 6 + (i % 2 === 0 ? kick : -kick);
    ctx.beginPath();
    ctx.moveTo(cx, baseY - 40);
    ctx.lineTo(cx + lx + wave, baseY + ly);
    ctx.stroke();
  });
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

  const isHurt = hurt > 0;
  if (mobType === 'creeper') drawCreeper(ctx, cx, baseY, depth, isHurt, pose);
  else if (mobType === 'skeleton') drawSkeleton(ctx, cx, baseY, depth, isHurt, pose);
  else if (mobType === 'spider') drawSpider(ctx, cx, baseY, depth, isHurt, pose);
  else if (mobType === 'enderman') drawEnderman(ctx, cx, baseY, depth, isHurt, pose);
  else if (mobType === 'wither_skel') drawWitherSkel(ctx, cx, baseY, depth, isHurt, pose);
  else if (mobType === 'giant') drawGiant(ctx, cx, baseY, depth, isHurt, pose);
  else drawZombie(ctx, cx, baseY, depth, isHurt, pose);

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

function pickIdleMode(exclude) {
  const pool = IDLE_MODES.filter((m) => m !== exclude);
  return pool[Math.floor(Math.random() * pool.length)];
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

  function startAction(type, dur = 0.55) {
    action = { type, t0: performance.now(), dur };
  }

  function frame(now) {
    const t = (now - t0) / 1000;
    hurt = Math.max(0, hurt - 0.05);
    shake = hurt > 0 ? Math.sin(now / 30) * 6 : 0;

    if (t > modeUntil && !action) {
      idleMode = pickIdleMode(idleMode);
      modeUntil = t + 2 + Math.random() * 2.8;
      phase = Math.random() * 10;
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
      // Keep bow visible on skeletons during idle
      if (getMobFn().mobType === 'skeleton' || getMobFn().mobType === 'wither_skel') {
        pose.bowDraw = 0.15;
      }
    }

    const { mobType, scale } = getMobFn();
    drawMob(canvas, { mobType, pose, hurt, shake, scale });
    raf = requestAnimationFrame(frame);
  }

  return {
    start() {
      cancelAnimationFrame(raf);
      t0 = performance.now();
      modeUntil = 2.2;
      idleMode = 'taunt';
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
