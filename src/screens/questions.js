import {
  getCustomEquations,
  setCustomEquations,
  resetCustomEquations,
} from '../game/state.js';
import { formatEquation, parseEquation, computeAnswer } from '../game/math.js';
import { playClick } from '../game/audio.js';

/**
 * Overlay to add / remove custom math equations (___ ± x = y).
 * @param {HTMLElement} root
 * @param {{ onChange?: () => void }} hooks
 */
export function createQuestionsEditor(root, hooks = {}) {
  const overlay = root.querySelector('#questions-overlay');
  const listEl = root.querySelector('#questions-list');
  const form = root.querySelector('#questions-form');
  const xInput = root.querySelector('#q-x');
  const yInput = root.querySelector('#q-y');
  const opSelect = root.querySelector('#q-op');
  const msgEl = root.querySelector('#questions-msg');
  const countEl = root.querySelector('#questions-count');

  function setMsg(text, isError = false) {
    if (!msgEl) return;
    msgEl.textContent = text || '';
    msgEl.className = `questions-msg${isError ? ' error' : ''}`;
  }

  function render() {
    const eqs = getCustomEquations();
    if (countEl) countEl.textContent = String(eqs.length);
    if (!listEl) return;
    listEl.innerHTML = '';

    if (!eqs.length) {
      listEl.innerHTML = '<p class="questions-empty">No equations yet — add some below!</p>';
      return;
    }

    eqs.forEach((eq, index) => {
      const row = document.createElement('div');
      row.className = 'question-row mc-border';
      const blank = computeAnswer(eq);
      row.innerHTML = `
        <span class="question-row-text">${formatEquation(eq)} <em>(blank = ${blank})</em></span>
        <button type="button" class="mc-btn danger question-remove" data-index="${index}" aria-label="Remove equation">Remove</button>
      `;
      listEl.appendChild(row);
    });

    listEl.querySelectorAll('.question-remove').forEach((btn) => {
      btn.addEventListener('click', () => {
        playClick();
        const i = Number(btn.getAttribute('data-index'));
        const next = getCustomEquations().filter((_, idx) => idx !== i);
        if (!next.length) {
          setMsg('Keep at least one equation.', true);
          return;
        }
        setCustomEquations(next);
        setMsg('Removed!');
        render();
        hooks.onChange?.();
      });
    });
  }

  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    playClick();
    const parsed = parseEquation(xInput.value, yInput.value, opSelect.value);
    if (!parsed.ok) {
      setMsg(parsed.reason, true);
      return;
    }
    const eqs = getCustomEquations();
    const dup = eqs.some(
      (eq) => eq.x === parsed.equation.x && eq.y === parsed.equation.y && (eq.op || '+') === parsed.equation.op,
    );
    if (dup) {
      setMsg('That equation is already in the list.', true);
      return;
    }
    setCustomEquations([...eqs, parsed.equation]);
    xInput.value = '';
    yInput.value = '';
    setMsg(`Added ${formatEquation(parsed.equation)}!`);
    render();
    hooks.onChange?.();
    xInput.focus();
  });

  root.querySelector('#questions-close')?.addEventListener('click', () => close());
  root.querySelector('#questions-close-2')?.addEventListener('click', () => close());
  root.querySelector('#questions-reset')?.addEventListener('click', () => {
    playClick();
    resetCustomEquations();
    setMsg('Restored the starter list.');
    render();
    hooks.onChange?.();
  });

  overlay?.addEventListener('click', (e) => {
    if (e.target === overlay) close();
  });

  function open() {
    setMsg('');
    render();
    overlay?.classList.add('open');
    overlay?.setAttribute('aria-hidden', 'false');
    xInput?.focus();
  }

  function close() {
    overlay?.classList.remove('open');
    overlay?.setAttribute('aria-hidden', 'true');
  }

  return { open, close, render };
}
