// Concepts 1–20: working memory and short-term recall.
import { std } from '../play.js';
import { glyph, tok, card, mc, numOpts, yesNo, toneFor, NAMES, OBJECTS, DRINKS, MODS, LETTERS, HUES, COLORS, SHAPES, PATTERNS, range, sum } from '../gfx.js';

const parcel = (label, hue) => `<span class="parcel" style="--th:${hue}"><b>${label}</b></span>`;
const radio = (d) => `<span class="radio"><i></i><b>${d}</b></span>`;
const L2 = (lv, a, b) => Math.round(a + (b - a) * Math.min(1, (lv - 1) / 11));

export const G = [
  std({ num: 1, title: 'Parcel Sequence', max: 12,
    how: ['Numbered parcels arrive one at a time on the conveyor.', 'When they stop, tap the parcels in the order they arrived.', 'More parcels arrive, faster, and later there is a pause before you answer.'],
    makeTrial(rng, lv) {
      const n = Math.min(10, 2 + lv), ids = rng.sample(range(90).map((x) => x + 10), n), hues = ids.map((_, i) => HUES[(i * 2) % HUES.length]);
      const items = ids.map((id, i) => ({ html: parcel('#' + id, hues[i]), value: id, label: '#' + id }));
      return { kind: 'order', study: { title: 'Parcels arriving…', frames: items.map((it) => ({ html: it.html })), ms: Math.max(550, 1100 - lv * 45), blank: 160, after: lv >= 7 ? 'Hold the order in mind…' : null, afterMs: 1800 },
        items: rng.shuffle(items), answer: ids, prompt: 'Tap the parcels in arrival order', hint: 'Practice: tap them first-to-last.' };
    } }),
  std({ num: 2, title: 'Reverse Radio', max: 12,
    how: ['The radio reads out a string of digits (they are also shown on the dial).', 'Enter them BACKWARDS, last digit first.', 'Each level adds a digit.'],
    makeTrial(rng, lv) {
      const n = Math.min(10, 1 + lv), ds = Array.from({ length: n }, () => rng.int(0, 9));
      for (let i = 1; i < n; i++) if (ds[i] === ds[i - 1] && rng.chance(0.7)) ds[i] = (ds[i] + rng.int(1, 8)) % 10;
      return { kind: 'sequence', repeat: true, study: { title: 'Listen…', frames: ds.map((d) => ({ html: radio(d), say: d })), ms: 850, blank: 180 },
        palette: range(10).map((d) => ({ label: String((d + 1) % 10), value: (d + 1) % 10 })), answer: [...ds].reverse(), prompt: 'Enter the digits in REVERSE order', cols: 5, hint: 'Practice: if you heard 3 8, enter 8 3.' };
    } }),
  std({ num: 4, title: 'Café Orders', max: 12,
    how: ['Customers place their orders. Memorise who ordered what.', 'Then deliver: for each customer, pick their drink.', 'More customers, and later extra details like “iced” or “oat milk”.'],
    makeTrial(rng, lv) {
      const k = Math.min(7, 2 + Math.floor(lv / 2)), names = rng.sample(NAMES, k), useMod = lv >= 4;
      const menu = []; for (const d of DRINKS) { menu.push(d); if (useMod) for (const m of MODS) menu.push(`${m} ${d}`); }
      let orders = rng.sample(menu, k);
      if (lv >= 7) { const base = orders[0].split(' ').pop(); orders = orders.map((o, i) => (i % 2 ? `${rng.pick(MODS)} ${base}` : o)); orders = [...new Set(orders)]; while (orders.length < k) { const o = rng.pick(menu); if (!orders.includes(o)) orders.push(o); } }
      const extra = rng.sample(menu.filter((m) => !orders.includes(m)), Math.min(3, 1 + Math.floor(lv / 4)));
      const html = `<span class="cards">${names.map((n, i) => card(n, orders[i], HUES[i % HUES.length])).join('')}</span>`;
      const answer = {}; names.forEach((n, i) => (answer[JSON.stringify(n)] = orders[i]));
      return { kind: 'assign', study: { title: 'Take the orders', html, ms: 2200 + 1300 * k, wide: true }, prompt: 'Deliver to', left: rng.shuffle(names).map((n) => ({ label: n, value: n })),
        right: rng.shuffle([...orders, ...extra]).map((o) => ({ label: o, value: o })), answer, unique: true, cols: 2 };
    } }),
  std({ num: 5, title: 'Last Three', max: 12,
    how: ['Letters stream past one at a time. You do not know when the stream will stop.', 'When it stops, enter the last few letters in order (three at first).', 'Streams get longer and less predictable; later you keep the last four.'],
    makeTrial(rng, lv) {
      const keep = lv >= 9 ? 4 : 3, len = keep + rng.int(1, 3 + lv), pool = rng.sample(LETTERS, Math.min(8, 4 + Math.floor(lv / 2)));
      const s = Array.from({ length: len }, () => rng.pick(pool));
      return { kind: 'sequence', repeat: true, study: { title: 'Keep only the most recent…', frames: s.map((c) => ({ html: `<b class="bigletter">${c}</b>` })), ms: Math.max(450, 900 - lv * 35), blank: 120 },
        palette: [...pool].sort().map((c) => ({ label: c, value: c })), answer: s.slice(-keep), prompt: `Enter the LAST ${keep} letters, oldest first`, hint: 'Practice: keep updating a short list of the latest letters.' };
    } }),
  std({ num: 6, title: 'Colour Ledger', max: 12,
    how: ['Objects are dropped into coloured bins, one at a time.', 'Keep track of the MOST RECENT object in each bin.', 'Then, for each bin, pick its latest object. More bins and more drops as you improve.'],
    makeTrial(rng, lv) {
      const m = Math.min(5, 2 + Math.floor(lv / 3)), bins = rng.sample(COLORS, m), n = m + 1 + lv, objs = rng.sample(OBJECTS, Math.min(OBJECTS.length, n));
      const ev = []; bins.forEach((b, i) => ev.push([i, objs[i]])); for (let i = m; i < n; i++) ev.push([rng.int(0, m - 1), objs[i % objs.length]]);
      const evs = [...rng.shuffle(ev.slice(0, m)), ...ev.slice(m)], latest = {};
      evs.forEach(([b, o]) => (latest[JSON.stringify(bins[b][0])] = o));
      return { kind: 'assign', study: { title: 'Track the latest in each bin', frames: evs.map(([b, o]) => ({ html: `<span class="drop"><span class="bin" style="background:${bins[b][1]}">${bins[b][0]}</span><i>←</i>${tok(o, 210)}</span>` })), ms: Math.max(800, 1500 - lv * 50), blank: 150 },
        prompt: 'Latest object in', left: bins.map((b) => ({ html: `<span class="bin" style="background:${b[1]}">${b[0]} bin</span>`, label: `${b[0]} bin`, value: b[0] })),
        right: rng.shuffle([...new Set(evs.map((e) => e[1]))]).map((o) => ({ label: o, value: o })), answer: latest, cols: 3 };
    } }),
  std({ num: 7, title: 'Running Balance', max: 12,
    how: ['You start with 10 tokens.', 'Watch tokens being added and removed, and keep a running total in your head.', 'Then enter the final balance. More steps and bigger amounts as you improve.'],
    makeTrial(rng, lv) {
      let bal = 10; const ops = [], k = 2 + lv, mx = 2 + Math.floor(lv * 1.5);
      for (let i = 0; i < k; i++) { let d = rng.int(1, mx) * (rng.chance(0.55) || bal - mx < 1 ? 1 : -1); if (bal + d < 0) d = -d; bal += d; ops.push(d); }
      return { kind: 'numeric', study: { title: 'Start: 10 tokens', frames: ops.map((d) => ({ html: `<b class="op ${d > 0 ? 'plus' : 'minus'}">${d > 0 ? '+' : '−'}${Math.abs(d)}</b>` })), ms: Math.max(700, 1300 - lv * 45), blank: 160 },
        prompt: 'Final balance?', answer: bal, hint: 'Practice: 10, then +3 → 13, then −2 → 11…' };
    } }),
  std({ num: 8, title: 'Shape–Sound Pairs', max: 12,
    how: ['Each shape plays its own short melody. Listen and learn the pairs.', 'Then you hear a melody: tap the shape it belongs to.', 'More pairs and more similar melodies as you improve. With sound off, pitch bars are shown instead.'],
    makeTrial(rng, lv) {
      const p = Math.min(6, 2 + Math.floor(lv / 2)), shapes = rng.sample(SHAPES, p), cols = rng.sample(COLORS, p), base = lv >= 7 ? rng.int(0, 3) : 0, spread = lv >= 7 ? 4 : 9;
      const mel = []; while (mel.length < p) { const m = [toneFor(base + rng.int(0, spread)), toneFor(base + rng.int(0, spread)), toneFor(base + rng.int(0, spread))]; if (!mel.some((x) => x.join() === m.join())) mel.push(m); }
      const q = rng.int(0, p - 1);
      return { kind: 'choice', study: { title: 'Learn each shape’s melody', frames: shapes.map((s, i) => ({ html: glyph({ shape: s, color: cols[i][0] }), tones: mel[i] })), ms: 1700, blank: 250 },
        prompt: 'Which shape plays this melody?', tones: mel[q], options: shapes.map((s, i) => ({ html: glyph({ shape: s, color: cols[i][0] }), value: i, aria: s })), answer: q, cols: Math.min(3, p) };
    } }),
  std({ num: 9, title: 'Pocket Inventory', max: 12,
    how: ['Study what is in the backpack.', 'The backpack is shown again with one change: something taken out or something added.', 'Tap the item that changed. Bigger inventories later.'],
    makeTrial(rng, lv) {
      const n = Math.min(14, 3 + lv), items = rng.sample(OBJECTS, n + 1), inv = items.slice(0, n), spare = items[n], type = rng.pick(['removed', 'added']);
      const show = (arr) => `<span class="pack">${arr.map((o, i) => tok(o, HUES[(i * 3) % HUES.length])).join('')}</span>`;
      if (type === 'removed') { const gone = rng.pick(inv), after = rng.shuffle(inv.filter((x) => x !== gone));
        return { kind: 'choice', study: { title: 'Backpack contents', html: show(inv), ms: 1500 + 600 * n, wide: true }, promptHtml: show(after), prompt: 'What is MISSING now?', options: mc(rng, { label: gone, value: gone }, inv.filter((x) => x !== gone).map((o) => ({ label: o, value: o })), 4), answer: gone, tag: 'removed' }; }
      const after = rng.shuffle([...inv, spare]);
      return { kind: 'choice', study: { title: 'Backpack contents', html: show(inv), ms: 1500 + 600 * n, wide: true }, promptHtml: show(after), prompt: 'Which item is NEW?', options: mc(rng, { label: spare, value: spare }, inv.map((o) => ({ label: o, value: o })), 4), answer: spare, tag: 'added' };
    } }),
  std({ num: 10, title: 'Number–Letter Mixer', max: 12,
    how: ['A mix of numbers and letters flashes up, one at a time.', 'Put them back: numbers from smallest to largest first, then letters A to Z.', 'Longer mixes as you improve.'],
    makeTrial(rng, lv) {
      const n = Math.min(10, 2 + Math.ceil(lv * 0.75)), nd = Math.max(1, Math.round(n / 2)), digs = rng.sample(range(9).map((x) => x + 1), nd), lets = rng.sample(LETTERS.slice(0, 12), n - nd);
      const seq = rng.shuffle([...digs.map(String), ...lets]), ans = [...digs].sort((a, b) => a - b).map(String).concat([...lets].sort());
      return { kind: 'order', study: { title: 'Remember the mix', frames: seq.map((c) => ({ html: `<b class="bigletter">${c}</b>` })), ms: Math.max(650, 1100 - lv * 40), blank: 150 },
        items: rng.shuffle(seq).map((c) => ({ label: c, value: c })), answer: ans, prompt: 'Numbers ascending, then letters A→Z', hint: 'Practice: B 3 A 1 becomes 1 3 A B.' };
    } }),
  std({ num: 11, title: 'Moving Shelves', max: 12,
    how: ['Objects sit in boxes on a row of shelves. Memorise them.', 'The boxes close and swap places, one swap at a time. Follow the moves.', 'Then say which shelf now holds the object asked for.'],
    makeTrial(rng, lv) {
      const s = Math.min(6, 3 + Math.floor(lv / 4)), objs = rng.sample(OBJECTS, s), pos = range(s), swaps = [], nsw = Math.min(8, 1 + Math.floor(lv / 1.5));
      for (let i = 0; i < nsw; i++) { const [a, b] = rng.sample(range(s), 2).sort((x, y) => x - y); swaps.push([a, b]); [pos[a], pos[b]] = [pos[b], pos[a]]; }
      const lab = 'ABCDEF'.split(''), row = (fn) => `<span class="shelves">${range(s).map((i) => `<span class="shelf ${fn(i).cls || ''}"><small>${lab[i]}</small>${fn(i).body}</span>`).join('')}</span>`;
      const frames = [{ html: row((i) => ({ body: tok(objs[i], HUES[i]) })), ms: 1400 + 650 * s }];
      swaps.forEach(([a, b]) => frames.push({ html: row((i) => ({ body: '<i class="box"></i>', cls: i === a || i === b ? 'swap' : '' })), ms: Math.max(700, 1300 - lv * 40), caption: `${lab[a]} ⇄ ${lab[b]}` }));
      const q = rng.int(0, s - 1), at = pos.indexOf(q);
      return { kind: 'choice', study: { title: 'Follow the boxes', frames, blank: 120 }, prompt: `Which shelf holds the ${objs[q]} now?`, options: range(s).map((i) => ({ label: lab[i], value: i })), answer: at, cols: Math.min(s, 3) };
    } }),
  std({ num: 14, title: 'Message Relay', max: 12,
    how: ['Read a courier’s message carefully.', 'Do a quick side task.', 'Then answer a question about a detail of the message. Longer messages later.'],
    makeTrial(rng, lv) {
      const F = { name: NAMES, fruit: ['plums', 'figs', 'pears', 'limes', 'dates', 'melons'], day: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'], colour: ['red', 'blue', 'green', 'yellow', 'grey'], port: ['Brightwater', 'Kelport', 'Oldmere', 'Saltby', 'Wren Cove'] };
      const v = { name: rng.pick(F.name), qty: rng.int(3, 19), fruit: rng.pick(F.fruit), dock: rng.int(2, 12), day: rng.pick(F.day), colour: rng.pick(F.colour), port: rng.pick(F.port), time: rng.int(5, 11) };
      let msg = `${v.name} is sending ${v.qty} crates of ${v.fruit} to Dock ${v.dock} on ${v.day}.`;
      const fields = ['name', 'qty', 'fruit', 'dock', 'day'];
      if (lv >= 4) { msg += ` The crates are painted ${v.colour}.`; fields.push('colour'); }
      if (lv >= 7) { msg += ` They leave ${v.port} at ${v.time} o’clock.`; fields.push('port', 'time'); }
      const f = rng.pick(fields), Q = { name: 'Who is sending the crates?', qty: 'How many crates?', fruit: 'What fruit?', dock: 'Which dock?', day: 'Which day?', colour: 'What colour are the crates?', port: 'Where do they leave from?', time: 'At what time do they leave?' };
      const pool = f === 'qty' || f === 'dock' || f === 'time' ? numOpts(rng, v[f], 4, 3) : mc(rng, { label: v[f], value: v[f] }, F[f === 'name' ? 'name' : f].map((x) => ({ label: x, value: x })), 4);
      const a = rng.int(11, 49), b = rng.int(5, 19);
      return { kind: 'choice', study: { title: 'Incoming message', html: `<span class="memo">${msg}</span>`, ms: 2500 + 450 * fields.length + lv * 120, wide: true },
        distract: { prompt: `Is ${a} + ${b} more than 40?`, options: yesNo(), answer: a + b > 40 }, prompt: Q[f], options: pool, answer: v[f] };
    } }),
  std({ num: 15, title: 'Pattern Extension', max: 14,
    how: ['Watch a chain of glowing symbols, each with its own note.', 'Repeat the chain from the start.', 'Every level adds one more symbol, and later the tempo speeds up.'],
    makeTrial(rng, lv) {
      const syms = rng.sample(SHAPES, 5), cols = ['red', 'blue', 'green', 'yellow', 'purple'], n = 2 + lv;
      const seq = Array.from({ length: n }, () => rng.int(0, 4)), ms = lv >= 7 ? Math.max(380, 760 - (lv - 6) * 50) : 760;
      const g = (i) => glyph({ shape: syms[i], color: cols[i] });
      return { kind: 'sequence', repeat: true, study: { title: 'Watch the chain', frames: seq.map((i) => ({ html: g(i), tones: [toneFor(i * 2)] })), ms, blank: 110 },
        palette: range(5).map((i) => ({ html: g(i), value: i, tone: toneFor(i * 2), aria: syms[i] })), answer: seq, prompt: `Repeat all ${n} symbols` };
    } }),
  std({ num: 16, title: 'Seat Planner', max: 12,
    how: ['Study the seating chart around the table.', 'The names vanish. Put each guest back in their seat.', 'More guests, and later names that look alike.'],
    makeTrial(rng, lv) {
      const n = Math.min(8, 3 + Math.floor(lv / 2)), pool = lv >= 7 ? ['Mara', 'Maria', 'Mira', 'Myra', 'Nora', 'Nara', 'Lena', 'Lina', 'Tom', 'Tim'] : NAMES, guests = rng.sample(pool, n);
      const seat = (i) => { const a = (i / n) * 2 * Math.PI - Math.PI / 2; return [150 + 108 * Math.cos(a), 120 + 82 * Math.sin(a)]; };
      const svg = (named) => `<svg viewBox="0 0 300 240" class="gl table"><ellipse cx="150" cy="120" rx="80" ry="54" fill="#5b3a22" stroke="#c99b6d" stroke-width="4"/>${range(n).map((i) => { const [x, y] = seat(i); return `<circle cx="${x}" cy="${y}" r="22" fill="hsl(${HUES[i % 9]} 70% 45%)"/><text x="${x}" y="${y + 6}" text-anchor="middle" font-size="16" font-weight="800" fill="#fff">${i + 1}</text>${named ? `<text x="${x}" y="${y + (y > 120 ? 40 : -28)}" text-anchor="middle" font-size="15" font-weight="700" fill="#fff">${guests[i]}</text>` : ''}`; }).join('')}</svg>`;
      const answer = {}; guests.forEach((g, i) => (answer[JSON.stringify(g)] = i + 1));
      return { kind: 'assign', study: { title: 'Seating chart', html: svg(true), ms: 2000 + 900 * n, wide: true }, prompt: 'Seat for', left: rng.shuffle(guests).map((g) => ({ label: g, value: g, html: svg(false) })),
        right: range(n).map((i) => ({ label: 'Seat ' + (i + 1), value: i + 1 })), answer, unique: true, cols: Math.min(4, n) };
    } }),
  std({ num: 17, title: 'Memory Arithmetic', max: 12,
    how: ['A small grid of numbers appears. Memorise it.', 'The numbers hide. Answer a sum about named cells (like A1 + B2).', 'Bigger grids and harder sums as you improve.'],
    makeTrial(rng, lv) {
      const sz = lv <= 3 ? 2 : lv <= 8 ? 3 : 4, vals = range(sz * sz).map(() => rng.int(1, 9)), rowL = 'ABCD', name = (i) => `${rowL[Math.floor(i / sz)]}${(i % sz) + 1}`;
      const k = lv <= 5 ? 2 : 3, cells = rng.sample(range(sz * sz), k), op = lv >= 10 && rng.chance(0.5) ? '×' : lv >= 6 && rng.chance(0.5) ? '−' : '+';
      let ans, txt;
      if (op === '×') { ans = vals[cells[0]] * vals[cells[1]]; txt = `${name(cells[0])} × ${name(cells[1])}`; }
      else if (op === '−') { const [a, b] = vals[cells[0]] >= vals[cells[1]] ? [cells[0], cells[1]] : [cells[1], cells[0]]; ans = vals[a] - vals[b]; txt = `${name(a)} − ${name(b)}`; }
      else { ans = sum(cells.map((c) => vals[c])); txt = cells.map(name).join(' + '); }
      const grid = (show) => `<span class="mgrid" style="--n:${sz}">${range(sz * sz).map((i) => `<span><small>${name(i)}</small>${show ? `<b>${vals[i]}</b>` : ''}</span>`).join('')}</span>`;
      return { kind: 'numeric', study: { title: 'Memorise the grid', html: grid(true), ms: 1800 + 700 * sz * sz }, promptHtml: grid(false), prompt: `${txt} = ?`, answer: ans };
    } }),
  std({ num: 18, title: 'Interrupted Sequence', max: 12,
    how: ['Memorise a sequence of letters.', 'You will be interrupted by a quick side question. Answer it.', 'Then pick up where you were and enter the whole sequence.'],
    makeTrial(rng, lv) {
      const n = Math.min(9, 2 + lv), pool = rng.sample(LETTERS, Math.min(8, n + 2)), s = rng.sample(pool, Math.min(n, pool.length));
      const x = rng.int(10, 99);
      return { kind: 'sequence', study: { title: 'Memorise', frames: s.map((c) => ({ html: `<b class="bigletter">${c}</b>` })), ms: Math.max(600, 1000 - lv * 35), blank: 140 },
        distract: { prompt: `Is ${x} an even number?`, options: yesNo(), answer: x % 2 === 0 }, palette: [...pool].sort().map((c) => ({ label: c, value: c })), answer: s, prompt: 'Now enter the sequence' };
    } }),
  std({ num: 19, title: 'Direction Stack', max: 12,
    how: ['A marker starts on the star. Read each move, but do not move anything.', 'Keep its position in your head.', 'Then tap the square where it ends up. More and longer moves as you improve.'],
    makeTrial(rng, lv) {
      const n = lv <= 5 ? 5 : 7, c = Math.floor(n / 2), D = { North: [-1, 0, '↑'], East: [0, 1, '→'], South: [1, 0, '↓'], West: [0, -1, '←'] }, k = 2 + lv, ops = [];
      let r = c, q = c;
      while (ops.length < k) { const d = rng.pick(Object.keys(D)), dist = lv >= 6 ? rng.int(1, 2) : 1, nr = r + D[d][0] * dist, nq = q + D[d][1] * dist; if (nr < 0 || nq < 0 || nr >= n || nq >= n) continue; r = nr; q = nq; ops.push([d, dist]); }
      return { kind: 'choice', study: { title: 'Start at ★', frames: ops.map(([d, dist]) => ({ html: `<b class="dir">${D[d][2]} ${d}${dist > 1 ? ' ×' + dist : ''}</b>` })), ms: Math.max(800, 1400 - lv * 50), blank: 160 },
        prompt: 'Where does the marker end?', options: range(n * n).map((i) => ({ label: i === c * n + c ? '★' : '', value: i, cls: 'tile cellbtn', aria: `Row ${Math.floor(i / n) + 1} column ${(i % n) + 1}` })), answer: r * n + q, cols: n };
    } }),
  std({ num: 20, title: 'Feature Binding', max: 12,
    how: ['Study a few objects. Each has a shape, a colour and a pattern.', 'Then one object appears: was that EXACT combination shown?', 'Traps reuse real features in new combinations.'],
    makeTrial(rng, lv) {
      const k = Math.min(6, 2 + Math.floor(lv / 2)), objs = [];
      while (objs.length < k) { const o = { shape: rng.pick(SHAPES.slice(0, 6)), color: rng.pick(COLORS.slice(0, 6))[0], pattern: rng.pick(PATTERNS.slice(0, 3)) }; if (!objs.some((x) => x.shape === o.shape || (x.color === o.color && x.pattern === o.pattern))) objs.push(o); }
      const old = rng.chance(0.5); let probe;
      if (old) probe = rng.pick(objs);
      else { for (let g = 0; g < 50; g++) { const [a, b] = rng.sample(objs, 2); probe = { shape: a.shape, color: b.color, pattern: rng.pick([a.pattern, b.pattern]) }; if (!objs.some((x) => x.shape === probe.shape && x.color === probe.color && x.pattern === probe.pattern)) break; } }
      return { kind: 'choice', study: { title: 'Study these objects', html: `<span class="row">${objs.map((o) => glyph(o)).join('')}</span>`, ms: 1500 + 900 * k, wide: true },
        promptHtml: glyph(probe), prompt: 'Was this exact object shown?', options: yesNo('Seen', 'New'), answer: old, tag: old ? 'yes' : 'no' };
    } }),
];
