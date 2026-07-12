/**
 * Weapon particle FX — idle trails + attack bursts, unique per weapon.
 */

function hexToRgb(hex) {
  const h = (hex || '#ffffff').replace('#', '');
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  const n = parseInt(full, 16);
  if (Number.isNaN(n)) return { r: 255, g: 255, b: 255 };
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

/** @returns {{ colors: string[], shapes: string[], glow: boolean, gravity: number, speed: number }} */
export function weaponFxProfile(weapon) {
  const id = weapon?.id || 'wood';
  const style = weapon?.style || 'sword';
  const c = weapon?.color || '#888';
  const e = weapon?.edge || c;
  const t = weapon?.tip || c;

  if (style === 'staff' || id === 'blaze_staff') {
    return {
      colors: [e, c, '#fff', '#FFD080', t],
      shapes: ['orb', 'ember', 'spark'],
      glow: true,
      gravity: -0.08,
      speed: 1.4,
      idleRate: 2.2,
    };
  }
  if (style === 'trident') {
    return {
      colors: [c, e, '#A8E8F8', '#fff', '#5AB0C8'],
      shapes: ['bubble', 'spark', 'drip'],
      glow: true,
      gravity: 0.12,
      speed: 1.1,
      idleRate: 1.6,
    };
  }
  if (style === 'axe') {
    return {
      colors: [c, e, t, '#5C3A1E', '#C4A484'],
      shapes: ['chip', 'spark', 'square'],
      glow: false,
      gravity: 0.22,
      speed: 1.5,
      idleRate: 0.7,
    };
  }
  if (id === 'enchanted') {
    return {
      colors: [c, e, '#C9B6FF', '#fff', '#7B5CFF'],
      shapes: ['star', 'spark', 'orb'],
      glow: true,
      gravity: -0.04,
      speed: 1.2,
      idleRate: 2.4,
    };
  }
  if (id === 'netherite') {
    return {
      colors: [c, e, '#FF8C20', '#2A1A1A', '#8A7A6A'],
      shapes: ['ember', 'smoke', 'spark'],
      glow: true,
      gravity: -0.06,
      speed: 1.15,
      idleRate: 1.8,
    };
  }
  if (id === 'diamond') {
    return {
      colors: [c, e, '#A8FFF4', '#fff', '#4AEDD9'],
      shapes: ['diamond', 'spark', 'star'],
      glow: true,
      gravity: 0.05,
      speed: 1.25,
      idleRate: 2.0,
    };
  }
  if (id === 'gold') {
    return {
      colors: [c, e, '#FFE566', '#fff', '#E8B923'],
      shapes: ['spark', 'star', 'square'],
      glow: true,
      gravity: 0.08,
      speed: 1.2,
      idleRate: 1.5,
    };
  }
  if (id === 'iron') {
    return {
      colors: [c, e, '#F0F0F0', '#888'],
      shapes: ['spark', 'chip', 'square'],
      glow: false,
      gravity: 0.15,
      speed: 1.2,
      idleRate: 1.0,
    };
  }
  if (id === 'stone') {
    return {
      colors: [c, e, '#B0B0B0', '#4A4A4A'],
      shapes: ['chip', 'square', 'spark'],
      glow: false,
      gravity: 0.2,
      speed: 1.1,
      idleRate: 0.8,
    };
  }
  // wood default
  return {
    colors: [c, e, t, '#C4A484', '#5C3A1E'],
    shapes: ['chip', 'leaf', 'spark'],
    glow: false,
    gravity: 0.18,
    speed: 1.0,
    idleRate: 0.9,
  };
}

function makeParticle(x, y, profile, burst = false) {
  const color = profile.colors[Math.floor(Math.random() * profile.colors.length)];
  const shape = profile.shapes[Math.floor(Math.random() * profile.shapes.length)];
  const angle = burst
    ? Math.random() * Math.PI * 2
    : -Math.PI / 2 + (Math.random() - 0.5) * 1.4;
  const speed = (burst ? 2.5 + Math.random() * 4.5 : 0.4 + Math.random() * 1.4) * profile.speed;
  return {
    x,
    y,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    life: 1,
    decay: burst ? 0.025 + Math.random() * 0.03 : 0.018 + Math.random() * 0.02,
    size: burst ? 3 + Math.random() * 5 : 2 + Math.random() * 3.5,
    color,
    shape,
    glow: profile.glow,
    gravity: profile.gravity,
    spin: Math.random() * Math.PI * 2,
    spinV: (Math.random() - 0.5) * 0.35,
  };
}

function drawShape(ctx, p) {
  const { r, g, b } = hexToRgb(p.color);
  const a = Math.max(0, p.life);
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate(p.spin);
  if (p.glow) {
    ctx.shadowColor = p.color;
    ctx.shadowBlur = 8 * a;
  }
  ctx.fillStyle = `rgba(${r},${g},${b},${a})`;

  const s = p.size;
  if (p.shape === 'star') {
    ctx.beginPath();
    for (let i = 0; i < 5; i += 1) {
      const ang = (i * 4 * Math.PI) / 5 - Math.PI / 2;
      const r1 = i === 0 ? s : s;
      const x = Math.cos(ang) * r1;
      const y = Math.sin(ang) * r1;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
  } else if (p.shape === 'diamond') {
    ctx.beginPath();
    ctx.moveTo(0, -s);
    ctx.lineTo(s * 0.7, 0);
    ctx.lineTo(0, s);
    ctx.lineTo(-s * 0.7, 0);
    ctx.closePath();
    ctx.fill();
  } else if (p.shape === 'orb' || p.shape === 'bubble') {
    ctx.beginPath();
    ctx.arc(0, 0, s, 0, Math.PI * 2);
    ctx.fill();
    if (p.shape === 'bubble') {
      ctx.fillStyle = `rgba(255,255,255,${a * 0.5})`;
      ctx.beginPath();
      ctx.arc(-s * 0.3, -s * 0.3, s * 0.3, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (p.shape === 'ember') {
    ctx.beginPath();
    ctx.arc(0, 0, s * 0.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = `rgba(255,255,200,${a * 0.6})`;
    ctx.beginPath();
    ctx.arc(0, -s * 0.2, s * 0.35, 0, Math.PI * 2);
    ctx.fill();
  } else if (p.shape === 'smoke') {
    ctx.fillStyle = `rgba(${r},${g},${b},${a * 0.45})`;
    ctx.beginPath();
    ctx.arc(0, 0, s * 1.4, 0, Math.PI * 2);
    ctx.fill();
  } else if (p.shape === 'leaf') {
    ctx.beginPath();
    ctx.ellipse(0, 0, s * 0.6, s, 0, 0, Math.PI * 2);
    ctx.fill();
  } else if (p.shape === 'drip') {
    ctx.beginPath();
    ctx.ellipse(0, 0, s * 0.45, s, 0, 0, Math.PI * 2);
    ctx.fill();
  } else if (p.shape === 'chip') {
    ctx.fillRect(-s * 0.5, -s * 0.4, s, s * 0.8);
  } else {
    // spark / square
    ctx.fillRect(-s * 0.35, -s * 0.35, s * 0.7, s * 0.7);
  }
  ctx.restore();
}

/** Draw a sweeping slash arc behind the weapon tip. */
export function drawSlashArc(ctx, tipX, tipY, angle, color, intensity) {
  if (intensity < 0.15) return;
  ctx.save();
  ctx.translate(tipX, tipY);
  ctx.rotate(angle);
  ctx.strokeStyle = color;
  ctx.globalAlpha = Math.min(1, intensity) * 0.85;
  ctx.lineWidth = 3 + intensity * 5;
  ctx.shadowColor = color;
  ctx.shadowBlur = 12;
  ctx.beginPath();
  ctx.arc(0, 10, 34 + intensity * 20, -2.2, -0.4);
  ctx.stroke();
  ctx.globalAlpha = Math.min(1, intensity) * 0.45;
  ctx.lineWidth = 8 + intensity * 6;
  ctx.beginPath();
  ctx.arc(0, 10, 30 + intensity * 16, -2.0, -0.6);
  ctx.stroke();
  ctx.restore();
}

export function createWeaponParticleSystem() {
  /** @type {ReturnType<typeof makeParticle>[]} */
  let particles = [];
  let emitAcc = 0;

  function tipFromPose(pose, canvasW, canvasH) {
    // Approximate weapon tip in canvas space (mirrors drawCharacter layout)
    const {
      bob = 0,
      jump = 0,
      lunge = 0,
      lean = 0,
      spin = 0,
      swing = 0,
      armR = 0,
      squash = 1,
      stretch = 1,
    } = pose || {};
    const cx = canvasW * 0.42 + lunge;
    const baseY = canvasH * 0.78 + bob - jump;
    const armX = cx + 24;
    const armY = baseY - 78;
    const pivotX = armX + 6;
    const pivotY = armY + 8;
    const rot = -0.35 + swing + armR;
    // tip relative to arm pivot before weapon local rotate (-0.9)
    const localAngle = rot - 0.9;
    const reach = 52;
    let tipX = pivotX + Math.sin(localAngle) * reach;
    let tipY = pivotY - Math.cos(localAngle) * reach;
    // crude lean/spin around feet
    const dx = tipX - cx;
    const dy = tipY - baseY;
    const a = lean + spin;
    tipX = cx + (dx * Math.cos(a) - dy * Math.sin(a)) * squash;
    tipY = baseY + (dx * Math.sin(a) + dy * Math.cos(a)) * stretch;
    return { tipX, tipY, angle: localAngle };
  }

  return {
    /**
     * @param {object} weapon
     * @param {object} pose
     * @param {number} canvasW
     * @param {number} canvasH
     * @param {{ attacking?: boolean, casting?: boolean, intensity?: number }} mode
     */
    tick(weapon, pose, canvasW, canvasH, mode = {}) {
      const profile = weaponFxProfile(weapon);
      const { tipX, tipY, angle } = tipFromPose(pose, canvasW, canvasH);
      const intensity = mode.intensity || 0;
      const attacking = mode.attacking || mode.casting;

      emitAcc += attacking ? profile.idleRate * (4 + intensity * 10) : profile.idleRate;
      while (emitAcc >= 1) {
        emitAcc -= 1;
        particles.push(makeParticle(tipX, tipY, profile, false));
      }

      if (attacking && intensity > 0.25) {
        const n = 2 + Math.floor(intensity * 6);
        for (let i = 0; i < n; i += 1) {
          particles.push(makeParticle(tipX, tipY, profile, true));
        }
      }

      // Cap
      if (particles.length > 180) particles = particles.slice(-180);

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.gravity;
        p.vx *= 0.98;
        p.life -= p.decay;
        p.spin += p.spinV;
        p.size *= 0.992;
      }
      particles = particles.filter((p) => p.life > 0.02);

      return { tipX, tipY, angle, profile, intensity };
    },

    burst(weapon, pose, canvasW, canvasH, count = 28) {
      const profile = weaponFxProfile(weapon);
      const { tipX, tipY } = tipFromPose(pose, canvasW, canvasH);
      for (let i = 0; i < count; i += 1) {
        particles.push(makeParticle(tipX, tipY, profile, true));
      }
    },

    draw(ctx, slashInfo) {
      for (const p of particles) drawShape(ctx, p);
      if (slashInfo && slashInfo.intensity > 0.15) {
        drawSlashArc(
          ctx,
          slashInfo.tipX,
          slashInfo.tipY,
          slashInfo.angle,
          slashInfo.profile.colors[0],
          slashInfo.intensity,
        );
      }
    },

    clear() {
      particles = [];
    },
  };
}

/**
 * DOM particle spray for battle hits — matches equipped weapon colors.
 */
export function spawnWeaponHitParticles(fromEl, weapon, count = 22) {
  if (!fromEl || typeof document === 'undefined') return;
  const profile = weaponFxProfile(weapon);
  const r = fromEl.getBoundingClientRect();
  const x = r.left + r.width * 0.65;
  const y = r.top + r.height * 0.35;

  for (let i = 0; i < count; i += 1) {
    const el = document.createElement('div');
    const color = profile.colors[i % profile.colors.length];
    const shape = profile.shapes[i % profile.shapes.length];
    el.className = `weapon-fx-bit shape-${shape}`;
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    el.style.background = color;
    el.style.boxShadow = profile.glow
      ? `0 0 0 2px #000, 0 0 10px ${color}`
      : '0 0 0 2px #000';
    const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
    const dist = 70 + Math.random() * 90;
    el.style.setProperty('--dx', `${Math.cos(angle) * dist}px`);
    el.style.setProperty('--dy', `${Math.sin(angle) * dist}px`);
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 700);
  }

  // Slash streak
  const slash = document.createElement('div');
  slash.className = 'weapon-slash';
  slash.style.left = `${x}px`;
  slash.style.top = `${y}px`;
  slash.style.background = `linear-gradient(90deg, transparent, ${profile.colors[0]}, ${profile.colors[1] || profile.colors[0]}, transparent)`;
  slash.style.boxShadow = `0 0 16px ${profile.colors[0]}`;
  document.body.appendChild(slash);
  setTimeout(() => slash.remove(), 420);
}
