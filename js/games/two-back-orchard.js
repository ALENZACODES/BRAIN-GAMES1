import { h, now, audio } from '../engine.js';
import { fruit, FRUITS } from '../kit.js';

export const logic = {
  params(level) {
    const n = level <= 2 ? 1 : level <= 5 ? 2 : level <= 8 ? 3 : 4;
    return { n, interval: Math.max(1500, 2700 - level * 100), pool: Math.min(FRUITS.length, 4 + Math.ceil(level / 2)), length: 10 + n, allowed: 2 };
  },
  makeTrial(rng, level) {
    const p = logic.params(level), pool = FRUITS.slice(0, p.pool), seq = [];
    for (let t = 0; t < p.length; t++) seq.push(t >= p.n && rng.chance(0.3) ? seq[t - p.n] : rng.pick(pool));
    return { ...p, seq, labels: logic.labels(seq, p.n) };
  },
  /** Rule-based labels: history[t] === history[t - n] (also catches accidental matches). */
  labels(seq, n) { return seq.map((f, t) => t >= n && f === seq[t - n]); },
  score(labels, n, pressed) {
    let hit = 0, miss = 0, fa = 0, cr = 0;
    labels.forEach((isT, t) => { if (t < n) return; const p = !!pressed[t]; if (isT && p) hit++; else if (isT) miss++; else if (p) fa++; else cr++; });
    return { hit, miss, fa, cr };
  },
};

export default {
  id: 'two-back-orchard', num: 13, title: 'Two-Back Orchard', min: 1, max: 12, start: 1, mode: 'both', maxTrials: 8, practiceTrials: 1,
  how: ['Fruit appears one at a time on the orchard tray.', 'Press MATCH (or Space) when the fruit is the same as the one shown N turns earlier. N is shown on screen: 1-back, 2-back, 3-back…', 'Do not press otherwise. Each block allows at most two mistakes.'],
  makeTrial: logic.makeTrial,
  async play(trial, ctx) {
    const { n, seq, interval } = trial;
    const slot = h('div', { class: 'fruit-slot' });
    const ring = h('div', { class: 'beat' });
    const btn = h('button', { class: 'btn big match', type: 'button' }, 'MATCH', h('kbd', {}, 'Space'));
    const status = h('div', { class: 'status' }, `${n}-back: same fruit as ${n} turn${n > 1 ? 's' : ''} ago?`);
    const strip = h('div', { class: 'progress-dots' }, seq.map(() => h('i')));
    ctx.stage.replaceChildren(h('div', { class: 'trial' }, status, h('div', { class: 'tray' }, ring, slot), strip, btn,
      ctx.practice ? h('p', { class: 'hint' }, `Practice: with ${n}-back, MATCH means "this fruit is identical to the one ${n} step${n > 1 ? 's' : ''} before". Short blocks here.`) : null));
    const pressed = [];
    let cur = -1;
    const press = () => { if (cur < n || pressed[cur]) { if (cur >= 0 && cur < n) btn.classList.add('shake'), setTimeout(() => btn.classList.remove('shake'), 250); return; } pressed[cur] = true; audio.tap(); btn.classList.add('pressed'); };
    const onKey = (e) => { if (e.code === 'Space' && !e.repeat) { e.preventDefault(); press(); } };
    btn.addEventListener('click', press); document.addEventListener('keydown', onKey);
    await ctx.sleep(700);
    for (let t = 0; t < seq.length; t++) {
      cur = t; if (globalThis.__QA) __QA.nt = t; btn.classList.remove('pressed');
      slot.replaceChildren(fruit(seq[t], 120));
      ring.style.animation = 'none'; void ring.offsetWidth; ring.style.animation = `beat ${interval}ms linear`;
      await ctx.sleep(interval);
      slot.replaceChildren();
      const isT = trial.labels[t], p = !!pressed[t];
      if (t >= n) strip.children[t].classList.add(isT === p ? 'good' : 'bad');
      await ctx.sleep(180);
    }
    document.removeEventListener('keydown', onKey);
    const r = logic.score(trial.labels, n, pressed), errors = r.miss + r.fa, correct = errors <= trial.allowed;
    status.textContent = `Matches caught ${r.hit} of ${r.hit + r.miss} · false alarms ${r.fa}`;
    await ctx.sleep(1300);
    return { correct, rt: null, tags: { hit: r.hit, miss: r.miss, falseAlarm: r.fa, correctRejection: r.cr }, metric: { name: 'n', value: n },
      explain: correct ? '' : `That block had ${errors} mistakes (limit ${trial.allowed}): ${r.miss} missed match${r.miss === 1 ? '' : 'es'}, ${r.fa} false alarm${r.fa === 1 ? '' : 's'}.` };
  },
  summary: (g, s) => `${s.best.n ? `Best passed: ${s.best.n}-back. ` : ''}Matches caught ${s.tags.hit || 0}, missed ${s.tags.miss || 0}, false alarms ${s.tags.falseAlarm || 0}.`,
};
