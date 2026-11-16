import { h, now, audio } from '../engine.js';

export const logic = {
  params(level) {
    const size = level <= 2 ? 3 : level <= 5 ? 4 : level <= 9 ? 5 : 6;
    const lit = Math.min(2 + Math.floor(level * 0.75), Math.floor((size * size) / 2.5));
    return { size, lit, showMs: Math.max(900, 1900 - level * 70), delay: level >= 8 ? 2000 : 0 };
  },
  makeTrial(rng, level) {
    const p = logic.params(level);
    const cells = [...Array(p.size * p.size).keys()];
    return { ...p, targets: rng.sample(cells, p.lit).sort((a, b) => a - b), tint: rng.int(0, 3) };
  },
  /** Compares chosen and target coordinate sets. */
  check(trial, picked) {
    const t = new Set(trial.targets), p = new Set(picked);
    const hit = [...p].filter((x) => t.has(x)).length;
    return { hit, fa: p.size - hit, miss: trial.targets.length - hit, correct: p.size === t.size && hit === t.size };
  },
};

export default {
  id: 'window-watch', num: 3, title: 'Window Watch', min: 1, max: 14, start: 1, mode: 'both',
  how: ['A night-time building lights up a few windows for a moment.', 'When the lights go out, tap the windows that were lit.', 'More windows and bigger buildings come as you improve. Three misses ends the run.'],
  makeTrial: logic.makeTrial,
  async play(trial, ctx) {
    const { size } = trial, n = size * size;
    const status = h('div', { class: 'status' }, 'Watch the windows…');
    const wins = Array.from({ length: n }, (_, i) => h('button', { class: 'win', type: 'button', 'aria-label': `Window ${i + 1}`, disabled: true, style: { '--w': (i * 37) % 5 } }));
    const facade = h('div', { class: 'facade', style: { '--n': size } }, wins);
    const sign = h('div', { class: 'facade-sign' }, '▮ ▮ ▮');
    ctx.stage.replaceChildren(h('div', { class: 'trial' }, status, sign, facade,
      ctx.practice ? h('p', { class: 'hint' }, 'Practice: remember WHERE the lights are, not how many.') : null));
    await ctx.sleep(450);
    trial.targets.forEach((i) => { wins[i].classList.add('lit'); });
    audio.tone(330, 0.25, 'sine', 0.08);
    await ctx.sleep(trial.showMs);
    wins.forEach((w) => w.classList.remove('lit'));
    if (trial.delay) {
      status.textContent = 'Hold it in your mind…';
      await ctx.sleep(trial.delay);
    }
    const picked = new Set();
    const total = trial.targets.length;
    status.textContent = `Tap the ${total} windows that were lit  (0/${total})`;
    wins.forEach((w) => (w.disabled = false));
    const t0 = now();
    await new Promise((resolve) => {
      wins.forEach((w, i) => w.addEventListener('click', () => {
        if (picked.has(i)) { picked.delete(i); w.classList.remove('sel'); }
        else { if (picked.size >= total) return; picked.add(i); w.classList.add('sel'); audio.tap(); }
        status.textContent = `Tap the ${total} windows that were lit  (${picked.size}/${total})`;
        if (picked.size === total) { wins.forEach((x) => (x.disabled = true)); setTimeout(resolve, 250); }
      }));
    });
    const rt = now() - t0, r = logic.check(trial, [...picked]);
    wins.forEach((w, i) => {
      const isT = trial.targets.includes(i);
      if (picked.has(i) && isT) w.classList.add('right'); else if (picked.has(i)) w.classList.add('wrong'); else if (isT) w.classList.add('missed');
    });
    status.textContent = r.correct ? 'Perfect recall!' : `${r.hit} of ${total} found`;
    await ctx.sleep(r.correct ? 650 : 1500);
    return { correct: r.correct, rt, tags: { hit: r.hit, miss: r.miss, falseAlarm: r.fa }, metric: { name: 'locations', value: total },
      explain: r.correct ? '' : `You found ${r.hit} of ${total}${r.fa ? ` and chose ${r.fa} that were dark` : ''}.`, noReplay: false };
  },
  summary: (g, s) => `${s.best.locations ? `You remembered ${s.best.locations} lit windows at once. ` : ''}Windows found: ${s.tags.hit || 0}, missed: ${s.tags.miss || 0}, wrong picks: ${s.tags.falseAlarm || 0}.`,
};
