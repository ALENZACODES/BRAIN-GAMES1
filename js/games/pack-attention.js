// Concepts 41–60: attention and distraction control.
import { std, runTrial, playTones, toneBars } from '../play.js';
import { h, now, audio } from '../engine.js';
import { choiceTrial, timerBar } from '../kit.js';
import { glyph, tok, card, gridSVG, arrow, mc, numOpts, yesNo, toneFor, NAMES, OBJECTS, HUES, COLORS, SHAPES, PATTERNS, LETTERS, range } from '../gfx.js';

const SENT = ['The ferry leaves the harbour every morning at seven.', 'Our neighbour planted tomatoes along the garden fence.', 'Please return the library books before the weekend.', 'The museum opens a new exhibit about ancient maps.', 'A strong wind knocked several branches onto the road.',
  'She practised the piano for an hour after dinner.', 'The bakery sells fresh bread until the early afternoon.', 'We watched the storm roll across the distant mountains.', 'The committee will announce the results on Friday.', 'He packed a sandwich, an apple and a bottle of water.',
  'The old clock in the hallway chimes every quarter hour.', 'Visitors must sign the register at the front desk.', 'The children built a sandcastle near the lifeguard tower.', 'Turn left at the bridge and follow the river path.', 'The recipe calls for two cups of flour and some butter.',
  'Our team finished the project three days ahead of schedule.', 'The train was delayed because of snow on the tracks.', 'Bright lanterns lined the narrow streets of the old town.', 'The gardener trimmed the hedges into neat green walls.', 'A small boat drifted slowly past the sleeping village.'];
const PASS = [
  { t: ['The town of Esk sits where two rivers meet.', 'For centuries its people made rope from river reeds.', 'When steel cables arrived, the rope trade collapsed.', 'Today Esk is known for a summer festival of floating lanterns.', 'The lanterns are still tied with reed rope, made the old way.'], q: [['What did Esk once make?', 'Rope', ['Lanterns', 'Steel cables', 'Boats']], ['What ended the old trade?', 'Steel cables', ['A flood', 'The festival', 'A war']]] },
  { t: ['Mara keeps bees on her apartment roof.', 'Her first hive failed because it faced the cold north wind.', 'She moved the second hive behind a brick chimney.', 'That colony survived the winter and made twelve jars of honey.', 'She gives most of the jars to neighbours.'], q: [['Why did the first hive fail?', 'It faced the cold wind', ['It had no queen', 'Neighbours moved it', 'It was too sunny']], ['How many jars did the colony make?', '12', ['6', '20', '2']]] },
  { t: ['The night train from Ovid to Lark takes nine hours.', 'Passengers can book a bunk or a reclining seat.', 'Bunks cost twice as much but include breakfast.', 'In winter the route detours around the frozen lake.', 'The detour adds about an hour to the trip.'], q: [['What do bunks include?', 'Breakfast', ['A window seat', 'Free wifi', 'Lunch']], ['Why is there a winter detour?', 'The lake freezes', ['Snow on the tracks', 'A bridge closes', 'Fewer passengers']]] },
  { t: ['A lighthouse keeper named Ilse kept a weather diary for forty years.', 'She wrote three lines every evening.', 'Scientists later used the diary to study changing storms.', 'They found storms arriving two weeks earlier than in her first years.', 'The diary now sits in the regional museum.'], q: [['How long did Ilse keep the diary?', 'Forty years', ['Four years', 'Fourteen years', 'Twenty years']], ['What did scientists find?', 'Storms came earlier', ['Storms were weaker', 'Fewer ships sank', 'Winters were longer']]] },
  { t: ['The school garden began as an empty parking strip.', 'Students tested the soil and found it was too salty.', 'They built raised beds filled with compost instead.', 'Now the beds grow beans, squash and herbs for the cafeteria.', 'Each class looks after one bed for a month.'], q: [['Why were raised beds built?', 'The soil was too salty', ['To save space', 'To keep rabbits out', 'For the view']], ['Who looks after each bed?', 'One class for a month', ['The cafeteria staff', 'The principal', 'Parent volunteers']]] },
  { t: ['Orin repairs old radios in a tiny shop.', 'Most customers bring radios that belonged to grandparents.', 'The hardest part is finding replacement valves.', 'He trades parts with collectors in other countries by mail.', 'A repair usually takes him about three weeks.'], q: [['What is the hardest part of the work?', 'Finding replacement valves', ['Cleaning the cases', 'Talking to customers', 'Shipping radios']], ['How does he get parts?', 'Trading with collectors by mail', ['From a factory', 'At auctions', 'From his grandparents']]] },
];

const LIT = (on) => `<svg viewBox="0 0 100 100" class="gl"><circle cx="50" cy="50" r="34" fill="${on ? '#ffd84a' : '#3b3f5c'}" ${on ? 'filter="drop-shadow(0 0 12px #ffd84a)"' : ''}/></svg>`;

export const G = [
  std({ num: 41, title: 'Target Harbour', max: 12,
    how: ['Boats crowd the harbour, each flying a symbol.', 'Tap every boat flying the TARGET symbol, then press Done.', 'More boats and more look-alike symbols as you improve.'],
    makeTrial(rng, lv) {
      const n = Math.min(20, 8 + lv), k = rng.int(2, Math.min(6, 2 + Math.floor(lv / 3))), tShape = rng.pick(SHAPES), tCol = rng.pick(COLORS)[0];
      const items = range(n).map((i) => {
        if (i < k) return { shape: tShape, color: tCol };
        if (lv >= 5 && rng.chance(0.5)) return rng.chance(0.5) ? { shape: tShape, color: rng.pick(COLORS.filter((c) => c[0] !== tCol))[0] } : { shape: rng.pick(SHAPES.filter((s) => s !== tShape)), color: tCol };
        return { shape: rng.pick(SHAPES.filter((s) => s !== tShape)), color: rng.pick(COLORS)[0] };
      });
      const order = rng.shuffle(range(n));
      return { kind: 'multi', promptHtml: `<span class="flag">${glyph({ shape: tShape, color: tCol })}</span>`, prompt: 'Tap every boat with this flag', items: order.map((i) => ({ html: `<span class="boat">${glyph(items[i])}</span>`, value: i, aria: `${items[i].color} ${items[i].shape}` })),
        answer: range(k), cols: n > 12 ? 5 : 4, timeMs: Math.max(6000, 15000 - lv * 600) };
    } }),
  std({ num: 42, title: 'Central Arrow', max: 14, practiceTrials: 3,
    how: ['A row of arrows appears.', 'Report the direction of the MIDDLE arrow only, ignoring its neighbours. Left/right keys work too.', 'The clock gets shorter as you improve.'],
    makeTrial(rng, lv) {
      const dir = rng.chance(0.5) ? 0 : 180, inc = rng.chance(Math.min(0.75, 0.4 + lv * 0.03)), w = lv >= 8 ? 7 : 5, mid = Math.floor(w / 2);
      const row = range(w).map((i) => (i === mid ? dir : inc ? 180 - dir : dir));
      return { kind: 'choice', promptHtml: `<span class="arrows">${row.map((d) => arrow(d)).join('')}</span>`, prompt: 'Middle arrow points…', options: [{ label: '← Left', value: 180 }, { label: 'Right →', value: 0 }], answer: dir, timeMs: Math.max(900, 2600 - lv * 120), tag: inc ? 'incongruent' : 'congruent' };
    } }),
  std({ num: 43, title: 'Quiet Signal', max: 12, maxTrials: 10, practiceTrials: 1,
    how: ['A signal lamp blinks steadily. Most blinks are routine.', 'Press only when the lamp shows the RARE double ring.', 'Blocks get longer and the rare signal rarer. Each block allows one mistake.'],
    makeTrial(rng, lv) {
      const len = Math.min(30, 12 + lv * 2), p = Math.max(0.1, 0.22 - lv * 0.01), targets = range(len).map((i) => i > 1 && rng.chance(p));
      if (!targets.some(Boolean)) targets[rng.int(3, len - 1)] = true;
      for (let i = 1; i < len; i++) if (targets[i] && targets[i - 1]) targets[i] = false;
      const plain = `<svg viewBox="0 0 100 100" class="gl"><circle cx="50" cy="50" r="30" fill="#7ef0ff"/></svg>`, rare = `<svg viewBox="0 0 100 100" class="gl"><circle cx="50" cy="50" r="30" fill="#7ef0ff"/><circle cx="50" cy="50" r="42" fill="none" stroke="#7ef0ff" stroke-width="5"/></svg>`;
      return { kind: 'stream', items: targets.map((t) => ({ html: t ? rare : plain })), targets, intervalMs: Math.max(900, 1500 - lv * 40), showMs: 450, allowed: 1, prompt: 'Press only for the double ring', promptHtml: `<span class="row">${rare}</span>`, button: 'SIGNAL' };
    } }),
  std({ num: 44, title: 'Changing Shopfront', max: 12,
    how: ['A street scene flickers between two versions with a blink in between.', 'One thing is different between them. Find it and tap it.', 'Busier scenes and subtler changes as you improve.'],
    makeTrial(rng, lv) {
      const n = Math.min(20, 6 + lv), cols = n > 12 ? 5 : 4, A = range(n).map(() => ({ shape: rng.pick(SHAPES), color: rng.pick(COLORS)[0], pattern: 'solid' })), j = rng.int(0, n - 1), B = A.map((x) => ({ ...x }));
      const type = lv <= 3 ? 'gone' : rng.pick(lv >= 8 ? ['color', 'shape', 'pattern'] : ['gone', 'color', 'shape']);
      if (type === 'color') B[j].color = rng.pick(COLORS.filter((c) => c[0] !== A[j].color))[0]; else if (type === 'shape') B[j].shape = rng.pick(SHAPES.filter((s) => s !== A[j].shape)); else if (type === 'pattern') B[j].pattern = 'stripes'; else B[j] = null;
      return { kind: 'choice', A, B, j, cols, type, prompt: 'What changes?', options: range(n).map((i) => ({ value: i, label: String(i) })), answer: j, timeMs: Math.max(9000, 22000 - lv * 900) };
    },
    async play(t, ctx) {
      const nodes = t.A.map(() => h('span', { class: 'rich' }));
      let phase = 0, iv = setInterval(() => { phase = (phase + 1) % 4; nodes.forEach((nd, i) => { const o = phase === 0 ? t.A[i] : phase === 2 ? t.B[i] : undefined; nd.innerHTML = o === undefined ? '' : o ? glyph(o) : ''; }); }, 260);
      nodes.forEach((nd, i) => (nd.innerHTML = glyph(t.A[i])));
      const r = await choiceTrial(ctx, { prompt: 'Tap the thing that changes', options: t.A.map((_, i) => ({ node: nodes[i], value: i, cls: 'tile', aria: `Item ${i + 1}` })), answer: t.j, timeMs: t.timeMs, cols: t.cols, flashMs: 700 });
      clearInterval(iv); nodes.forEach((nd, i) => (nd.innerHTML = glyph(t.A[i])));
      return { ...r, tags: { [t.type + 'Total']: 1, [t.type + 'Right']: r.correct ? 1 : 0, ...(r.timedOut ? { omission: 1 } : {}) }, explain: r.correct ? '' : 'The changing item is outlined in green.' };
    } }),
  std({ num: 45, title: 'Multiple-Object Tracker', max: 12,
    how: ['Several orbs float in the arena. A few glow briefly: those are your targets.', 'All orbs then look the same and drift around. Keep your eyes on the targets.', 'When they stop, tap all your targets. More targets and faster motion as you improve.'],
    makeTrial(rng, lv) {
      const k = Math.min(5, 2 + Math.floor(lv / 3)), n = Math.min(12, k + 4 + Math.floor(lv / 2)), sp = 0.12 + lv * 0.018;
      const o = range(n).map(() => { const a = rng.float(0, 6.283); return { x: rng.float(0.1, 0.9), y: rng.float(0.1, 0.9), vx: Math.cos(a) * sp, vy: Math.sin(a) * sp }; });
      return { kind: 'multi', o, k, durMs: Math.min(9000, 4500 + lv * 350), items: range(n).map((i) => ({ label: String(i + 1), value: i })), answer: range(k), need: k };
    },
    async play(t, ctx) {
      const n = t.o.length, arena = h('div', { class: 'arena' }), status = h('div', { class: 'status' }, 'Remember the glowing orbs');
      const els = t.o.map((_, i) => { const b = h('button', { class: 'orb' + (i < t.k ? ' tgt' : ''), type: 'button', disabled: true, 'aria-label': `Orb ${i + 1}` }); arena.append(b); return b; });
      const go = h('button', { class: 'btn big', type: 'button', disabled: true }, `Done (0/${t.k})`);
      ctx.stage.replaceChildren(h('div', { class: 'trial' }, status, arena, go));
      const pos = t.o.map((p) => ({ ...p })), place = () => pos.forEach((p, i) => (els[i].style.transform = `translate(${p.x * arena.clientWidth - 18}px, ${p.y * arena.clientHeight - 18}px)`));
      place(); await ctx.sleep(1900); els.forEach((e) => e.classList.remove('tgt')); status.textContent = 'Track them…';
      await new Promise((res) => {
        let last = now(); const end = last + t.durMs;
        const step = () => { if (!ctx.alive()) return; const tt = now(), dt = Math.min(0.05, (tt - last) / 1000); last = tt;
          for (const p of pos) { p.x += p.vx * dt * 2.2; p.y += p.vy * dt * 2.2; if (p.x < 0.06 || p.x > 0.94) { p.vx *= -1; p.x = Math.min(0.94, Math.max(0.06, p.x)); } if (p.y < 0.06 || p.y > 0.94) { p.vy *= -1; p.y = Math.min(0.94, Math.max(0.06, p.y)); } }
          place(); if (tt < end) requestAnimationFrame(step); else res(); };
        requestAnimationFrame(step);
      });
      status.textContent = `Tap your ${t.k} targets`; const sel = new Set(), t0 = now();
      els.forEach((e, i) => { e.disabled = false; e.onclick = () => { if (sel.has(i)) sel.delete(i); else if (sel.size < t.k) sel.add(i); e.classList.toggle('sel', sel.has(i)); audio.tap(); go.disabled = sel.size !== t.k; go.textContent = `Done (${sel.size}/${t.k})`; }; });
      await new Promise((r) => (go.onclick = r));
      const hit = [...sel].filter((i) => i < t.k).length; els.forEach((e, i) => { e.disabled = true; e.classList.add(i < t.k ? (sel.has(i) ? 'right' : 'missed') : sel.has(i) ? 'wrong' : 'x'); });
      await ctx.sleep(1300);
      return { correct: hit === t.k, rt: now() - t0, tags: { hit, miss: t.k - hit }, explain: hit === t.k ? '' : `You tracked ${hit} of ${t.k}.` };
    } }),
  std({ num: 46, title: 'Pattern Search', max: 12,
    how: ['A target pattern is shown at the top.', 'Find the ONE tile below that matches it exactly.', 'More tiles and closer look-alikes as you improve.'],
    makeTrial(rng, lv) {
      const sz = lv >= 7 ? 4 : 3, n = Math.min(16, 4 + lv), tgt = range(sz * sz).map(() => rng.chance(0.45)), key = (p) => p.map((b) => +b).join(''), seen = new Set([key(tgt)]), tiles = [];
      while (tiles.length < n - 1) { const p = [...tgt], flips = lv >= 6 ? 1 : rng.int(1, 3); for (let f = 0; f < flips; f++) { const i = rng.int(0, p.length - 1); p[i] = !p[i]; } if (!seen.has(key(p))) { seen.add(key(p)); tiles.push(p); } }
      const all = rng.shuffle([tgt, ...tiles]), draw = (p) => gridSVG(p.map((b) => ({ fill: b ? '#7ef0ff' : 'rgba(255,255,255,.07)' })), sz, { gap: 5, round: 4 });
      return { kind: 'choice', promptHtml: `<span class="ref">${draw(tgt)}</span>`, prompt: 'Find this exact pattern', options: all.map((p) => ({ html: draw(p), value: key(p), cls: 'tile' })), answer: key(tgt), cols: n > 9 ? 4 : 3, timeMs: Math.max(5000, 14000 - lv * 600) };
    } }),
  std({ num: 47, title: 'Sound Sentinel', max: 12, maxTrials: 10, practiceTrials: 1,
    how: ['Short chirps play one after another.', 'Press only when you hear the TARGET chirp: a high note falling to a low note.', 'Similar decoys and longer gaps as you improve. With sound off, pitch bars are shown.'],
    makeTrial(rng, lv) {
      const len = Math.min(24, 10 + lv), hi = toneFor(7), lo = toneFor(2), targets = [], items = [];
      for (let i = 0; i < len; i++) {
        const t = i > 0 && rng.chance(0.25); targets.push(t);
        let tones = t ? [hi, lo] : null;
        if (!t) { const kind = lv >= 5 ? rng.pick(['rise', 'samehi', 'fallsmall', 'other']) : rng.pick(['rise', 'other']); tones = kind === 'rise' ? [lo, hi] : kind === 'samehi' ? [hi, hi] : kind === 'fallsmall' ? [hi, toneFor(5)] : [toneFor(rng.int(0, 4)), toneFor(rng.int(0, 4))]; }
        items.push({ label: '♪', tones, toneGap: 0.18 });
      }
      if (!targets.some(Boolean)) { targets[3] = true; items[3].tones = [hi, lo]; }
      return { kind: 'stream', items, targets, intervalMs: Math.max(1200, 1800 - lv * 40), showMs: 700, allowed: 1, prompt: 'Press for HIGH → LOW only', promptHtml: toneBars([hi, lo]), button: 'TARGET' };
    } }),
  std({ num: 48, title: 'Dual Watch', max: 12, practiceTrials: 1,
    how: ['Two gauges move on their own. Each has its own red line.', 'Press LEFT the moment the left gauge crosses its line, RIGHT for the right gauge.', 'More frequent and simultaneous crossings as you improve.'],
    makeTrial(rng, lv) {
      const ticks = 18 + lv, mk = (thr) => { const v = []; let x = rng.float(0.2, thr - 0.1); for (let i = 0; i < ticks; i++) { x += rng.float(-0.12, 0.14 + lv * 0.004); if (x > thr + 0.15 && rng.chance(0.5)) x = rng.float(0.15, thr - 0.08); x = Math.max(0.05, Math.min(0.97, x)); v.push(+x.toFixed(3)); } return v; };
      const tl = rng.float(0.55, 0.75), tr = rng.float(0.55, 0.75), L = mk(tl), R = mk(tr);
      const cross = (v, th) => v.map((x, i) => i > 0 && v[i - 1] < th && x >= th);
      return { kind: 'stream', L, R, tl, tr, cl: cross(L, tl), cr: cross(R, tr), tickMs: Math.max(550, 1000 - lv * 35), items: [{ label: '' }], targets: [true] };
    },
    async play(t, ctx) {
      const gauge = (side) => { const f = h('i', { class: 'gfill' }); const g = h('div', { class: 'gauge' }, h('b', { class: 'gline', style: { bottom: (side === 'L' ? t.tl : t.tr) * 100 + '%' } }), f); return { g, f }; };
      const gl = gauge('L'), gr = gauge('R');
      const bl = h('button', { class: 'btn big', type: 'button' }, '◀ LEFT'), br = h('button', { class: 'btn big', type: 'button' }, 'RIGHT ▶');
      const status = h('div', { class: 'status' }, 'Press when a gauge crosses its red line');
      ctx.stage.replaceChildren(h('div', { class: 'trial' }, status, h('div', { class: 'gauges' }, gl.g, gr.g), h('div', { class: 'actions' }, bl, br)));
      const pl = [], pr = []; let i = 0;
      const press = (arr, b) => { arr.push(i); audio.tap(); b.classList.add('pressed'); setTimeout(() => b.classList.remove('pressed'), 150); };
      bl.onclick = () => press(pl, bl); br.onclick = () => press(pr, br);
      const onKey = (e) => { if (e.repeat) return; if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'f') press(pl, bl); if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'j') press(pr, br); };
      document.addEventListener('keydown', onKey);
      for (i = 0; i < t.L.length; i++) { gl.f.style.height = t.L[i] * 100 + '%'; gr.f.style.height = t.R[i] * 100 + '%'; gl.g.classList.toggle('over', t.L[i] >= t.tl); gr.g.classList.toggle('over', t.R[i] >= t.tr); await ctx.sleep(t.tickMs); }
      document.removeEventListener('keydown', onKey);
      const score = (cr, ps) => { let hit = 0, miss = 0; const used = new Set(); cr.forEach((c, k) => { if (!c) return; const p = ps.find((x) => x >= k && x <= k + 1 && !used.has(x)); if (p != null) { hit++; used.add(p); } else miss++; }); return { hit, miss, fa: ps.length - used.size }; };
      const a = score(t.cl, pl), b = score(t.cr, pr), hit = a.hit + b.hit, miss = a.miss + b.miss, fa = a.fa + b.fa, correct = miss + fa <= 1;
      return { correct, rt: null, tags: { hit, miss, falseAlarm: fa, leftMiss: a.miss, rightMiss: b.miss }, explain: correct ? '' : `Left gauge: ${a.hit} caught, ${a.miss} missed. Right gauge: ${b.hit} caught, ${b.miss} missed. False presses: ${fa}.` };
    } }),
  std({ num: 49, title: 'Relevant Detail', max: 12,
    how: ['A busy scene is shown with a specific question.', 'Find just the detail you need, ignoring everything else.', 'The scene gets busier, but the question stays just as precise.'],
    makeTrial(rng, lv) {
      const n = Math.min(24, 6 + lv * 1.5 | 0), uniq = rng.pick(SHAPES), others = SHAPES.filter((s) => s !== uniq), tc = rng.pick(COLORS)[0];
      const objs = range(n - 1).map(() => ({ shape: rng.pick(others), color: rng.pick(COLORS)[0], pattern: rng.pick(lv >= 6 ? PATTERNS.slice(0, 3) : ['solid']) }));
      const target = { shape: uniq, color: tc, pattern: 'solid' }, scene = rng.shuffle([...objs, target]);
      return { kind: 'choice', promptHtml: `<span class="scene">${scene.map((o) => glyph(o)).join('')}</span>`, prompt: `What colour is the ${uniq}?`, options: mc(rng, { label: tc, value: tc }, COLORS.map((c) => ({ label: c[0], value: c[0] })), 4), answer: tc, timeMs: Math.max(5000, 12000 - lv * 450), cols: 2 };
    } }),
  std({ num: 50, title: 'Odd Rhythm', max: 12,
    how: ['A drum pattern plays and repeats. A lamp flashes on each beat too.', 'In the LAST repeat, one beat comes early or late.', 'Tap which beat was off. Longer patterns and smaller shifts as you improve.'],
    makeTrial(rng, lv) {
      const n = Math.min(6, 3 + Math.floor(lv / 4)), gaps = range(n).map(() => rng.pick([300, 450, 600])), j = rng.int(1, n - 1), shift = Math.max(70, 220 - lv * 13) * (rng.chance(0.5) ? 1 : -1);
      return { kind: 'choice', n, gaps, j, shift, prompt: 'Which beat in the last bar was off?', options: range(n).map((i) => ({ label: `Beat ${i + 1}`, value: i })), answer: j, cols: Math.min(3, n) };
    },
    async play(t, ctx) {
      const lamp = h('div', { class: 'lamp' }), status = h('div', { class: 'status' }, 'Listen and watch…'), bars = h('div', { class: 'progress-dots' }, range(3).map(() => h('i')));
      ctx.stage.replaceChildren(h('div', { class: 'trial' }, status, lamp, bars));
      await ctx.sleep(700);
      for (let rep = 0; rep < 3; rep++) {
        bars.children[rep].classList.add('good');
        const times = []; let acc = 0; for (let i = 0; i < t.n; i++) { times.push(acc + (rep === 2 && i === t.j ? t.shift : 0)); acc += t.gaps[i]; }
        const t0 = now();
        for (let i = 0; i < t.n; i++) { const wait = times[i] - (now() - t0); if (wait > 0) await ctx.sleep(wait); audio.tone(i === 0 ? 180 : 140, 0.08, 'square', 0.18); lamp.classList.add('on'); setTimeout(() => lamp.classList.remove('on'), 90); }
        await ctx.sleep(acc - (now() - t0) + 450);
      }
      const r = await runTrial({ ...t, kind: 'choice' }, ctx);
      return r;
    } }),
  std({ num: 51, title: 'Peripheral Locator', max: 12,
    how: ['Keep your eyes on the centre: a letter flashes there.', 'At the same moment, a dot flashes somewhere around the edge.', 'Report the letter, then where the dot was. Shorter flashes and farther dots as you improve.'],
    makeTrial(rng, lv) {
      const ring = [0, 1, 2, 3, 5, 6, 7, 8], pos = rng.pick(ring), let_ = rng.pick(LETTERS), ms = Math.max(160, 700 - lv * 45), wide = lv >= 6;
      const scene = `<span class="periph${wide ? ' wide' : ''}">${range(9).map((i) => `<span>${i === 4 ? `<b>${let_}</b>` : i === pos ? '<i class="pdot"></i>' : ''}</span>`).join('')}</span>`;
      return { kind: 'steps', study: { title: 'Eyes on the centre', html: scene, ms, noSkip: true }, steps: [
        { kind: 'choice', prompt: 'Which letter was in the centre?', options: mc(rng, { label: let_, value: let_ }, LETTERS.map((c) => ({ label: c, value: c })), 4), answer: let_, cols: 4 },
        { kind: 'choice', prompt: 'Where was the dot?', options: range(9).map((i) => ({ label: i === 4 ? '•' : '', value: i, cls: 'tile cellbtn', aria: `Position ${i + 1}` })).filter((o) => o.value !== 4), answer: pos, cols: 3 }] };
    } }),
  std({ num: 52, title: 'Proofreader’s Desk', max: 12,
    how: ['A sentence lands on your desk with ONE misspelled word.', 'Tap the misspelled word.', 'Longer passages and subtler typos as you improve.'],
    makeTrial(rng, lv) {
      const s1 = rng.pick(SENT), text = lv >= 6 ? s1 + ' ' + rng.pick(SENT.filter((x) => x !== s1)) : s1, words = text.split(' ');
      const cand = range(words.length).filter((i) => words[i].replace(/[^a-z]/gi, '').length >= 5), j = rng.pick(cand), w = words[j], m = w.match(/^([A-Za-z]+)(.*)$/), core = m[1], tail = m[2];
      let bad = core;
      for (let g = 0; g < 20 && bad === core; g++) {
        const k = rng.int(1, core.length - 2), type = lv <= 4 ? rng.pick(['swap', 'double']) : rng.pick(['swap', 'drop', 'vowel']);
        if (type === 'swap') bad = core.slice(0, k) + core[k + 1] + core[k] + core.slice(k + 2);
        else if (type === 'double') bad = core.slice(0, k) + core[k] + core.slice(k);
        else if (type === 'drop') bad = core.slice(0, k) + core.slice(k + 1);
        else { const vs = 'aeiou', idx = [...core].map((c, i) => (vs.includes(c) && i > 0 ? i : -1)).filter((x) => x >= 0); if (idx.length) { const i = rng.pick(idx); bad = core.slice(0, i) + rng.pick(vs.replace(core[i], '').split('')) + core.slice(i + 1); } }
      }
      const shown = words.map((x, i) => (i === j ? bad + tail : x));
      return { kind: 'choice', prompt: 'Tap the misspelled word', options: shown.map((x, i) => ({ label: x, value: i, cls: 'word' })), answer: j, cols: 4, explain: `“${bad}” should be “${core}”.`, timeMs: Math.max(7000, 16000 - lv * 600) };
    } }),
  std({ num: 53, title: 'Feature Intersection', max: 12,
    how: ['You are asked for an object with a specific shape AND a specific pattern.', 'Many objects match only one of the two. Find the one that matches both.', 'More decoys as you improve.'],
    makeTrial(rng, lv) {
      const n = Math.min(20, 6 + lv), sh = rng.pick(SHAPES), pt = rng.pick(['solid', 'stripes', 'dots']), color = lv >= 7 ? null : rng.pick(COLORS)[0];
      const items = [{ shape: sh, pattern: pt, color: color || rng.pick(COLORS)[0] }];
      while (items.length < n) { const a = rng.chance(0.5) ? { shape: sh, pattern: rng.pick(['solid', 'stripes', 'dots', 'outline'].filter((p) => p !== pt)) } : { shape: rng.pick(SHAPES.filter((s) => s !== sh)), pattern: pt }; items.push({ ...a, color: color || rng.pick(COLORS)[0] }); }
      const order = rng.shuffle(range(n));
      return { kind: 'choice', prompt: `Find the ${pt === 'solid' ? 'solid' : pt === 'stripes' ? 'striped' : 'dotted'} ${sh}`, options: order.map((i) => ({ html: glyph(items[i]), value: i, cls: 'tile', aria: `${items[i].pattern} ${items[i].shape}` })), answer: 0, cols: n > 12 ? 5 : 4, timeMs: Math.max(4500, 12000 - lv * 500) };
    } }),
  std({ num: 54, title: 'Signal Queue', max: 12,
    how: ['Letters flash by very fast. Two of them are NUMBERS.', 'Catch both numbers and report them in order.', 'Faster streams and numbers closer together as you improve.'],
    makeTrial(rng, lv) {
      const len = Math.min(18, 10 + lv), d = rng.sample([2, 3, 4, 5, 6, 7, 8, 9], 2), p1 = rng.int(2, 5), lag = rng.int(1, Math.max(2, 7 - Math.floor(lv / 2))), p2 = Math.min(len - 2, p1 + lag);
      const s = range(len).map(() => rng.pick(LETTERS)); s[p1] = String(d[0]); s[p2] = String(d[1]);
      return { kind: 'sequence', study: { title: 'Catch the two numbers', frames: s.map((c) => ({ html: `<b class="bigletter">${c}</b>` })), ms: Math.max(110, 260 - lv * 12), noSkip: true },
        palette: [2, 3, 4, 5, 6, 7, 8, 9].map((x) => ({ label: String(x), value: x })), answer: d, prompt: 'Enter the two numbers in order', tag: lag <= 2 ? 'early' : 'late' };
    } }),
  std({ num: 55, title: 'Search Without Repeating', max: 12, practiceTrials: 1,
    how: ['A coin is hidden in one of the chests. Open chests to find it.', 'Once found, a new coin is hidden in a chest that has NOT held one before. Find a coin in every chest.', 'Avoid re-opening chests you already checked in this search, and chests that already gave you a coin.'],
    makeTrial(rng, lv) { const n = Math.min(10, 3 + Math.floor(lv / 1.3)); return { kind: 'multi', n, order: rng.shuffle(range(n)), marks: lv <= 2, items: range(n).map((i) => ({ label: String(i), value: i })), answer: [0] }; },
    async play(t, ctx) {
      const found = new Set(), status = h('div', { class: 'status' }), t0 = now(); let within = 0, between = 0, search = 0, opened = new Set();
      const chests = range(t.n).map((i) => h('button', { class: 'chest', type: 'button', 'aria-label': `Chest ${i + 1}` }));
      const draw = () => (status.textContent = `Coins found: ${found.size}/${t.n}  ·  wasted opens: ${within + between}`);
      ctx.stage.replaceChildren(h('div', { class: 'trial' }, status, h('div', { class: 'chests', style: { '--cols': t.n > 6 ? 4 : 3 } }, chests), t.marks ? h('p', { class: 'hint' }, 'Easy mode: chests that already gave a coin are marked.') : null));
      draw();
      await new Promise((done) => {
        chests.forEach((c, i) => (c.onclick = async () => {
          if (c.disabled) return; const target = t.order[search];
          if (opened.has(i) || found.has(i)) { if (found.has(i)) between++; else within++; c.classList.add('waste'); audio.bad(); setTimeout(() => c.classList.remove('waste'), 300); draw(); return; }
          opened.add(i); c.classList.add('open'); audio.tap();
          if (i === target) { found.add(i); audio.ok(found.size); c.classList.add('coin'); chests.forEach((x) => (x.disabled = true)); draw(); await ctx.sleep(650);
            chests.forEach((x, k) => { x.disabled = false; x.classList.remove('open', 'coin'); if (t.marks && found.has(k)) x.classList.add('marked'); }); search++; opened = new Set(); if (found.size === t.n) done(); }
          else { setTimeout(() => c.classList.remove('open'), 400); draw(); }
        }));
      });
      const wasted = within + between, allow = Math.max(1, Math.floor(t.n / 3));
      return { correct: wasted <= allow, rt: now() - t0, tags: { withinSearchRepeats: within, betweenSearchRepeats: between }, explain: wasted <= allow ? '' : `${wasted} wasted opens (limit ${allow}): ${within} re-opened in the same search, ${between} chests that had already paid out.` };
    },
    summary: (g, s) => `Reached level ${s.maxLevel}. Wasted opens: ${s.tags.withinSearchRepeats || 0} repeats within a search, ${s.tags.betweenSearchRepeats || 0} chests that had already paid out.` }),
  std({ num: 56, title: 'Conversation Filter', max: 12,
    how: ['Several people talk at once in a group chat.', 'Follow only the person named at the start.', 'Then answer a question about what THAT person said.'],
    makeTrial(rng, lv) {
      const k = Math.min(4, 2 + Math.floor(lv / 4)), who = rng.sample(NAMES, k), CITY = ['Lisbon', 'Oslo', 'Cairo', 'Lima', 'Hanoi', 'Quito', 'Perth', 'Riga'], hue = rng.sample(HUES, k);
      const said = who.map(() => ({ city: null, day: null, item: null })), cities = rng.sample(CITY, k), days = rng.sample(['Monday', 'Tuesday', 'Thursday', 'Friday', 'Sunday'], k), items = rng.sample(OBJECTS, k);
      const lines = []; who.forEach((w, i) => { said[i] = { city: cities[i], day: days[i], item: items[i] }; lines.push([i, `I’m flying to ${cities[i]}.`], [i, `Leaving on ${days[i]}.`], [i, `Don’t let me forget my ${items[i]}!`]); });
      const ordered = []; const queues = who.map((_, i) => lines.filter((l) => l[0] === i)); while (queues.some((q) => q.length)) { const q = rng.pick(queues.filter((x) => x.length)); ordered.push(q.shift()); }
      const f = rng.pick(['city', 'day', 'item']), Q = { city: 'Where is {w} flying?', day: 'When does {w} leave?', item: 'What must {w} not forget?' };
      return { kind: 'choice', study: { title: `Follow ${who[0]}`, frames: [{ html: `<span class="memo">Follow <b>${who[0]}</b> only</span>`, ms: 1400 }, ...ordered.map(([i, l]) => ({ html: `<span class="chat" style="--th:${hue[i]}"><b>${who[i]}</b>${l}</span>` }))], ms: Math.max(1100, 1900 - lv * 60), blank: 100 },
        prompt: Q[f].replace('{w}', who[0]), options: rng.shuffle(said.map((s) => ({ label: s[f], value: s[f] }))), answer: said[0][f], cols: 2 };
    } }),
  std({ num: 57, title: 'Target Count', max: 12,
    how: ['A board of symbols flashes briefly.', 'Count how many TARGET symbols it had.', 'Bigger boards, more distractors, shorter looks as you improve.'],
    makeTrial(rng, lv) {
      const n = Math.min(25, 9 + lv * 1.3 | 0), cnt = rng.int(2, Math.min(9, 3 + Math.floor(lv / 2))), tg = { shape: rng.pick(SHAPES), color: rng.pick(COLORS)[0] }, cells = rng.shuffle(range(n)).slice(0, cnt);
      const objs = range(n).map((i) => (cells.includes(i) ? tg : lv >= 6 && rng.chance(0.4) ? { shape: tg.shape, color: rng.pick(COLORS.filter((c) => c[0] !== tg.color))[0] } : { shape: rng.pick(SHAPES.filter((s) => s !== tg.shape)), color: rng.pick(COLORS)[0] }));
      return { kind: 'numeric', study: { title: 'Count the target', frames: [{ html: `<span class="row">${glyph(tg)}</span>`, caption: 'Target', ms: 1300 }, { html: `<span class="scene">${objs.map((o) => glyph(o)).join('')}</span>`, ms: Math.max(1500, 4500 - lv * 220) }], noSkip: true }, prompt: 'How many targets?', answer: cnt };
    } }),
  std({ num: 58, title: 'Alert or Routine', max: 12, practiceTrials: 3,
    how: ['System messages arrive. The alert rule is shown at the top.', 'Flag ALERT only when a message meets the rule exactly; otherwise ROUTINE.', 'Near-misses and extra conditions appear as you improve.'],
    makeTrial(rng, lv) {
      const lim = rng.pick([70, 75, 80, 85]), extra = lv >= 5, sys = rng.pick(['Pump A', 'Boiler 2', 'Fan 7', 'Reactor C', 'Chiller 4']);
      let temp = rng.chance(0.5) ? lim + rng.int(1, lv >= 7 ? 3 : 15) : lim - rng.int(lv >= 7 ? 0 : 1, lv >= 7 ? 3 : 15);
      const status = extra ? rng.pick(['running', 'running', 'maintenance']) : 'running';
      const alert = temp > lim && status !== 'maintenance';
      const rule = `ALERT if temperature is above ${lim}°${extra ? ' and status is not “maintenance”' : ''}`;
      return { kind: 'choice', promptHtml: `<span class="rule">${rule}</span><span class="logline"><b>${sys}</b> · ${temp}° · ${status}</span>`, prompt: '', options: [{ label: '🚨 ALERT', value: true, cls: 'no' }, { label: 'Routine', value: false, cls: 'yes' }], answer: alert, timeMs: Math.max(2500, 6000 - lv * 250), tag: alert ? 'yes' : 'no' };
    } }),
  std({ num: 59, title: 'Moving Reading Window', max: 10,
    how: ['A short passage is revealed one sentence at a time.', 'Read each part as it appears; you cannot go back.', 'Then answer a question about the passage. Faster reveals as you improve.'],
    makeTrial(rng, lv) {
      const p = rng.pick(PASS), [q, a, d] = rng.pick(p.q);
      return { kind: 'choice', study: { title: 'Read carefully', frames: p.t.map((s) => ({ html: `<span class="memo">${s}</span>` })), ms: Math.max(1800, 3600 - lv * 160), blank: 80 },
        prompt: q, options: rng.shuffle([a, ...d]).map((x) => ({ label: x, value: x })), answer: a, cols: 1 };
    } }),
  std({ num: 60, title: 'Focus Recovery', max: 12, practiceTrials: 1,
    how: ['Sort number cards into LEFT or RIGHT using the rule shown at the start.', 'Partway through you are interrupted by an unrelated question.', 'Then resume sorting with the same rule, which is no longer shown.'],
    makeTrial(rng, lv) {
      const cut = rng.pick([30, 40, 50, 60, 70]), n = Math.min(12, 5 + Math.floor(lv / 1.5)), at = rng.int(2, n - 2);
      const card_ = (v) => ({ kind: 'choice', promptHtml: `<span class="numcard">${v}</span>`, prompt: '', options: [{ label: '◀ LEFT', value: 'L' }, { label: 'RIGHT ▶', value: 'R' }], answer: v > cut ? 'L' : 'R', flashMs: 200, reveal: false });
      const vals = range(n).map(() => { let v; do { v = rng.int(5, 95); } while (v === cut); return v; });
      const steps = vals.map((v, i) => ({ ...card_(v), ...(i === 0 ? { banner: `Rule: bigger than ${cut} → LEFT, otherwise RIGHT`, bannerMs: 2600 } : {}), ...(i === at ? { banner: 'Back to sorting (same rule)', bannerMs: 1100 } : {}) }));
      const w = rng.pick(OBJECTS); steps.splice(at, 0, { kind: 'choice', banner: '⚡ Interruption!', bannerMs: 900, prompt: `How many letters in “${w}”?`, options: numOpts(rng, w.length, 4, 2), answer: w.length, tag: 'interrupt' });
      return { kind: 'steps', steps, allowed: 1 };
    } }),
];
