// Concepts 81–100: processing speed and rapid comparison.
import { std } from '../play.js';
import { median } from '../engine.js';
import { glyph, icon, ICONS, gridSVG, arrow, dots, pie, mc, numOpts, yesNo, toneFor, OBJECTS, HUES, COLORS, SHAPES, PATTERNS, LETTERS, range, gcd } from '../gfx.js';

const SYM = '◆●▲■★✚♠♣♥◐◑◒◓▣▤▥▦'.split('');
const NUMW = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
const LIVING = [['oak', 1], ['heron', 1], ['tulip', 1], ['salmon', 1], ['beetle', 1], ['fern', 1], ['otter', 1], ['moss', 1], ['wolf', 1], ['cactus', 1], ['parrot', 1], ['shrimp', 1], ['lily', 1], ['badger', 1],
  ['anvil', 0], ['kettle', 0], ['marble', 0], ['ladder', 0], ['candle', 0], ['brick', 0], ['spoon', 0], ['helmet', 0], ['violin', 0], ['button', 0], ['wagon', 0], ['scissors', 0], ['lantern', 0], ['saucer', 0]];
const dotLayout = (rng, n) => { const pts = []; let g = 0; while (pts.length < n && g++ < 500) { const p = [rng.int(14, 86), rng.int(14, 86)]; if (pts.every((q) => Math.hypot(p[0] - q[0], p[1] - q[1]) > 16)) pts.push(p); } return pts; };
const twins = (rng, lv, untimed) => {
  const len = Math.min(10, 3 + Math.floor(lv / 2)), a = range(len).map(() => rng.pick(SYM.slice(0, Math.min(SYM.length, 6 + lv)))), same = rng.chance(0.5), b = [...a];
  if (!same) { const i = rng.int(0, len - 1); b[i] = rng.pick(SYM.filter((s) => s !== a[i] && (lv < 6 || '◐◑◒◓▣▤▥▦'.includes(s) === '◐◑◒◓▣▤▥▦'.includes(a[i])))); }
  return { kind: 'choice', promptHtml: `<span class="twins"><b>${a.join('')}</b><b>${b.join('')}</b></span>`, prompt: '', options: [{ label: '= Same', value: true, cls: 'yes' }, { label: '≠ Different', value: false, cls: 'no' }], answer: same, timeMs: untimed ? 0 : Math.max(1500, 4500 - lv * 220), tag: same ? 'same' : 'diff' };
};

export const G = [
  std({ num: 81, title: 'Symbol Twins', max: 14, practiceTrials: 3,
    how: ['Two strings of symbols appear.', 'Decide quickly: identical or different? Arrow keys work: ← same, → different.', 'Longer strings and subtler differences as you improve.'],
    makeTrial: (rng, lv) => twins(rng, lv, false) }),
  std({ num: 82, title: 'Code Key', max: 14, practiceTrials: 3,
    how: ['A key shows which number each symbol stands for. It stays on screen.', 'A symbol appears: tap its number as fast as you can.', 'Bigger keys as you improve.'],
    makeTrial(rng, lv) {
      const k = Math.min(9, 4 + Math.floor(lv / 2)), syms = rng.sample(SHAPES.flatMap((s) => [{ shape: s, color: 'teal' }, { shape: s, color: 'pink' }]), k), q = rng.int(0, k - 1);
      return { kind: 'choice', promptHtml: `<span class="keytable">${syms.map((s, i) => `<span>${glyph(s)}<b>${i + 1}</b></span>`).join('')}</span><span class="row">${glyph(syms[q])}</span>`, prompt: '', options: range(k).map((i) => ({ label: String(i + 1), value: i + 1 })), answer: q + 1, cols: Math.min(5, k), timeMs: Math.max(1500, 4200 - lv * 180) };
    } }),
  std({ num: 83, title: 'Bigger Value', max: 14, practiceTrials: 3,
    how: ['Two numbers appear. Tap the larger one.', 'Later: decimals, negatives, and numbers very close together.', 'Arrow keys work.'],
    makeTrial(rng, lv) {
      const kind = lv <= 3 ? 'int' : lv <= 7 ? 'dec' : 'neg'; let a, b, f = (x) => String(x);
      if (kind === 'int') { a = rng.int(1, 99); do { b = a + rng.int(-Math.max(2, 20 - lv * 4), Math.max(2, 20 - lv * 4)); } while (b === a || b < 0); }
      else if (kind === 'dec') { a = rng.int(10, 999) / 100; do { b = Math.round((a + rng.int(-30, 30) / 100) * 100) / 100; } while (b === a || b < 0); f = (x) => (lv >= 6 ? String(x) : x.toFixed(2)); }
      else { a = rng.int(-50, 50) / (rng.chance(0.5) ? 1 : 10); do { b = Math.round((a + rng.int(-15, 15) / (rng.chance(0.5) ? 1 : 10)) * 10) / 10; } while (b === a); }
      return { kind: 'choice', prompt: 'Which is larger?', options: [{ label: f(a), value: a, cls: 'bignum' }, { label: f(b), value: b, cls: 'bignum' }], answer: Math.max(a, b), timeMs: Math.max(1300, 3800 - lv * 170) };
    } }),
  std({ num: 84, title: 'Rapid Category', max: 14, practiceTrials: 3,
    how: ['A word appears. Is it a LIVING thing or an OBJECT?', 'Answer as quickly as you can without slipping.', 'The clock tightens as you improve.'],
    makeTrial(rng, lv) { const [w, liv] = rng.pick(LIVING); return { kind: 'choice', prompt: w, options: [{ label: '🌿 Living', value: 1, cls: 'yes' }, { label: '⚙ Object', value: 0, cls: 'no' }], answer: liv, timeMs: Math.max(1100, 3200 - lv * 150) }; } }),
  std({ num: 85, title: 'Matching Stream', max: 14, practiceTrials: 3,
    how: ['A reference card stays on screen.', 'Cards arrive: does each one match the reference exactly?', 'More features to compare as you improve.'],
    makeTrial(rng, lv) {
      const useP = lv >= 4, useR = lv >= 8, ref = { shape: rng.pick(SHAPES), color: rng.pick(COLORS)[0], pattern: useP ? rng.pick(PATTERNS.slice(0, 3)) : 'solid', rot: 0 }, same = rng.chance(0.4), c = { ...ref };
      if (!same) { const f = rng.pick(['shape', 'color', ...(useP ? ['pattern'] : []), ...(useR ? ['rot'] : [])]); if (f === 'shape') c.shape = rng.pick(SHAPES.filter((s) => s !== ref.shape)); else if (f === 'color') c.color = rng.pick(COLORS.filter((x) => x[0] !== ref.color))[0]; else if (f === 'pattern') c.pattern = rng.pick(PATTERNS.slice(0, 3).filter((p) => p !== ref.pattern)); else c.rot = 45; }
      if (!same && ref.shape === 'circle' && c.rot) c.shape = 'square';
      return { kind: 'choice', promptHtml: `<span class="pair"><span class="ref">${glyph(ref)}<small>reference</small></span><span>${glyph(c)}</span></span>`, prompt: '', options: [{ label: 'Match', value: true, cls: 'yes' }, { label: 'No match', value: false, cls: 'no' }], answer: same, timeMs: Math.max(1200, 3400 - lv * 150), tag: same ? 'same' : 'diff' };
    } }),
  std({ num: 86, title: 'Letter Locator', max: 14, practiceTrials: 2,
    how: ['Find the named letter in the grid.', 'Tap it as fast as you can.', 'Bigger grids and look-alike letters as you improve.'],
    makeTrial(rng, lv) {
      const n = Math.min(25, 9 + lv * 1.3 | 0), SIM = { E: 'FBP', O: 'QDC', M: 'NW', R: 'PBK', V: 'UWY', G: 'CO', T: 'IY', H: 'NK' }, tgt = rng.pick(Object.keys(SIM));
      const pool = lv >= 5 ? SIM[tgt].split('').concat(LETTERS.filter((c) => c !== tgt).slice(0, 4)) : LETTERS.filter((c) => c !== tgt);
      const cells = range(n - 1).map(() => rng.pick(pool)), j = rng.int(0, n - 1); cells.splice(j, 0, tgt);
      return { kind: 'choice', prompt: `Find: ${tgt}`, options: cells.map((c, i) => ({ label: c, value: i, cls: 'tile letter cellbtn' })), answer: j, cols: Math.ceil(Math.sqrt(n)), timeMs: Math.max(2500, 7000 - lv * 300) };
    } }),
  std({ num: 87, title: 'Quantity Glance', max: 14, practiceTrials: 2,
    how: ['A group of dots flashes for a moment.', 'Tap how many there were. Do not count one by one: glance.', 'Shorter flashes and messier arrangements as you improve.'],
    makeTrial(rng, lv) { const n = rng.int(lv <= 4 ? 1 : 3, Math.min(9, 4 + Math.floor(lv / 2))); return { kind: 'choice', study: { title: 'Glance…', html: dots(dotLayout(rng, n), 7), ms: Math.max(150, 900 - lv * 55), noSkip: true }, prompt: 'How many dots?', options: range(9).map((i) => ({ label: String(i + 1), value: i + 1 })), answer: n, cols: 5 }; } }),
  std({ num: 88, title: 'Same Meaning', max: 14, practiceTrials: 2,
    how: ['A number appears as a word or a numeral.', 'Tap the dot group with the same amount.', 'Bigger amounts and closer choices as you improve.'],
    makeTrial(rng, lv) {
      const mx = Math.min(12, 5 + lv), n = rng.int(2, mx), opts = new Set([n]); while (opts.size < 3) { const d = n + rng.pick([-2, -1, 1, 2]); if (d >= 1 && d <= 14) opts.add(d); }
      const label = lv >= 4 && rng.chance(0.5) ? String(n) : n <= 9 ? NUMW[n] : String(n);
      return { kind: 'choice', prompt: label, options: rng.shuffle([...opts]).map((v) => ({ html: dots(dotLayout(rng, v), 6, '#7ef0ff'), value: v, cls: 'tile', aria: `${v} dots` })), answer: n, cols: 3, timeMs: Math.max(2500, 6000 - lv * 230) };
    } }),
  std({ num: 89, title: 'Pattern Passport', max: 14, practiceTrials: 2,
    how: ['Check each tile against the passport template.', 'Match only if it is identical. A ROTATED copy does NOT count.', 'Bigger tiles and sneakier copies as you improve.'],
    makeTrial(rng, lv) {
      const sz = lv >= 6 ? 4 : 3, tpl = range(sz * sz).map(() => rng.chance(0.45)), same = rng.chance(0.45); let t = [...tpl];
      const rot = (p) => range(sz * sz).map((i) => p[(sz - 1 - (i % sz)) * sz + Math.floor(i / sz)]);
      if (!same) { if (lv >= 8 && rng.chance(0.5) && rot(tpl).join() !== tpl.join()) t = rot(tpl); else { const i = rng.int(0, t.length - 1); t[i] = !t[i]; } }
      const draw = (p) => gridSVG(p.map((b) => ({ fill: b ? '#ffd84a' : 'rgba(255,255,255,.07)' })), sz, { gap: 5, round: 3 });
      return { kind: 'choice', promptHtml: `<span class="pair"><span class="ref">${draw(tpl)}<small>template</small></span><span>${draw(t)}</span></span>`, prompt: '', options: [{ label: 'Identical', value: true, cls: 'yes' }, { label: 'Different', value: false, cls: 'no' }], answer: same, timeMs: Math.max(1600, 4400 - lv * 180), tag: same ? 'same' : 'diff' };
    } }),
  std({ num: 90, title: 'Route Flash', max: 14, practiceTrials: 2,
    how: ['Two routes are drawn on the grid.', 'Tap the route with FEWER steps.', 'The two lengths get closer as you improve.'],
    makeTrial(rng, lv) {
      const n = 7, mk = (len) => { let p, g = 0; do { p = [[rng.int(0, 6), rng.int(0, 6)]]; const seen = new Set([p[0].join()]); while (p.length < len + 1 && g < 400) { g++; const [r, c] = p[p.length - 1], d = rng.pick([[0, 1], [1, 0], [0, -1], [-1, 0]]), nr = r + d[0], nc = c + d[1]; if (nr < 0 || nc < 0 || nr >= n || nc >= n || seen.has(nr + ',' + nc)) continue; seen.add(nr + ',' + nc); p.push([nr, nc]); } } while (p.length < len + 1 && g < 400); return p; };
      const a = rng.int(5, 12), diff = Math.max(1, 5 - Math.floor(lv / 3)), b = a + diff * (rng.chance(0.5) ? 1 : -1), pa = mk(a), pb = mk(b), la = pa.length - 1, lb = pb.length - 1;
      const svg = (p, c) => `<svg viewBox="0 0 70 70" class="gl"><rect width="70" height="70" rx="6" fill="rgba(255,255,255,.04)"/>${range(8).map((i) => `<path d="M${i * 10} 0V70M0 ${i * 10}H70" stroke="rgba(255,255,255,.07)"/>`).join('')}<polyline points="${p.map(([r, q]) => `${q * 10 + 5},${r * 10 + 5}`).join(' ')}" fill="none" stroke="${c}" stroke-width="3.5" stroke-linejoin="round" stroke-linecap="round"/><circle cx="${p[0][1] * 10 + 5}" cy="${p[0][0] * 10 + 5}" r="3.5" fill="#fff"/></svg>`;
      if (la === lb) return { kind: 'choice', prompt: 'Which route is shorter?', options: [{ html: svg(pa, '#7ef0ff'), value: 'A', cls: 'tile' }, { html: svg(mk(la + 3), '#ff7ac6'), value: 'B', cls: 'tile' }], answer: 'A', cols: 2, timeMs: Math.max(2500, 6000 - lv * 250) };
      return { kind: 'choice', prompt: 'Which route is shorter?', options: [{ html: svg(pa, '#7ef0ff'), value: 'A', cls: 'tile', aria: 'Blue route' }, { html: svg(pb, '#ff7ac6'), value: 'B', cls: 'tile', aria: 'Pink route' }], answer: la < lb ? 'A' : 'B', cols: 2, timeMs: Math.max(2500, 6000 - lv * 250) };
    } }),
  std({ num: 91, title: 'Word–Picture Match', max: 14, practiceTrials: 2,
    how: ['A picture appears with a word.', 'Does the word name the picture?', 'Look-alike meanings and a faster clock as you improve.'],
    makeTrial(rng, lv) {
      const NEAR = { sun: 'star', moon: 'night', tree: 'leaf', house: 'home', fish: 'shark', key: 'lock', cup: 'mug', bell: 'ring', leaf: 'tree', umbrella: 'rain', boat: 'ship', cloud: 'fog', flower: 'rose', car: 'truck' };
      const pic = rng.pick(ICONS), match = rng.chance(0.5), w = match ? pic : lv >= 5 && rng.chance(0.6) ? NEAR[pic] : rng.pick(ICONS.filter((x) => x !== pic));
      return { kind: 'choice', promptHtml: icon(pic), prompt: w.toUpperCase(), options: yesNo('Match', 'No'), answer: match, timeMs: Math.max(1200, 3300 - lv * 150), tag: match ? 'yes' : 'no' };
    } }),
  std({ num: 92, title: 'Missing Piece Sprint', max: 14, practiceTrials: 2,
    how: ['A 3×3 board follows a pattern: each ROW keeps one shape and each COLUMN keeps one colour.', 'One square is empty. Tap the piece that completes it.', 'More options and closer decoys as you improve.'],
    makeTrial(rng, lv) {
      const sh = rng.sample(SHAPES, 3), cl = rng.sample(COLORS, 3).map((c) => c[0]), m = rng.int(0, 8), r = Math.floor(m / 3), c = m % 3, ans = { shape: sh[r], color: cl[c] };
      const cells = range(9).map((i) => ({ html: i === m ? '<b>?</b>' : glyph({ shape: sh[Math.floor(i / 3)], color: cl[i % 3] }) }));
      const k = Math.min(6, 3 + Math.floor(lv / 4)), d = [{ shape: sh[(r + 1) % 3], color: cl[c] }, { shape: sh[r], color: cl[(c + 1) % 3] }, { shape: sh[(r + 2) % 3], color: cl[(c + 2) % 3] }, { shape: sh[r], color: cl[(c + 2) % 3] }, { shape: rng.pick(SHAPES.filter((s) => !sh.includes(s))), color: cl[c] }];
      const key = (o) => o.shape + o.color;
      return { kind: 'choice', promptHtml: `<span class="m3">${cells.map((x) => `<span>${x.html}</span>`).join('')}</span>`, prompt: '', options: mc(rng, { html: glyph(ans), value: key(ans), cls: 'tile' }, d.map((o) => ({ html: glyph(o), value: key(o), cls: 'tile' })), k), answer: key(ans), cols: k > 4 ? 3 : k, timeMs: Math.max(3000, 8000 - lv * 330) };
    } }),
  std({ num: 93, title: 'Order Check', max: 14, practiceTrials: 2,
    how: ['A row of numbers appears.', 'Is it correctly sorted from smallest to largest?', 'Longer rows and tiny swaps as you improve.'],
    makeTrial(rng, lv) {
      const n = Math.min(10, 4 + Math.floor(lv / 2)), v = rng.sample(range(99).map((x) => x + 1), n).sort((a, b) => a - b), ok = rng.chance(0.5);
      if (!ok) { const i = lv >= 6 ? rng.int(0, n - 2) : rng.int(0, n - 3), j = lv >= 6 ? i + 1 : i + 2; [v[i], v[j]] = [v[j], v[i]]; }
      return { kind: 'choice', promptHtml: `<span class="countline">${v.map((x) => `<b>${x}</b>`).join('')}</span>`, prompt: '', options: yesNo('Sorted', 'Not sorted'), answer: ok, timeMs: Math.max(1600, 4600 - lv * 200), tag: ok ? 'yes' : 'no' };
    } }),
  std({ num: 96, title: 'Sound Pair Check', max: 12, practiceTrials: 2,
    how: ['Two short tunes play one after the other.', 'Are they exactly the same?', 'Longer tunes and smaller differences as you improve. With sound off, pitch bars are shown.'],
    makeTrial(rng, lv) {
      const len = Math.min(6, 3 + Math.floor(lv / 4)), a = range(len).map(() => rng.int(0, 7)), same = rng.chance(0.5), b = [...a];
      let kind = 'same';
      if (!same) { kind = rng.pick(lv >= 6 ? ['pitch', 'order'] : ['pitch']); const i = rng.int(0, len - 1); if (kind === 'pitch') b[i] = (a[i] + (lv >= 8 ? 1 : rng.int(2, 4))) % 10; else { const j = (i + 1) % len; if (a[i] === a[j]) b[i] = (a[i] + 2) % 10; else [b[i], b[j]] = [b[j], b[i]]; } }
      const tones = [...a.map(toneFor), 0, 0, ...b.map(toneFor)];
      return { kind: 'choice', prompt: 'Were the two tunes the same?', tones, toneGap: 0.24, options: yesNo('Same', 'Different'), answer: same, tag: same ? 'same' : 'diff' };
    } }),
  std({ num: 97, title: 'Orientation Check', max: 14, practiceTrials: 2,
    how: ['Two arrows appear.', 'Do they point in exactly the same direction?', 'Finer angle differences as you improve.'],
    makeTrial(rng, lv) {
      const step = lv <= 4 ? 90 : lv <= 8 ? 45 : 15, a = rng.int(0, 360 / step - 1) * step, same = rng.chance(0.5), b = same ? a : (a + step * (rng.chance(0.5) ? 1 : -1) * (lv >= 9 ? 1 : rng.int(1, 2)) + 360) % 360;
      return { kind: 'choice', promptHtml: `<span class="pair">${arrow(a)}${arrow(b, '#ffd84a')}</span>`, prompt: '', options: yesNo('Same', 'Different'), answer: same, timeMs: Math.max(1200, 3400 - lv * 150), tag: same ? 'same' : 'diff' };
    } }),
  std({ num: 98, title: 'Fraction Flash', max: 14, practiceTrials: 2,
    how: ['A shape is partly shaded.', 'Tap the fraction that is shaded.', 'More slices, and later the answer may be written in its simplest form.'],
    makeTrial(rng, lv) {
      const d = rng.int(2, Math.min(12, 3 + lv)), n = rng.int(1, d - 1), g = gcd(n, d), simple = lv >= 7, shown = simple ? `${n / g}/${d / g}` : `${n}/${d}`;
      const opts = new Set([shown]), red = (a, b) => { const k = gcd(a, b); return simple ? `${a / k}/${b / k}` : `${a}/${b}`; };
      for (const [a, b] of [[n + 1, d], [n - 1, d], [d - n, d], [n, d + 1], [n, d - 1]]) if (a >= 1 && a < b && Math.abs(a / b - n / d) > 1e-9) opts.add(red(a, b));
      const vis = rng.chance(0.5) ? pie(n, d) : `<svg viewBox="0 0 100 100" class="gl">${range(d).map((i) => `<rect x="${5 + (90 / d) * i}" y="30" width="${90 / d}" height="40" fill="${i < n ? '#2fd38a' : 'rgba(255,255,255,.08)'}" stroke="rgba(255,255,255,.6)"/>`).join('')}</svg>`;
      return { kind: 'choice', promptHtml: vis, prompt: '', options: rng.shuffle([...opts].slice(0, 4)).map((x) => ({ label: x, value: x })), answer: shown, timeMs: Math.max(2200, 5500 - lv * 230) };
    } }),
  std({ num: 99, title: 'Duplicate Detector', max: 14, practiceTrials: 2,
    how: ['A list of items appears. Exactly one item is listed twice.', 'Tap the item that repeats.', 'Longer lists and look-alike items as you improve.'],
    makeTrial(rng, lv) {
      const n = Math.min(14, 5 + lv), pool = lv >= 6 ? [...OBJECTS, 'lanterns', 'clocks', 'compasses', 'bells'] : OBJECTS, items = rng.sample(pool, n), dup = rng.pick(items), list = rng.shuffle([...items, dup]);
      return { kind: 'choice', promptHtml: `<span class="pack">${list.map((x) => `<span class="tok" style="--th:210">${x}</span>`).join('')}</span>`, prompt: 'Which item appears twice?', options: mc(rng, { label: dup, value: dup }, items.map((x) => ({ label: x, value: x })), 4), answer: dup, timeMs: Math.max(3500, 9000 - lv * 380), cols: 2 };
    } }),
  std({ num: 100, title: 'Accuracy Pacekeeper', max: 14, practiceTrials: 2,
    how: ['Compare symbol strings at your OWN pace: there is no timer.', 'Your results show both accuracy and speed, side by side.', 'Difficulty grows by complexity, not by forcing you faster.'],
    makeTrial: (rng, lv) => twins(rng, lv, true),
    summary: (g, s) => `Reached level ${s.maxLevel}. Accuracy ${s.trials ? Math.round((100 * s.correct) / s.trials) : 0}% at a median of ${s.rts.length ? (median(s.rts) / 1000).toFixed(2) : '—'} s per correct answer. Try to keep accuracy the same while trimming time.` }),
];
