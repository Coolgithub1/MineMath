/** Default practice set — blank + x = y (child solves for ___). */
export const DEFAULT_EQUATIONS = [
  { x: 23, y: 38, op: '+' },
  { x: 36, y: 46, op: '+' },
  { x: 11, y: 35, op: '+' },
  { x: 18, y: 89, op: '+' },
  { x: 59, y: 89, op: '+' },
  { x: 36, y: 78, op: '+' },
  { x: 21, y: 35, op: '+' },
  { x: 60, y: 88, op: '+' },
  { x: 71, y: 93, op: '+' },
  { x: 16, y: 47, op: '+' },
  { x: 10, y: 89, op: '+' },
  { x: 3, y: 75, op: '+' },
  { x: 13, y: 14, op: '+' },
  { x: 12, y: 72, op: '+' },
  { x: 48, y: 114, op: '+' },
  { x: 67, y: 78, op: '+' },
  { x: 80, y: 89, op: '+' },
  { x: 73, y: 88, op: '+' },
  { x: 14, y: 74, op: '+' },
];

/** @deprecated use DEFAULT_EQUATIONS */
export const STARTER_EQUATIONS = DEFAULT_EQUATIONS.map((e) => [e.x, e.y]);

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/**
 * Convert legacy { a, b, op } (a ± b = ?) into blank form { x, y, op }.
 * @param {{ a?: number, b?: number, x?: number, y?: number, op?: string }} e
 * @returns {{ x: number, y: number, op: '+'|'-' } | null}
 */
export function toBlankEquation(e) {
  if (!e || typeof e !== 'object') return null;
  const op = e.op === '-' ? '-' : '+';

  if (Number.isFinite(Number(e.x)) && Number.isFinite(Number(e.y))) {
    const x = Number(e.x);
    const y = Number(e.y);
    if (!Number.isInteger(x) || !Number.isInteger(y)) return null;
    return { x, y, op };
  }

  // Legacy: a + b = ?  →  ___ + b = (a+b), blank = a
  // Legacy: a − b = ?  →  ___ − b = (a−b), blank = a
  const a = Number(e.a);
  const b = Number(e.b);
  if (!Number.isFinite(a) || !Number.isFinite(b)) return null;
  if (!Number.isInteger(a) || !Number.isInteger(b)) return null;
  if (op === '+') return { x: b, y: a + b, op: '+' };
  return { x: b, y: a - b, op: '-' };
}

/**
 * Answer for ___ ± x = y
 * @param {{ x: number, y: number, op?: '+'|'-' }} eq
 */
export function computeAnswer(eq) {
  const x = Number(eq.x);
  const y = Number(eq.y);
  return eq.op === '-' ? y + x : y - x;
}

/**
 * Display as ___ + x = y (no answer shown).
 * @param {{ x: number, y: number, op?: '+'|'-' }} eq
 */
export function formatEquation(eq) {
  const op = eq.op === '-' ? '−' : '+';
  return `___ ${op} ${eq.x} = ${eq.y}`;
}

/**
 * Normalize / validate parent-entered x and y for ___ ± x = y.
 * @returns {{ ok: true, equation: { x: number, y: number, op: '+'|'-' } } | { ok: false, reason: string }}
 */
export function parseEquation(xRaw, yRaw, opRaw = '+') {
  const x = Number(xRaw);
  const y = Number(yRaw);
  const op = opRaw === '-' ? '-' : '+';
  if (!Number.isFinite(x) || !Number.isFinite(y)) {
    return { ok: false, reason: 'Enter x and y.' };
  }
  if (!Number.isInteger(x) || !Number.isInteger(y)) {
    return { ok: false, reason: 'Use whole numbers only.' };
  }
  if (x < 0 || y < 0 || x > 9999 || y > 9999) {
    return { ok: false, reason: 'Use numbers from 0 to 9999.' };
  }
  if (op === '+' && y < x) {
    return { ok: false, reason: 'For __ + x = y, y must be at least as big as x.' };
  }
  const answer = op === '-' ? y + x : y - x;
  if (answer < 0 || answer > 9999) {
    return { ok: false, reason: 'The blank would be outside 0–9999.' };
  }
  return { ok: true, equation: { x, y, op } };
}

function makeDistractors(answer) {
  const set = new Set([answer]);
  const span = Math.max(4, Math.min(50, Math.round(Math.abs(answer) * 0.12) || 4));
  const candidates = [];
  for (let d = 1; d <= span; d += 1) {
    candidates.push(answer + d, answer - d);
  }
  for (const c of shuffle(candidates)) {
    if (set.has(c)) continue;
    set.add(c);
    if (set.size >= 4) break;
  }
  while (set.size < 4) {
    const extra = answer + randInt(-span * 2, span * 2);
    if (!set.has(extra)) set.add(extra);
  }
  return [...set].filter((n) => n !== answer);
}

/**
 * Pick the next equation from the player's custom list.
 * @param {{ x?: number, y?: number, a?: number, b?: number, op?: '+'|'-' }[]} equations
 * @param {number} index
 */
export function generateQuestion(equations, index = 0) {
  const list = Array.isArray(equations) && equations.length
    ? equations
    : DEFAULT_EQUATIONS;
  const i = ((index % list.length) + list.length) % list.length;
  const eq = toBlankEquation(list[i]) || DEFAULT_EQUATIONS[0];
  const op = eq.op === '-' ? '-' : '+';
  const x = Number(eq.x);
  const y = Number(eq.y);
  const answer = computeAnswer({ x, y, op });
  const wrongs = makeDistractors(answer).slice(0, 3);
  const choices = shuffle([answer, ...wrongs]);
  return {
    x,
    y,
    op,
    answer,
    choices,
    stage: 0,
    index: i,
    total: list.length,
  };
}

export function stageLabel(_stage, total) {
  if (typeof total === 'number' && total > 0) {
    return `${total} custom equation${total === 1 ? '' : 's'}`;
  }
  return 'Your Equations';
}

export function tierUnlockLabel() {
  return 'Level up!';
}
