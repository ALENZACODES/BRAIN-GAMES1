// Concepts 61–80: inhibition and cognitive flexibility.
import { std, runTrial } from '../play.js';
import { h, now, audio } from '../engine.js';
import { choiceTrial } from '../kit.js';
import { glyph, tok, card, arrow, mc, numOpts, yesNo, NAMES, OBJECTS, HUES, COLORS, SHAPES, range } from '../gfx.js';

const fruitHtml = (c, marked) => `<svg viewBox="0 0 100 100" class="gl"><circle cx="50" cy="56" r="34" fill="${c}"/><path d="M50 22c0-8 4-12 10-14" stroke="#5a3" stroke-width="5" fill="none"/><ellipse cx="62" cy="16" rx="9" ry="4.5" fill="#4caf50" transform="rotate(-25 62 16)"/><circle cx="38" cy="44" r="7" fill="#fff" opacity=".45"/>${marked ? '<circle cx="74" cy="78" r="17" fill="#111"/><path d="M66 70l16 16M82 70 66 86" stroke="#ff5a5f" stroke-width="6" stroke-linecap="round"/>' : ''}</svg>`;
const sunHtml = '<svg viewBox="0 0 100 100" class="gl"><circle cx="50" cy="50" r="22" fill="#ffd84a"/><g stroke="#ffd84a" stroke-width="7" stroke-linecap="round"><path d="M50 8v14M50 78v14M8 50h14M78 50h14M20 20l10 10M70 70l10 10M80 20 70 30M30 70 20 80"/></g></svg>';
const moonHtml = '<svg viewBox="0 0 100 100" class="gl"><path d="M64 12a38 38 0 1 0 24 58A32 32 0 0 1 64 12z" fill="#dcd6ff"/></svg>';
const LIVING = [['oak tree', 1, 1], ['ant', 1, 0], ['elephant', 1, 1], ['mushroom', 1, 0], ['horse', 1, 1], ['goldfish', 1, 0], ['whale', 1, 1], ['daisy', 1, 0], ['giraffe', 1, 1], ['frog', 1, 0], ['camel', 1, 1], ['bee', 1, 0], ['bear', 1, 1], ['mouse', 1, 0], ['pine tree', 1, 1], ['snail', 1, 0],
  ['bus', 0, 1], ['pencil', 0, 0], ['piano', 0, 1], ['spoon', 0, 0], ['wardrobe', 0, 1], ['coin', 0, 0], ['boat', 0, 1], ['key', 0, 0], ['fridge', 0, 1], ['button', 0, 0], ['truck', 0, 1], ['marble', 0, 0], ['sofa', 0, 1], ['ring', 0, 0]];

export const G = [
  std({ num: 61, title: 'Go–Hold Garden', max: 12, maxTrials: 10, practiceTrials: 1,
    how: ['Fruit drops into the basket one at a time.', 'Press PICK for every ordinary fruit, but HOLD (don’t press) when a fruit has a black ✕ mark.', 'More marked fruit and faster drops as you improve.'],
    makeTrial(rng, lv) {
      const len = Math.min(24, 12 + lv), pHold = Math.min(0.4, 0.18 + lv * 0.02), cols = ['#ff5a5f', '#ffa726', '#ffd84a', '#9ccc65', '#ab47bc'];
      const hold = range(len).map((i) => i > 0 && rng.chance(pHold)); if (!hold.some(Boolean)) hold[rng.int(2, len - 1)] = true;
      return { kind: 'stream', items: hold.map((x) => ({ html: fruitHtml(rng.pick(cols), x) })), targets: hold.map((x) => !x), intervalMs: Math.max(650, 1200 - lv * 45), showMs: Math.max(500, 900 - lv * 30), allowed: 2, prompt: 'PICK ordinary fruit · HOLD on ✕', button: 'PICK' };
    } }),
  std({ num: 62, title: 'Stop the Delivery', max: 14, practiceTrials: 3,
    how: ['An arrow shows which way the delivery goes: tap that side quickly.', 'Sometimes a red STOP sign appears just after the arrow. Then do NOT tap anything.', 'The stop sign comes later as you improve, so you must stay ready to cancel.'],
    makeTrial(rng, lv) { const stop = rng.chance(0.3), dir = rng.chance(0.5) ? 'L' : 'R'; return { kind: 'choice', stop, dir, ssd: Math.min(450, 120 + lv * 25), win: Math.max(900, 1500 - lv * 30), prompt: '', options: [{ label: '◀', value: 'L' }, { label: '▶', value: 'R' }], answer: dir }; },
    async play(t, ctx) {
      const sign = h('div', { class: 'stopsign', hidden: true }, 'STOP'), ar = h('span', { class: 'rich big', html: arrow(t.dir === 'L' ? 180 : 0) });
      let stopShown = false; const st = t.stop ? setTimeout(() => { stopShown = true; sign.hidden = false; audio.tone(880, 0.12, 'square', 0.1); }, t.ssd) : 0;
      let resolveTO; const timeout = new Promise((r) => (resolveTO = setTimeout(() => r({ timedOut: true }), t.win)));
      const pick = choiceTrial(ctx, { promptNode: h('div', { class: 'qbox stopbox' }, ar, sign), options: t.options, answer: t.dir, flashMs: 250, quiet: t.stop });
      const r = await Promise.race([pick, timeout]); clearTimeout(st); clearTimeout(resolveTO);
      if (r.timedOut) { ctx.stage.querySelectorAll('.opt').forEach((b) => (b.disabled = true)); await ctx.sleep(300); }
      const responded = !r.timedOut;
      const correct = t.stop ? !responded : responded && r.correct;
      return { correct, rt: r.rt, speed: !t.stop && correct ? Math.max(0, 1 - r.rt / t.win) : 0, tags: t.stop ? { stopTotal: 1, stopRight: correct ? 1 : 0 } : { goTotal: 1, goRight: correct ? 1 : 0 },
        explain: correct ? '' : t.stop ? 'The STOP sign appeared, so the right move was to hold back.' : responded ? 'Wrong side.' : 'Too slow: there was no stop sign on that one.' };
    } }),
  std({ num: 64, title: 'Rule Switch Station', max: 12, practiceTrials: 1,
    how: ['Sort each object by the rule shown on the cue: SHAPE or SIZE.', 'SHAPE: circle ◀ / square ▶.  SIZE: small ◀ / big ▶.', 'The cue switches more often as you improve. Each block allows one mistake.'],
    makeTrial(rng, lv) {
      const n = Math.min(12, 6 + Math.floor(lv / 2)), pSw = Math.min(0.6, 0.2 + lv * 0.04); let rule = rng.pick(['SHAPE', 'SIZE']);
      const steps = range(n).map((i) => {
        const prev = rule; if (i > 0 && rng.chance(pSw)) rule = rule === 'SHAPE' ? 'SIZE' : 'SHAPE';
        const shape = rng.pick(['circle', 'square']), big = rng.chance(0.5);
        return { kind: 'choice', promptHtml: `<span class="cue ${rule.toLowerCase()}">${rule}</span>${glyph({ shape, color: 'teal', scale: big ? 1 : 0.5 })}`, prompt: '', options: [{ label: '◀ circle / small', value: 'L' }, { label: 'square / big ▶', value: 'R' }],
          answer: rule === 'SHAPE' ? (shape === 'circle' ? 'L' : 'R') : big ? 'R' : 'L', timeMs: Math.max(1800, 4000 - lv * 160), flashMs: 220, tag: i > 0 && prev !== rule ? 'switch' : 'repeat' };
      });
      return { kind: 'steps', steps, allowed: 1 };
    } }),
  std({ num: 65, title: 'Opposite Compass', max: 14, practiceTrials: 3,
    how: ['An arrow points north, south, east or west.', 'Tap the OPPOSITE direction. Later a cue tells you whether to go SAME or OPPOSITE.', 'The clock tightens as you improve.'],
    makeTrial(rng, lv) {
      const D = [['↑', 270], ['→', 0], ['↓', 90], ['←', 180]], d = rng.int(0, 3), mode = lv >= 6 && rng.chance(0.5) ? 'SAME' : 'OPPOSITE', ans = mode === 'SAME' ? d : (d + 2) % 4;
      return { kind: 'choice', promptHtml: `${lv >= 6 ? `<span class="cue ${mode === 'SAME' ? 'size' : 'shape'}">${mode}</span>` : ''}${arrow(D[d][1])}`, prompt: '', options: [0, 1, 2, 3].map((i) => ({ label: D[i][0], value: i })), answer: ans, cols: 4, timeMs: Math.max(1100, 3200 - lv * 140), tag: mode === 'SAME' ? 'repeat' : 'conflict' };
    } }),
  std({ num: 66, title: 'Day–Night Signals', max: 14, practiceTrials: 3,
    how: ['A sun or a moon appears.', 'Upside-down rules: press NIGHT for the sun and DAY for the moon.', 'Later, a gold border means NORMAL rules for that one signal.'],
    makeTrial(rng, lv) {
      const sun = rng.chance(0.5), normal = lv >= 6 && rng.chance(0.3), ans = normal ? (sun ? 'DAY' : 'NIGHT') : sun ? 'NIGHT' : 'DAY';
      return { kind: 'choice', promptHtml: `<span class="sig${normal ? ' gold' : ''}">${sun ? sunHtml : moonHtml}</span>`, prompt: normal ? 'Gold border: normal rules' : '', options: [{ label: '☀ DAY', value: 'DAY' }, { label: '☾ NIGHT', value: 'NIGHT' }], answer: ans, timeMs: Math.max(1100, 3000 - lv * 130), tag: normal ? 'switch' : 'conflict' };
    } }),
  std({ num: 67, title: 'Category Flip', max: 12,
    how: ['The same kind of object can be sorted in different ways.', 'A cue tells you which property counts this time: COLOUR, SHAPE or SIZE.', 'Answer for that property only. The third property appears at level 6.'],
    makeTrial(rng, lv) {
      const props = lv >= 6 ? ['COLOUR', 'SHAPE', 'SIZE'] : ['COLOUR', 'SHAPE'], p = rng.pick(props), warm = rng.chance(0.5), round = rng.chance(0.5), big = rng.chance(0.5);
      const color = warm ? rng.pick(['red', 'orange', 'yellow']) : rng.pick(['blue', 'green', 'teal']), shape = round ? rng.pick(['circle', 'heart']) : rng.pick(['square', 'triangle', 'diamond']);
      const opts = { COLOUR: [['Warm', true], ['Cool', false]], SHAPE: [['Round', true], ['Angular', false]], SIZE: [['Big', true], ['Small', false]] }[p];
      return { kind: 'choice', promptHtml: `<span class="cue">${p}</span>${glyph({ shape, color, scale: big ? 1 : 0.55 })}`, prompt: '', options: opts.map(([l, v]) => ({ label: l, value: v })), answer: p === 'COLOUR' ? warm : p === 'SHAPE' ? round : big, timeMs: Math.max(1600, 4200 - lv * 180) };
    } }),
  std({ num: 68, title: 'Traffic Exception', max: 12,
    how: ['A routing board lists which lane each vehicle takes, plus exceptions.', 'Exceptions listed first win over the basic rules.', 'Send each vehicle to the right lane. More exceptions as you improve. (Fictional rules, not real driving advice.)'],
    makeTrial(rng, lv) {
      const V = ['car', 'truck', 'bus', 'van'], lanes = ['A', 'B', 'C'], F = ['red', 'green', 'blue'], base = Object.fromEntries(V.map((v) => [v, rng.pick(lanes)]));
      const nex = Math.min(3, Math.floor((lv + 1) / 3)), ex = [];
      for (let i = 0; i < nex; i++) { const v = rng.pick(V), f = rng.pick(F), l = rng.pick(lanes.filter((x) => x !== base[v])); if (!ex.some((e) => e.v === v && e.f === f)) ex.push({ v, f, l }); }
      if (lv >= 9) ex.push({ v: '*', f: rng.pick(F), l: rng.pick(lanes) });
      const veh = rng.chance(0.55) && ex.length ? { v: ex[rng.int(0, ex.length - 1)].v, f: null } : { v: rng.pick(V), f: null };
      if (veh.v === '*') veh.v = rng.pick(V);
      veh.f = rng.chance(0.6) && ex.length ? rng.pick(ex).f : rng.pick(F);
      const hit = ex.find((e) => (e.v === veh.v || e.v === '*') && e.f === veh.f), ans = hit ? hit.l : base[veh.v];
      const board = `<span class="rule list">${ex.map((e) => `<span>⚑ ${e.v === '*' ? 'ANY vehicle' : e.v + 's'} with a ${e.f} flag → Lane ${e.l}</span>`).join('')}${V.map((v) => `<span>${v}s → Lane ${base[v]}</span>`).join('')}</span>`;
      return { kind: 'choice', promptHtml: `${board}<span class="logline"><b>${veh.v.toUpperCase()}</b> · ${veh.f} flag</span>`, prompt: '', options: lanes.map((l) => ({ label: 'Lane ' + l, value: l })), answer: ans, timeMs: Math.max(5000, 11000 - lv * 400), tag: hit ? 'switch' : 'repeat' };
    } }),
  std({ num: 69, title: 'Reverse Sort', max: 12,
    how: ['Number cards appear with a cue: ASCENDING or DESCENDING.', 'Tap them in the order the cue asks for.', 'Longer lists, and descending comes up more often as you improve.'],
    makeTrial(rng, lv) {
      const n = Math.min(8, 3 + Math.floor(lv / 2)), vals = rng.sample(range(98).map((x) => x + 1), n), desc = rng.chance(Math.min(0.6, 0.25 + lv * 0.04)), ans = [...vals].sort((a, b) => (desc ? b - a : a - b));
      return { kind: 'order', promptHtml: `<span class="cue ${desc ? 'shape' : 'size'}">${desc ? 'DESCENDING ↓' : 'ASCENDING ↑'}</span>`, items: vals.map((v) => ({ label: String(v), value: v })), answer: ans, prompt: desc ? 'Largest first' : 'Smallest first', tag: desc ? 'switch' : 'repeat' };
    } }),
  std({ num: 70, title: 'Keep or Discard', max: 12, practiceTrials: 3,
    how: ['A rule tells you which cards to KEEP.', 'Check every part of the rule: near-misses are tempting.', 'Rules get more parts as you improve.'],
    makeTrial(rng, lv) {
      const C = ['red', 'blue', 'green', 'yellow'], c = rng.pick(C), mode = lv <= 3 ? 'one' : lv <= 7 ? 'and' : rng.pick(['and', 'or', 'not']);
      const card_ = { color: rng.chance(0.5) ? c : rng.pick(C), n: rng.int(1, 9), shape: rng.pick(['circle', 'star', 'square']) };
      const even = card_.n % 2 === 0, star = card_.shape === 'star', red = card_.color === c;
      const rules = { one: [`Keep ${c} cards`, red], and: [`Keep ${c} cards with an EVEN number`, red && even], or: [`Keep ${c} cards OR stars`, red || star], not: [`Keep ${c} cards that are NOT stars`, red && !star] };
      const [txt, keep] = rules[mode];
      return { kind: 'choice', promptHtml: `<span class="rule">${txt}</span><span class="pcard" style="--c:${COLORS.find((x) => x[0] === card_.color)[1]}">${glyph({ shape: card_.shape, color: card_.color })}<b>${card_.n}</b></span>`, prompt: '', options: [{ label: 'Keep', value: true, cls: 'yes' }, { label: 'Discard', value: false, cls: 'no' }], answer: keep, timeMs: Math.max(2200, 5000 - lv * 200), tag: keep ? 'yes' : 'no' };
    } }),
  std({ num: 71, title: 'Mirror Controls', max: 12, practiceTrials: 1,
    how: ['Guide the gem to the goal with the arrow buttons (or arrow keys).', 'In MIRROR mode, left and right are swapped. The mode banner always shows the current mode.', 'Later the mode flips mid-run. Reach the goal within the move budget.'],
    makeTrial(rng, lv) {
      const n = lv <= 3 ? 5 : lv <= 7 ? 6 : 7, walls = new Set(), start = 0, goal = n * n - 1;
      for (let i = 0; i < n * n * Math.min(0.28, 0.12 + lv * 0.015); i++) { const w = rng.int(1, n * n - 2); walls.add(w); }
      const bfs = () => { const d = new Map([[start, 0]]), q = [start]; while (q.length) { const c = q.shift(); for (const [dr, dc] of [[0, 1], [1, 0], [0, -1], [-1, 0]]) { const r = Math.floor(c / n) + dr, cc = (c % n) + dc, k = r * n + cc; if (r < 0 || cc < 0 || r >= n || cc >= n || walls.has(k) || d.has(k)) continue; d.set(k, d.get(c) + 1); q.push(k); } } return d.get(goal); };
      let dist = bfs(); while (dist == null) { walls.delete([...walls][0]); dist = bfs(); }
      return { kind: 'choice', n, walls: [...walls].sort((a, b) => a - b), start, goal, dist, budget: dist + Math.max(2, 7 - Math.floor(lv / 2)), flipAt: lv >= 5 ? rng.int(2, Math.max(3, dist - 1)) : -1, mirror0: lv >= 3 ? rng.chance(0.6) : true, prompt: '', options: [{ label: 'a', value: 0 }, { label: 'b', value: 1 }], answer: 0 };
    },
    async play(t, ctx) {
      const { n } = t, walls = new Set(t.walls); let pos = t.start, moves = 0, mirror = t.mirror0, wrongWay = 0;
      const cells = range(n * n).map((i) => h('span', { class: 'mz' + (walls.has(i) ? ' wall' : '') + (i === t.goal ? ' goal' : '') }));
      const mode = h('div', { class: 'mode' }), status = h('div', { class: 'status' });
      const draw = () => { cells.forEach((c, i) => c.classList.toggle('me', i === pos)); mode.textContent = mirror ? '⇄ MIRROR MODE: left and right swapped' : 'NORMAL MODE'; mode.classList.toggle('mirror', mirror); status.textContent = `Moves left: ${t.budget - moves}`; };
      let done;
      const move = (dir) => {
        const D = { up: [-1, 0], down: [1, 0], left: [0, -1], right: [0, 1] }; let d = dir; if (mirror && (d === 'left' || d === 'right')) d = d === 'left' ? 'right' : 'left';
        const r = Math.floor(pos / n) + D[d][0], c = (pos % n) + D[d][1], k = r * n + c; moves++;
        const gr = Math.floor(t.goal / n), gc = t.goal % n, before = Math.abs(gr - Math.floor(pos / n)) + Math.abs(gc - (pos % n));
        if (r >= 0 && c >= 0 && r < n && c < n && !walls.has(k)) { pos = k; audio.tap(); } else audio.bad();
        if (Math.abs(gr - Math.floor(pos / n)) + Math.abs(gc - (pos % n)) > before) wrongWay++;
        if (moves === t.flipAt) { mirror = !mirror; mode.classList.add('flash'); setTimeout(() => mode.classList.remove('flash'), 600); audio.tone(660, 0.15, 'triangle', 0.12); }
        draw(); if (pos === t.goal) done(true); else if (moves >= t.budget) done(false);
      };
      const btn = (d, l) => h('button', { class: 'key fn', type: 'button', onclick: () => move(d), 'aria-label': d }, l);
      const onKey = (e) => { const m = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right' }[e.key]; if (m) { e.preventDefault(); move(m); } };
      document.addEventListener('keydown', onKey);
      ctx.stage.replaceChildren(h('div', { class: 'trial' }, mode, status, h('div', { class: 'maze', style: { '--n': n } }, cells), h('div', { class: 'dpad' }, h('span'), btn('up', '▲'), h('span'), btn('left', '◀'), btn('down', '▼'), btn('right', '▶'))));
      draw(); const t0 = now();
      const ok = await new Promise((r) => (done = r)); document.removeEventListener('keydown', onKey);
      await ctx.sleep(ok ? 500 : 900);
      return { correct: ok, rt: now() - t0, tags: { wrongWayMoves: wrongWay }, explain: ok ? '' : `Out of moves (budget ${t.budget}, shortest route ${t.dist}).` };
    } }),
  std({ num: 72, title: 'Question Switch', max: 12, practiceTrials: 1,
    how: ['Each item comes with one of two questions: “Is it living?” or “Is it larger than a chair?”', 'Answer the question currently shown; it switches as you go.', 'Faster switching as you improve. Each block allows one mistake.'],
    makeTrial(rng, lv) {
      const n = Math.min(10, 5 + Math.floor(lv / 2)), items = rng.sample(LIVING, n), every = lv >= 6 ? 1 : 2; let q = rng.int(0, 1);
      return { kind: 'steps', allowed: 1, steps: items.map(([name, liv, big], i) => { const prev = q; if (i > 0 && i % every === 0 && rng.chance(0.7)) q = 1 - q;
        return { kind: 'choice', promptHtml: `<span class="cue ${q ? 'size' : 'shape'}">${q ? 'Larger than a chair?' : 'Is it living?'}</span>`, prompt: name, options: yesNo(), answer: !!(q ? big : liv), timeMs: Math.max(1800, 4200 - lv * 180), flashMs: 220, tag: i > 0 && prev !== q ? 'switch' : 'repeat' }; }) };
    } }),
  std({ num: 73, title: 'Forbidden Number', max: 12,
    how: ['A counting line is shown, but every multiple of the forbidden number is replaced by ★.', 'Fill in the blank: a number or ★.', 'Later a second rule replaces numbers containing a certain digit with ◆ (★ wins if both apply).'],
    makeTrial(rng, lv) {
      const k = rng.int(3, Math.min(9, 3 + Math.floor(lv / 2))), d = lv >= 6 ? rng.int(1, 9) : null, start = rng.int(1, 20 + lv * 5), len = 8;
      const sym = (x) => (x % k === 0 ? '★' : d != null && String(x).includes(String(d)) ? '◆' : String(x));
      const blank = rng.int(3, len - 1), xs = range(len).map((i) => start + i), ans = sym(xs[blank]);
      const opts = new Set([ans, '★', String(xs[blank])]); if (d != null) opts.add('◆'); opts.add(String(xs[blank] + 1));
      return { kind: 'choice', promptHtml: `<span class="rule">★ = multiples of ${k}${d != null ? ` · ◆ = contains a ${d}` : ''}</span><span class="countline">${xs.map((x, i) => `<b>${i === blank ? '?' : sym(x)}</b>`).join('')}</span>`, prompt: '', options: [...opts].slice(0, 5).map((o) => ({ label: o, value: o })), answer: ans, timeMs: Math.max(4000, 9000 - lv * 350) };
    } }),
  std({ num: 74, title: 'Change the Sorting Law', max: 12, practiceTrials: 0,
    how: ['Match each card to one of the four key cards. Nobody tells you the rule: it could be colour, shape or count.', 'Feedback shows if you were right. Use it to work out the rule.', 'Without warning the rule changes. Notice and adapt. Each block allows a few mistakes.'],
    makeTrial(rng, lv) {
      const keys = [{ c: 'red', s: 'triangle', n: 1 }, { c: 'green', s: 'star', n: 2 }, { c: 'yellow', s: 'cross', n: 3 }, { c: 'blue', s: 'circle', n: 4 }];
      const dims = ['c', 's', 'n'], r1 = rng.pick(dims), r2 = rng.pick(dims.filter((x) => x !== r1)), len = Math.min(14, 9 + Math.floor(lv / 2)), sw = rng.int(4, len - 4);
      const draw = (k) => `<span class="wcard">${range(k.n).map(() => glyph({ shape: k.s, color: k.c })).join('')}</span>`;
      const steps = range(len).map((i) => { const p = rng.shuffle([0, 1, 2, 3]), card_ = { c: keys[p[0]].c, s: keys[p[1]].s, n: keys[p[2]].n }, rule = i < sw ? r1 : r2, ans = keys.findIndex((k) => k[rule] === card_[rule]);
        return { kind: 'choice', promptHtml: draw(card_), prompt: 'Match to a key card', options: keys.map((k, j) => ({ html: draw(k), value: j, cls: 'tile' })), answer: ans, cols: 4, reveal: false, flashMs: 500, tag: i >= sw ? 'switch' : 'repeat' }; });
      return { kind: 'steps', steps, allowed: Math.max(3, 6 - Math.floor(lv / 3)), scoreLast: false };
    } }),
  std({ num: 75, title: 'Relevant Dimension', max: 14, practiceTrials: 3,
    how: ['Two numbers appear in different print sizes.', 'The cue says what to judge: the bigger VALUE, or the bigger PRINT SIZE.', 'More conflicting pairs as you improve.'],
    makeTrial(rng, lv) {
      let a = rng.int(1, 9), b; do { b = rng.int(1, 9); } while (b === a); const conflict = rng.chance(Math.min(0.8, 0.4 + lv * 0.03)), aBigPrint = conflict ? a < b : a > b, cue = rng.pick(['VALUE', 'SIZE']);
      const ans = cue === 'VALUE' ? (a > b ? 'L' : 'R') : aBigPrint ? 'L' : 'R';
      return { kind: 'choice', promptHtml: `<span class="cue">${cue === 'VALUE' ? 'Bigger VALUE' : 'Bigger PRINT'}</span>`, prompt: '', options: [{ html: `<b class="num" style="font-size:${aBigPrint ? 74 : 34}px">${a}</b>`, value: 'L', aria: String(a) }, { html: `<b class="num" style="font-size:${aBigPrint ? 34 : 74}px">${b}</b>`, value: 'R', aria: String(b) }], answer: ans, timeMs: Math.max(1300, 3400 - lv * 140), tag: conflict ? 'conflict' : 'plain' };
    } }),
  std({ num: 76, title: 'Pause Before Choice', max: 12,
    how: ['A thief is among the suspects. Clues arrive one by one.', 'You may tap a provisional suspect at any time, and change your mind.', 'Only your choice after the LAST clue counts. Early clues can be misleading.'],
    makeTrial(rng, lv) {
      const k = Math.min(6, 4 + Math.floor(lv / 5)), names = rng.sample(NAMES, k), hat = rng.chance(0.5), coat = rng.pick(['red', 'grey', 'green']), sus = names.map((n) => ({ n, hat: rng.chance(0.5), coat: rng.pick(['red', 'grey', 'green']), tall: rng.chance(0.5) }));
      const cul = 0, dec = 1; sus[cul].hat = sus[dec].hat = hat; sus[cul].coat = sus[dec].coat = coat; sus[cul].tall = true; sus[dec].tall = false;
      for (let i = 2; i < k; i++) { if (sus[i].hat === hat && sus[i].coat === coat) sus[i].coat = ['red', 'grey', 'green'].find((c) => c !== coat); }
      const clues = [`The thief ${hat ? 'wore' : 'did not wear'} a hat.`, `The thief’s coat was ${coat}.`, 'A witness saw the thief reach the TOP shelf without a ladder: the thief is tall.'];
      if (lv >= 6) clues.splice(1, 0, `${sus[dec].n} was seen near the scene.`);
      const order = rng.shuffle(range(k));
      return { kind: 'choice', sus, clues, order, prompt: '', options: order.map((i) => ({ label: sus[i].n, value: i })), answer: cul, gapMs: Math.max(2200, 3600 - lv * 100) };
    },
    async play(t, ctx) {
      const list = h('div', { class: 'memo list' }), status = h('div', { class: 'status' }, 'Clues incoming…'); let pick = null, early = null, changes = 0, ready = false;
      const btns = t.order.map((i) => { const s = t.sus[i]; return h('button', { class: 'opt suspect', type: 'button', onclick: () => { if (pick !== i) { if (pick !== null) changes++; pick = i; } if (!ready && early === null) early = i; btns.forEach((b) => b.classList.remove('sel')); btns[t.order.indexOf(i)].classList.add('sel'); audio.tap(); lock.disabled = !ready; } },
        h('b', {}, s.n), h('small', {}, `${s.hat ? 'hat' : 'no hat'} · ${s.coat} coat · ${s.tall ? 'tall' : 'short'}`)); });
      const lock = h('button', { class: 'btn big', type: 'button', disabled: true }, 'Lock in');
      ctx.stage.replaceChildren(h('div', { class: 'trial' }, status, list, h('div', { class: 'opts', style: { '--cols': 2 } }, btns), lock));
      for (let i = 0; i < t.clues.length; i++) { await ctx.sleep(i ? t.gapMs : 600); list.append(h('span', { class: 'in' }, `🔎 ${t.clues[i]}`)); audio.tone(520, 0.08, 'triangle', 0.08); }
      ready = true; status.textContent = 'All clues are in. Choose and lock in.'; lock.disabled = pick === null;
      await new Promise((r) => (lock.onclick = r));
      const correct = pick === t.answer; btns.forEach((b, j) => { b.disabled = true; if (t.order[j] === t.answer) b.classList.add('right'); else if (t.order[j] === pick) b.classList.add('wrong'); });
      await ctx.sleep(1000);
      return { correct, rt: null, tags: { earlyTotal: early !== null ? 1 : 0, earlyRight: early === t.answer ? 1 : 0, mindChanges: changes }, explain: correct ? '' : `It was ${t.sus[t.answer].n}: the only tall suspect matching every clue.` };
    } }),
  std({ num: 77, title: 'Exception Collector', max: 12, practiceTrials: 3,
    how: ['Collect every item of the target category.', 'BUT skip any item wearing a silver badge, even if it is in the category.', 'From level 6, a gold badge means collect it regardless.'],
    makeTrial(rng, lv) {
      const cat = rng.pick(['circle', 'triangle', 'square']), inCat = rng.chance(0.55), shape = inCat ? cat : rng.pick(['circle', 'triangle', 'square'].filter((s) => s !== cat));
      const badge = rng.chance(0.3) ? 'silver' : lv >= 6 && rng.chance(0.25) ? 'gold' : null, ans = badge === 'gold' ? true : badge === 'silver' ? false : inCat;
      return { kind: 'choice', promptHtml: `<span class="rule">Collect ${cat}s · skip <b style="color:#cfd8e3">silver ●</b>${lv >= 6 ? ' · always take <b style="color:#ffc94a">gold ●</b>' : ''}</span><span class="pcard">${glyph({ shape, color: rng.pick(COLORS)[0] })}${badge ? `<i class="badge-dot ${badge}"></i>` : ''}</span>`, prompt: '', options: [{ label: 'Collect', value: true, cls: 'yes' }, { label: 'Skip', value: false, cls: 'no' }], answer: ans, timeMs: Math.max(1800, 4200 - lv * 180), tag: badge ? 'switch' : 'repeat' };
    } }),
  std({ num: 78, title: 'Mixed-Operation Relay', max: 12,
    how: ['Start with the number given, then apply each card in order.', 'Watch the symbol on each card: it decides the operation.', 'Longer chains and multiplication as you improve.'],
    makeTrial(rng, lv) {
      let v = rng.int(2, 12); const start = v, ops = lv >= 7 ? ['+', '−', '×'] : ['+', '−'], cards = [], n = Math.min(7, 2 + Math.floor(lv / 2));
      for (let i = 0; i < n; i++) { let o = rng.pick(ops), x; if (o === '×') { x = rng.int(2, 3); if (v * x > 150) o = '−'; } if (o === '−' && v === 0) o = '+'; if (o === '+') x = rng.int(1, 9 + lv); if (o === '−') { x = rng.int(1, Math.max(1, Math.min(v, 9 + lv))); } if (o === '×') v *= x; else v = o === '+' ? v + x : v - x; cards.push(`${o}${x}`); }
      return { kind: 'numeric', promptHtml: `<span class="countline"><b class="start">${start}</b>${cards.map((c) => `<b class="${c[0] === '+' ? 'plus' : c[0] === '×' ? 'times' : 'minus'}">${c}</b>`).join('')}</span>`, prompt: 'Result?', answer: v };
    } }),
  std({ num: 79, title: 'Strategy Reset', max: 12, practiceTrials: 0,
    how: ['Solve a run of number patterns. The first few follow the same kind of rule.', 'Then one looks the same but works differently. Notice when your usual method stops working.', 'Only the final puzzle decides the round, so check it carefully.'],
    makeTrial(rng, lv) {
      const mk = (rule, s0, k) => { const s = [s0]; for (let i = 1; i < 5; i++) s.push(rule === 'add' ? s[i - 1] + k : rule === 'mul' ? s[i - 1] * k : rule === 'alt' ? s[i - 1] + (i % 2 ? k : -1) : s[i - 1] + k + i - 1); return s; };
      const step = (rule) => { const k = rng.int(2, rule === 'mul' ? 3 : 7), s = mk(rule, rng.int(1, 9), k); const ans = s[4], shown = s.slice(0, 4); const naive = shown[3] + (shown[3] - shown[2]);
        return { kind: 'choice', promptHtml: `<span class="countline">${shown.map((x) => `<b>${x}</b>`).join('')}<b>?</b></span>`, prompt: 'What comes next?', options: [...new Set([ans, naive, ans + 1, ans - 2, naive + 2])].slice(0, 4).sort((a, b) => a - b).map((x) => ({ label: String(x), value: x })), answer: ans, flashMs: 300 }; };
      const nPrev = Math.min(4, 2 + Math.floor(lv / 4)), twist = rng.pick(lv >= 6 ? ['mul', 'alt', 'grow'] : ['mul', 'grow']);
      return { kind: 'steps', scoreLast: true, steps: [...range(nPrev).map(() => step('add')), { ...step(twist), tag: 'switch' }] };
    } }),
  std({ num: 80, title: 'Undo the Habit', max: 12, practiceTrials: 0,
    how: ['First learn which button each symbol goes to, and practise it.', 'Then a NEW mapping is announced. Use it, even though the old habit pulls at you.', 'More symbols and longer first phases as you improve. One mistake allowed per block after the switch.'],
    makeTrial(rng, lv) {
      const k = lv >= 7 ? 4 : lv >= 4 ? 3 : 2, syms = rng.sample(SHAPES, k), cols = rng.sample(COLORS, k), btn = ['A', 'B', 'C', 'D'].slice(0, k), old = rng.shuffle(range(k));
      let nw; do { nw = rng.shuffle(range(k)); } while (nw.some((x, i) => x === old[i]));
      const map = (m) => syms.map((s, i) => `${s} → ${btn[m[i]]}`).join(' · '), pre = Math.min(10, 4 + Math.floor(lv / 2)), post = Math.min(10, 5 + Math.floor(lv / 2));
      const trial = (m, tag, i) => { const j = rng.int(0, k - 1); return { kind: 'choice', promptHtml: glyph({ shape: syms[j], color: cols[j][0] }), prompt: '', options: btn.map((b, x) => ({ label: b, value: x })), answer: m[j], flashMs: 200, cols: k, tag }; };
      const steps = [...range(pre).map((i) => ({ ...trial(old, 'repeat', i), ...(i === 0 ? { banner: `Mapping: ${map(old)}`, bannerMs: 3500 + 800 * k } : {}) })), ...range(post).map((i) => ({ ...trial(nw, 'switch', i), ...(i === 0 ? { banner: `NEW mapping: ${map(nw)}`, bannerMs: 3500 + 800 * k } : {}) }))];
      return { kind: 'steps', steps, allowed: 2 };
    } }),
];
