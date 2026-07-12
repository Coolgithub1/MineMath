/** Default practice set — used until the player edits their own list. */
export const DEFAULT_EQUATIONS = [
  { a: 15, b: 23, op: '+' },
  { a: 10, b: 36, op: '+' },
  { a: 24, b: 11, op: '+' },
  { a: 71, b: 18, op: '+' },
  { a: 30, b: 59, op: '+' },
  { a: 42, b: 36, op: '+' },
  { a: 14, b: 21, op: '+' },
  { a: 28, b: 60, op: '+' },
  { a: 22, b: 71, op: '+' },
  { a: 31, b: 16, op: '+' },
  { a: 79, b: 10, op: '+' },
  { a: 72, b: 3, op: '+' },
  { a: 1, b: 13, op: '+' },
  { a: 60, b: 12, op: '+' },
  { a: 66, b: 48, op: '+' },
  { a: 11, b: 67, op: '+' },
  { a: 9, b: 80, op: '+' },
  { a: 15, b: 73, op: '+' },
  { a: 60, b: 14, op: '+' },
];

/** @deprecated use DEFAULT_EQUATIONS */
export const STARTER_EQUATIONS = DEFAULT_EQUATIONS.map((e) => [e.a, e.b]);

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
 * @param {{ a: number, b: number, op?: '+'|'-' }} eq
 */
export function computeAnswer(eq) {
  const a = Number(eq.a);
  const b = Number(eq.b);
  return eq.op === '-' ? a - b : a + b;
}

/**
 * @param {{ a: number, b: number, op?: '+'|'-' }} eq
 */
export function formatEquation(eq) {
  const op = eq.op === '-' ? '−' : '+';
  return `${eq.a} ${op} ${eq.b}`;
}

/**
 * Normalize / validate a user-entered equation.
 * @returns {{ ok: true, equation: { a: number, b: number, op: '+'|'-' } } | { ok: false, reason: string }}
 */
export function parseEquation(aRaw, bRaw, opRaw = '+') {
  const a = Number(aRaw);
  const b = Number(bRaw);
  const op = opRaw === '-' ? '-' : '+';
  if (!Number.isFinite(a) || !Number.isFinite(b)) {
    return { ok: false, reason: 'Enter two numbers.' };
  }
  if (!Number.isInteger(a) || !Number.isInteger(b)) {
    return { ok: false, reason: 'Use whole numbers only.' };
  }
  if (a < 0 || b < 0 || a > 9999 || b > 9999) {
    return { ok: false, reason: 'Use numbers from 0 to 9999.' };
  }
  if (op === '-' && a < b) {
    return { ok: false, reason: 'For subtract, the first number should be bigger (or equal).' };
  }
  return { ok: true, equation: { a, b, op } };
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
 * @param {{ a: number, b: number, op?: '+'|'-' }[]} equations
 * @param {number} index
 * @returns {{ a: number, b: number, op: '+'|'-', answer: number, choices: number[], stage: number, index: number, total: number }}
 */
export function generateQuestion(equations, index = 0) {
  const list = Array.isArray(equations) && equations.length
    ? equations
    : DEFAULT_EQUATIONS;
  const i = ((index % list.length) + list.length) % list.length;
  const eq = list[i];
  const op = eq.op === '-' ? '-' : '+';
  const a = Number(eq.a);
  const b = Number(eq.b);
  const answer = computeAnswer({ a, b, op });
  const wrongs = makeDistractors(answer).slice(0, 3);
  const choices = shuffle([answer, ...wrongs]);
  return {
    a,
    b,
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
