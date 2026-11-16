import { h } from '../engine.js';
import { choiceTrial } from '../kit.js';

export const logic = {
  params(level) {
    return { ops: level <= 3 ? ['+'] : level <= 6 ? ['+', '-'] : ['+', '-', '×'], max: 12 + level * 7, timeMs: Math.max(1800, 5200 - level * 220), subtle: level >= 5 };
  },
  compute(a, op, b) { return op === '+' ? a + b : op === '-' ? a - b : a * b; },
  makeTrial(rng, level) {
    const p = logic.params(level), op = rng.pick(p.ops);
    let a, b;
    if (op === '×') { a = rng.int(2, Math.min(12, 3 + Math.floor(level / 2))); b = rng.int(2, Math.min(12, 4 + Math.floor(level / 2))); }
    else { a = rng.int(2, p.max); b = rng.int(2, p.max); if (op === '-' && b > a) [a, b] = [b, a]; }
    const real = logic.compute(a, op, b), isTrue = rng.chance(0.5);
    let shown = real;
    if (!isTrue) {
      const kinds = p.subtle ? ['off1', 'off1', 'ten', 'swap', 'digit'] : ['big', 'big', 'off1'];
      for (let guard = 0; guard < 12 && shown === real; guard++) {
        const k = rng.pick(kinds), sg = rng.chance(0.5) ? 1 : -1;
        if (k === 'off1') shown = real + sg * rng.int(1, 2);
        else if (k === 'ten') shown = real + sg * 10;
        else if (k === 'digit') shown = real + sg * rng.int(3, 9);
        else if (k === 'swap' && real >= 10) { const s = String(real).split(''); [s[s.length - 1], s[s.length - 2]] = [s[s.length - 2], s[s.length - 1]]; shown = +s.join(''); }
        else shown = real + sg * rng.int(5, Math.max(6, Math.floor(real / 3)));
      }
      if (shown === real) shown = real + 1;
      if (shown < 0) shown = real + 2;
    }
    return { ...p, a, op, b, shown, real, isTrue };
  },
  check: (trial, ans) => ans === trial.isTrue,
};

export default {
  id: 'rapid-equation-check', num: 95, title: 'Rapid Equation Check', min: 1, max: 15, start: 1, mode: 'both', practiceTrials: 3,
  how: ['A sum appears with a proposed answer.', 'Tap TRUE if it is right, FALSE if it is wrong. Use the left and right arrow keys on a keyboard.', 'Numbers grow, the wrong answers get sneakier, and the clock tightens.'],
  makeTrial: logic.makeTrial,
  async play(trial, ctx) {
    const node = h('div', { class: 'prompt equation' }, `${trial.a} ${trial.op} ${trial.b} = `, h('b', {}, trial.shown));
    const r = await choiceTrial(ctx, { promptNode: node, options: [{ label: '✓  True', value: true, cls: 'yes' }, { label: '✗  False', value: false, cls: 'no' }], answer: trial.isTrue, timeMs: trial.timeMs,
      hint: 'Practice: work it out, then tap True or False.' });
    return { ...r, tags: { ...(r.timedOut ? { omission: 1 } : {}), ...(r.correct ? { right: 1 } : { wrong: 1 }) },
      explain: r.correct ? '' : r.timedOut ? `Time ran out. ${trial.a} ${trial.op} ${trial.b} = ${trial.real}.` : `${trial.a} ${trial.op} ${trial.b} is ${trial.real}, not ${trial.shown}.` };
  },
  summary: (g, s) => `${s.tags.right || 0} equations checked correctly, ${s.tags.wrong || 0} wrong, ${s.tags.omission || 0} timed out.`,
};
