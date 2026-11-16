import { h } from '../engine.js';
import { choiceTrial } from '../kit.js';

export const logic = {
  params(level) {
    const n = Math.min(36, 6 + level * 2), cols = Math.ceil(Math.sqrt(n));
    const feature = level <= 4 ? 'hue' : level <= 8 ? 'rot' : 'size';
    return { n, cols, feature, timeMs: Math.max(3200, 9000 - level * 320),
      hueD: Math.max(9, 70 - level * 5), rotD: Math.max(10, 100 - level * 6), sizeD: Math.max(0.07, 0.4 - level * 0.02) };
  },
  /** One shared base object; exactly one item has exactly one feature changed. */
  makeTrial(rng, level) {
    const p = logic.params(level), base = { hue: rng.int(0, 359), rot: 0, size: 1 };
    const odd = rng.int(0, p.n - 1), sign = rng.chance(0.5) ? 1 : -1, items = Array.from({ length: p.n }, () => ({ ...base }));
    if (p.feature === 'hue') items[odd].hue = (base.hue + sign * p.hueD + 360) % 360;
    else if (p.feature === 'rot') items[odd].rot = sign * p.rotD;
    else items[odd].size = 1 + sign * p.sizeD;
    return { ...p, odd, items };
  },
  check: (trial, idx) => idx === trial.odd,
  distinct(trial) { return trial.items.filter((it, i) => i !== trial.odd && JSON.stringify(it) === JSON.stringify(trial.items[trial.odd])).length === 0; },
};
function glyph(it, hl) {
  return h('svg', { viewBox: '0 0 100 100', width: '100%', height: '100%', 'aria-hidden': 'true',
    html: `<g transform="translate(50 50) rotate(${it.rot}) scale(${it.size}) translate(-50 -50)"><path d="M50 10 86 34 76 88H24L14 34z" fill="hsl(${it.hue} 78% 58%)" stroke="rgba(255,255,255,.55)" stroke-width="3"/><circle cx="36" cy="38" r="7" fill="rgba(255,255,255,.85)"/><path d="M50 52v22" stroke="rgba(0,0,0,.35)" stroke-width="5" stroke-linecap="round"/></g>` });
}

export default {
  id: 'one-different', num: 94, title: 'One Different', min: 1, max: 14, start: 1, mode: 'both', practiceTrials: 2,
  how: ['A field of near-identical objects appears.', 'Tap the one that is different. At first it is colour, later tilt, later size.', 'Differences shrink and the clock tightens as you improve.'],
  makeTrial: logic.makeTrial,
  async play(trial, ctx) {
    const r = await choiceTrial(ctx, { prompt: trial.feature === 'hue' ? 'Find the odd colour' : trial.feature === 'rot' ? 'Find the tilted one' : 'Find the odd size',
      options: trial.items.map((it, i) => ({ node: glyph(it), value: i, cls: 'tile', aria: `Object ${i + 1}` })), answer: trial.odd, timeMs: trial.timeMs, cols: trial.cols,
      hint: 'Practice: tap the single object that does not match the others.' });
    return { ...r, tags: { [trial.feature]: r.correct ? 1 : 0, ...(r.timedOut ? { omission: 1 } : {}) }, metric: { name: 'items', value: trial.n },
      explain: r.correct ? '' : r.timedOut ? 'Time ran out. The odd one is outlined in green.' : 'The odd one is outlined in green.' };
  },
  summary: (g, s) => `${s.best.items ? `Found the odd one among ${s.best.items} objects. ` : ''}By feature, found: colour ${s.tags.hue || 0}, tilt ${s.tags.rot || 0}, size ${s.tags.size || 0}. Timeouts: ${s.tags.omission || 0}.`,
};
