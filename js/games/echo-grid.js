import { h, now, audio } from '../engine.js';

export const logic = {
  params(level) { return { size: level <= 6 ? 3 : 4, len: 2 + level, gap: Math.max(260, 640 - level * 24), revisits: level >= 6 }; },
  neighbours(i, size) {
    const r = Math.floor(i / size), c = i % size, out = [];
    for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
      if (!dr && !dc) continue; const rr = r + dr, cc = c + dc;
      if (rr >= 0 && rr < size && cc >= 0 && cc < size) out.push(rr * size + cc);
    }
    return out;
  },
  /** A connected route: each step moves to an adjacent pad. */
  makeTrial(rng, level) {
    const p = logic.params(level); const route = [rng.int(0, p.size * p.size - 1)];
    while (route.length < p.len) {
      const cur = route[route.length - 1];
      let opts = logic.neighbours(cur, p.size);
      if (!p.revisits) { const fresh = opts.filter((o) => !route.includes(o)); if (fresh.length) opts = fresh; }
      route.push(rng.pick(opts));
    }
    return { ...p, route };
  },
  /** Returns how many leading taps are right and whether the whole route matched. */
  check(route, taps) {
    let ok = 0; while (ok < taps.length && taps[ok] === route[ok]) ok++;
    return { steps: ok, correct: ok === route.length && taps.length === route.length, firstWrong: ok < taps.length ? ok : -1 };
  },
};
const KEYS = '123456789'.split(''), KEYS4 = '1234qwerasdfzxcv'.split('');

export default {
  id: 'echo-grid', num: 12, title: 'Echo Grid', min: 1, max: 14, start: 1, mode: 'both',
  how: ['Pads light up one after another, each with its own note, tracing a route.', 'Tap the same route back in the same order.', 'Routes get longer and faster. One slip costs a strike.'],
  makeTrial: logic.makeTrial,
  async play(trial, ctx) {
    const { size, route } = trial, n = size * size;
    const status = h('div', { class: 'status' }, 'Watch the route…');
    const pads = Array.from({ length: n }, (_, i) =>
      h('button', { class: 'pad', type: 'button', disabled: true, 'aria-label': `Pad ${i + 1}`, style: { '--ph': (i * 360) / n } }, h('kbd', {}, (size === 3 ? KEYS : KEYS4)[i].toUpperCase())));
    const grid = h('div', { class: 'padgrid', style: { '--n': size } }, pads);
    const dots = h('div', { class: 'progress-dots' }, route.map(() => h('i')));
    ctx.stage.replaceChildren(h('div', { class: 'trial' }, status, grid, dots, ctx.practice ? h('p', { class: 'hint' }, 'Practice: repeat the route in the same order.') : null));
    await ctx.sleep(600);
    for (const i of route) {
      pads[i].classList.add('flash'); audio.note(i);
      await ctx.sleep(trial.gap); pads[i].classList.remove('flash'); await ctx.sleep(110);
    }
    status.textContent = `Your turn  (0/${route.length})`;
    pads.forEach((p) => (p.disabled = false));
    const taps = [], t0 = now();
    const keymap = size === 3 ? KEYS : KEYS4;
    await new Promise((resolve) => {
      const press = (i) => {
        if (taps.length >= route.length) return;
        taps.push(i); pads[i].classList.add('flash'); audio.note(i); setTimeout(() => pads[i].classList.remove('flash'), 180);
        const r = logic.check(route, taps);
        dots.children[taps.length - 1]?.classList.add(r.firstWrong === taps.length - 1 ? 'bad' : 'good');
        status.textContent = `Your turn  (${Math.min(taps.length, route.length)}/${route.length})`;
        if (r.firstWrong >= 0 || taps.length === route.length) { document.removeEventListener('keydown', onKey); pads.forEach((p) => (p.disabled = true)); setTimeout(resolve, 350); }
      };
      const onKey = (e) => { const i = keymap.indexOf(e.key.toLowerCase()); if (i >= 0 && !e.repeat && !pads[i].disabled) press(i); };
      document.addEventListener('keydown', onKey);
      pads.forEach((p, i) => p.addEventListener('click', () => press(i)));
    });
    const rt = now() - t0, r = logic.check(route, taps);
    status.textContent = r.correct ? 'Echoed perfectly!' : `Step ${r.firstWrong + 1} was a different pad`;
    if (!r.correct) { pads[route[r.firstWrong]].classList.add('missed'); }
    await ctx.sleep(r.correct ? 500 : 1400);
    return { correct: r.correct, rt, tags: { steps: r.steps }, metric: { name: 'steps', value: route.length },
      explain: r.correct ? '' : `You got ${r.steps} of ${route.length} steps in a row.` };
  },
  summary: (g, s) => `${s.best.steps ? `Longest route repeated perfectly: ${s.best.steps} pads. ` : ''}${s.tags.steps || 0} steps echoed correctly in total.`,
};
