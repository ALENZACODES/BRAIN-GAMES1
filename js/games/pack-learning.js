// Concepts 21–40: long-term learning and retrieval.
import { std } from '../play.js';
import { store, dateKey, RNG } from '../engine.js';
import { glyph, tok, card, mc, numOpts, yesNo, toneFor, NAMES, OBJECTS, ROOMS, LANDMARKS, HOBBIES, HUES, COLORS, SHAPES, range, sum, word } from '../gfx.js';

const VOCAB = [
  ['petrichor', 'the smell of rain on dry ground', 'After the storm, the garden was full of petrichor.', 'She opened the window to breathe in the ___ after the first rain.'],
  ['apricity', 'the warmth of the sun in winter', 'We sat on the January step enjoying the apricity.', 'Even in February, the ___ on the porch felt wonderful.'],
  ['quotidian', 'ordinary, everyday', 'He found beauty in quotidian chores like folding laundry.', 'The photographer turned ___ scenes into art.'],
  ['ephemeral', 'lasting a very short time', 'The ephemeral snowfall melted by noon.', 'Social media trends are often ___.'],
  ['lacuna', 'a gap or missing part', 'There was a lacuna in the old manuscript.', 'The report had a ___ where the March data should be.'],
  ['garrulous', 'very talkative', 'The garrulous driver chatted the whole trip.', 'Our ___ neighbour can talk for an hour at the fence.'],
  ['laconic', 'using very few words', 'Her laconic reply was simply “No.”', 'The ___ captain answered every question in three words.'],
  ['obsequious', 'too eager to please', 'The obsequious waiter refilled our glasses every minute.', 'His ___ praise of the boss made everyone uneasy.'],
  ['recalcitrant', 'stubbornly uncooperative', 'The recalcitrant mule refused to cross the bridge.', 'The ___ printer jammed on every page.'],
  ['sanguine', 'hopeful and optimistic', 'She was sanguine about the team’s chances.', 'Despite the delay, the builder stayed ___ about finishing on time.'],
  ['taciturn', 'reserved and saying little', 'The taciturn farmer just nodded.', 'Usually ___, he surprised us with a long speech.'],
  ['ubiquitous', 'found everywhere', 'Phones have become ubiquitous.', 'In that town, bicycles are ___.'],
  ['verdant', 'green with growing plants', 'The verdant valley glowed after spring rains.', 'They hiked through ___ hills.'],
  ['zenith', 'the highest point', 'The sun reached its zenith at noon.', 'Winning the title was the ___ of her career.'],
  ['nadir', 'the lowest point', 'The company hit its nadir in 2009.', 'His mood reached its ___ on the rainy Monday.'],
  ['liminal', 'at a boundary or in-between stage', 'Dawn is a liminal time between night and day.', 'Airports feel like ___ spaces.'],
  ['mellifluous', 'sweet and smooth to hear', 'The singer had a mellifluous voice.', 'The narrator’s ___ tone made the audiobook relaxing.'],
  ['obfuscate', 'to make unclear on purpose', 'The memo seemed designed to obfuscate the facts.', 'Don’t ___ the answer with jargon.'],
  ['querulous', 'complaining in a whiny way', 'The querulous passenger grumbled about every bump.', 'A ___ voice asked why dinner was late again.'],
  ['soporific', 'causing sleepiness', 'The lecture was so soporific that half the room dozed.', 'Warm milk has a ___ effect on some people.'],
  ['truculent', 'eager to argue or fight', 'The truculent player argued every call.', 'The ___ goose chased visitors from the pond.'],
  ['vicissitude', 'an unwelcome change of circumstances', 'They survived the vicissitudes of the war years.', 'Farmers must cope with the ___ of the weather.'],
  ['wistful', 'longingly thoughtful', 'She gave a wistful look at the old house.', 'He felt ___ listening to songs from his childhood.'],
  ['perspicacious', 'having sharp insight', 'A perspicacious reader spotted the clue early.', 'The ___ detective noticed the muddy boots.'],
  ['insouciant', 'casually unconcerned', 'He gave an insouciant shrug at the bad news.', 'Her ___ attitude toward deadlines worried the team.'],
  ['halcyon', 'calm, happy and peaceful (of a past time)', 'They remembered the halcyon days of summer camp.', 'Grandpa spoke of the ___ years before the factory closed.'],
  ['ineffable', 'too great to be described in words', 'The view from the summit was ineffable.', 'She felt an ___ joy holding her newborn.'],
  ['serendipity', 'a happy accident', 'Finding the café was pure serendipity.', 'By ___, they met again in a foreign city.'],
  ['diffident', 'shy and lacking self-confidence', 'The diffident student rarely raised her hand.', 'Once ___, he now speaks at conferences.'],
  ['munificent', 'very generous', 'A munificent donor paid for the new library.', 'The ___ gift covered every student’s fees.'],
];
const CONCEPTS = [
  ['How a rainbow forms', ['Sunlight enters a raindrop', 'The light bends as it enters', 'It reflects off the back of the drop', 'It bends again leaving, splitting into colours']],
  ['How bread rises', ['Yeast is mixed into the dough', 'Yeast feeds on sugars', 'It releases carbon dioxide gas', 'Gas bubbles get trapped and the dough expands']],
  ['How a lock and key work', ['The key slides into the cylinder', 'Its ridges push the pins up', 'All pins line up at the shear line', 'The cylinder can now turn']],
  ['How a bill becomes law (simplified)', ['A bill is introduced', 'It is debated and amended', 'It is voted on and passed', 'It receives final approval and becomes law']],
  ['How a plant makes food', ['Roots take up water', 'Leaves take in carbon dioxide', 'Sunlight powers the reaction in the leaves', 'Sugar is made and oxygen released']],
  ['How a letter is delivered', ['It is posted in a mailbox', 'It is collected and taken to a sorting centre', 'It is sorted by postal code', 'A carrier delivers it to the address']],
  ['How a thermostat heats a room', ['The room cools below the set temperature', 'The sensor detects the drop', 'The heater switches on', 'At the set temperature the heater switches off']],
  ['How an echo happens', ['A sound is made', 'Sound waves travel through the air', 'They bounce off a hard surface', 'The reflected sound returns to your ear']],
];
const face = (i, hue) => `<svg viewBox="0 0 100 100" class="gl"><circle cx="50" cy="50" r="44" fill="hsl(${hue} 55% 42%)"/><path d="${['M20 38q30-34 60 0', 'M18 44q32-46 64 0l-6-14q-26-20-52 0z', 'M22 40h56', 'M24 34q26-22 52 0q-8-18-26-18t-26 18'][i % 4]}" fill="hsl(${(hue + 40) % 360} 60% 25%)" stroke="hsl(${(hue + 40) % 360} 60% 25%)" stroke-width="6"/><circle cx="37" cy="52" r="${4 + (i % 3)}" fill="#fff"/><circle cx="63" cy="52" r="${4 + (i % 3)}" fill="#fff"/><path d="M38 70q12 ${6 + (i % 4) * 2} 24 0" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round"/></svg>`;

const forgotKey = 'rescue:bank';
const rescueBank = () => { const r = new RNG('rescue-bank-v1'); const names = range(30).map(() => word(r, 2)); return names.map((n, i) => [n, OBJECTS[i % OBJECTS.length]]); };

export const G = [
  std({ num: 21, title: 'Name Garden', max: 12,
    how: ['Meet the garden’s characters and learn their names.', 'After a short distraction, a character reappears: pick their name.', 'More characters and longer gaps as you improve.'],
    makeTrial(rng, lv) {
      const k = Math.min(7, 2 + Math.floor(lv / 2)), names = rng.sample(NAMES, k), hues = rng.sample(HUES, k), q = rng.int(0, k - 1), a = rng.int(2, 9), b = rng.int(2, 9), off = rng.chance(0.5) ? 0 : 1;
      return { kind: 'choice', study: { title: 'Meet the gardeners', frames: names.map((n, i) => ({ html: `<span class="who">${face(i, hues[i])}<b>${n}</b></span>` })), ms: Math.max(1100, 2000 - lv * 60), blank: 150 },
        distract: { prompt: `${a} × ${b} = ${a * b + off}?`, options: yesNo('True', 'False'), answer: off === 0 },
        promptHtml: face(q, hues[q]), prompt: 'What is this character’s name?', options: mc(rng, { label: names[q], value: names[q] }, names.map((n) => ({ label: n, value: n })), Math.min(4, k)), answer: names[q], tag: lv >= 6 ? 'late' : 'early' };
    } }),
  std({ num: 22, title: 'Object–Place Museum', max: 12,
    how: ['Curators place unusual objects in the museum’s rooms.', 'Remember which room each object went to.', 'Then answer where an object belongs. More rooms and objects later.'],
    makeTrial(rng, lv) {
      const r = Math.min(6, 2 + Math.floor(lv / 3)), k = Math.min(10, 2 + lv), rooms = rng.sample(ROOMS, r), objs = rng.sample(OBJECTS, k), at = objs.map(() => rng.int(0, r - 1)), q = rng.int(0, k - 1);
      return { kind: 'choice', study: { title: 'Placing exhibits', frames: objs.map((o, i) => ({ html: `<span class="drop">${tok(o, 40)}<i>→</i>${tok(rooms[at[i]], HUES[at[i] * 2])}</span>` })), ms: Math.max(900, 1600 - lv * 50), blank: 140 },
        prompt: `Which room holds the ${objs[q]}?`, options: rooms.map((x, i) => ({ label: x, value: i })), answer: at[q], cols: 2 };
    } }),
  std({ num: 23, title: 'Story Anchors', max: 12,
    how: ['Read a short story, one event at a time.', 'Then rebuild the story by putting its events in order.', 'More events as you improve.'],
    makeTrial(rng, lv) {
      const EV = ['missed the early ferry', 'borrowed a bicycle', 'found a torn map', 'met a fisherman', 'bought warm bread', 'crossed the old bridge', 'lost a glove', 'heard a bell ringing', 'climbed the lighthouse', 'wrote a postcard', 'shared an umbrella', 'fixed a flat tyre', 'fed a stray cat', 'caught the last train'];
      const n = Math.min(8, 3 + Math.floor(lv / 2)), who = rng.pick(NAMES), ev = rng.sample(EV, n);
      return { kind: 'order', textItems: true, study: { title: `${who}’s day`, frames: ev.map((e, i) => ({ html: `<span class="memo">${i === 0 ? 'First' : i === n - 1 ? 'Finally' : 'Then'}, ${who} ${e}.</span>` })), ms: Math.max(1300, 2200 - lv * 70), blank: 150 },
        items: rng.shuffle(ev).map((e) => ({ label: e, value: e })), answer: ev, prompt: 'Tap the events in story order' };
    } }),
  std({ num: 24, title: 'Vocabulary Voyage', max: 12,
    how: ['Learn an unusual word from its meaning and an example.', 'Then meet it in a new sentence and choose what it means.', 'Later you learn several words before being tested.'],
    makeTrial(rng, lv) {
      const k = Math.min(4, 1 + Math.floor(lv / 4)), ws = rng.sample(VOCAB, k + 3), learn = ws.slice(0, k), q = rng.int(0, k - 1), w = learn[q];
      return { kind: 'choice', study: { title: 'New words', frames: learn.map(([x, m, ex]) => ({ html: `<span class="vocab"><b>${x}</b><em>${m}</em><small>“${ex}”</small></span>` })), ms: 4200, blank: 200 },
        prompt: `“${w[3].replace('___', w[0])}” — here “${w[0]}” means:`, options: mc(rng, { label: w[1], value: w[0] }, ws.filter((x) => x !== w).map((x) => ({ label: x[1], value: x[0] })), 4), answer: w[0], cols: 1 };
    } }),
  std({ num: 25, title: 'Symbol Dictionary', max: 12,
    how: ['Learn what each invented symbol means.', 'Then decode a short message written in those symbols.', 'More symbols and longer messages as you improve.'],
    makeTrial(rng, lv) {
      const MEAN = ['sun', 'river', 'stone', 'bird', 'fire', 'moon', 'tree', 'home', 'road', 'gold', 'storm', 'friend'];
      const k = Math.min(8, 3 + Math.floor(lv / 2)), means = rng.sample(MEAN, k), sh = rng.sample(SHAPES, Math.min(8, k)), cs = rng.sample(COLORS, k), L = Math.min(4, 2 + Math.floor(lv / 4));
      const g = (i) => glyph({ shape: sh[i % sh.length], color: cs[i][0], pattern: i >= sh.length ? 'stripes' : 'solid' });
      const msg = rng.sample(range(k), L), truth = msg.map((i) => means[i]).join(' · ');
      const dist = []; for (let t = 0; t < 12; t++) { const m = [...msg]; const j = rng.int(0, L - 1); m[j] = rng.pick(range(k).filter((x) => x !== msg[j])); if (t % 3 === 0 && L > 1) { const a = rng.int(0, L - 2); [m[a], m[a + 1]] = [m[a + 1], m[a]]; } dist.push({ label: m.map((i) => means[i]).join(' · '), value: m.join(',') }); }
      return { kind: 'choice', study: { title: 'Learn the symbols', html: `<span class="dict">${range(k).map((i) => `<span>${g(i)}<b>${means[i]}</b></span>`).join('')}</span>`, ms: 2500 + 1000 * k, wide: true },
        promptHtml: `<span class="row">${msg.map(g).join('')}</span>`, prompt: 'Decode the message', options: mc(rng, { label: truth, value: msg.join(',') }, dist, 4), answer: msg.join(','), cols: 1 };
    } }),
  std({ num: 26, title: 'Landmark Return', max: 12,
    how: ['Explore a small map and note where each landmark stands.', 'The landmarks disappear.', 'Tap the square where a named landmark was. Bigger maps later.'],
    makeTrial(rng, lv) {
      const n = lv <= 4 ? 4 : lv <= 8 ? 5 : 6, k = Math.min(7, 2 + Math.floor(lv / 2)), cells = rng.sample(range(n * n), k), names = rng.sample(LANDMARKS, k), q = rng.int(0, k - 1);
      const map = `<span class="mapgrid" style="--n:${n}">${range(n * n).map((i) => { const j = cells.indexOf(i); return `<span>${j >= 0 ? `<b style="--th:${HUES[j]}">${names[j]}</b>` : ''}</span>`; }).join('')}</span>`;
      return { kind: 'choice', study: { title: 'Explore the map', html: map, ms: 1800 + 1100 * k, wide: true }, distract: lv >= 5 ? { prompt: 'Which is heavier: a kilogram of feathers or a kilogram of stones?', options: [{ label: 'Feathers', value: 0 }, { label: 'Stones', value: 1 }, { label: 'Same', value: 2 }], answer: 2 } : null,
        prompt: `Where was the ${names[q]}?`, options: range(n * n).map((i) => ({ label: '', value: i, cls: 'tile cellbtn', aria: `Square ${i + 1}` })), answer: cells[q], cols: n };
    } }),
  std({ num: 27, title: 'Pair Builder', max: 12,
    how: ['Learn pairs of objects that go together (they are arbitrary).', 'Then you see one half of a pair: pick its partner.', 'More pairs, and partners that look alike.'],
    makeTrial(rng, lv) {
      const k = Math.min(8, 2 + Math.floor(lv / 1.5)), o = rng.sample(OBJECTS, 2 * k), A = o.slice(0, k), B = o.slice(k), q = rng.int(0, k - 1), rev = lv >= 5 && rng.chance(0.5);
      return { kind: 'choice', study: { title: 'Learn the pairs', frames: A.map((a, i) => ({ html: `<span class="drop">${tok(a, 210)}<i>+</i>${tok(B[i], 30)}</span>` })), ms: Math.max(1100, 1800 - lv * 50), blank: 140 },
        prompt: `Partner of the ${rev ? B[q] : A[q]}?`, options: mc(rng, { label: rev ? A[q] : B[q], value: rev ? A[q] : B[q] }, (rev ? A : B).map((x) => ({ label: x, value: x })), 4), answer: rev ? A[q] : B[q], tag: rev ? 'recall' : 'recog', cols: 2 };
    } }),
  std({ num: 28, title: 'Recipe Recall', max: 12,
    how: ['Study a fictional recipe: its ingredients, then its steps.', 'Then either select every ingredient it used, or put the steps in order.', 'Bigger recipes as you improve.'],
    makeTrial(rng, lv) {
      const ING = ['moonberries', 'saltroot', 'honey', 'barley', 'sea fennel', 'lemon peel', 'goat cheese', 'walnuts', 'thyme', 'rice', 'figs', 'ginger', 'mint', 'pepper'];
      const ST = ['Toast the grains', 'Soak overnight', 'Grind into paste', 'Simmer for ten minutes', 'Fold in the fruit', 'Rest in the cold', 'Glaze with honey', 'Bake until golden', 'Slice thinly', 'Serve warm'];
      const ni = Math.min(8, 3 + Math.floor(lv / 2)), ns = Math.min(6, 3 + Math.floor(lv / 3)), ing = rng.sample(ING, ni), st = rng.sample(ST, ns), name = word(rng, 2) + ' Cake';
      const html = `<span class="recipe"><b>${name}</b><span>${ing.map((x) => tok(x, 30)).join('')}</span><ol>${st.map((s) => `<li>${s}</li>`).join('')}</ol></span>`;
      const study = { title: 'Study the recipe', html, ms: 2500 + 700 * (ni + ns), wide: true };
      if (rng.chance(0.5)) { const items = rng.shuffle([...ing, ...rng.sample(ING.filter((x) => !ing.includes(x)), Math.min(4, 14 - ni))]).map((x) => ({ label: x, value: x }));
        return { kind: 'multi', study, items, answer: ing, prompt: 'Select every ingredient in the recipe', cols: 2, tag: 'recall' }; }
      return { kind: 'order', textItems: true, study, items: rng.shuffle(st).map((s) => ({ label: s, value: s })), answer: st, prompt: 'Put the steps in order', tag: 'apply' };
    } }),
  std({ num: 29, title: 'Yesterday’s Board', max: 12, maxTrials: 12, practiceTrials: 0,
    how: ['On your first visit you study a board of objects. That run ends there.', 'On a LATER day, you are tested: was each object on that board?', 'After a test run, your next visit gives you a fresh board to remember. Bigger boards as you improve.'],
    makeTrial(rng, lv) { const k = Math.min(14, 6 + lv); return { kind: 'choice', board: rng.sample(OBJECTS, k), probes: rng.sample(OBJECTS, OBJECTS.length), prompt: '', options: yesNo(), answer: true }; },
    async play(t, ctx) {
      const { runTrial } = await import('../play.js'); const today = dateKey(), saved = store.get('ybBoard', null);
      if (!saved || saved.date === today) {
        const board = saved ? saved.board : t.board; if (!saved) store.set('ybBoard', { date: today, board });
        await runTrial({ kind: 'choice', study: { title: saved ? 'Today’s board (already saved)' : 'Study this board. You will be tested on a later day.', html: `<span class="pack">${board.map((o, i) => tok(o, HUES[i % 9])).join('')}</span>`, ms: 5000 + 700 * board.length, wide: true },
          prompt: 'Board saved. Come back tomorrow or later to be tested on it.', options: [{ label: 'Got it', value: 1 }], answer: 1 }, ctx);
        return { correct: true, endRun: true };
      }
      const old = new Set(saved.board), useOld = ctx.rng.chance(0.5), cand = useOld ? saved.board : t.probes.filter((x) => !old.has(x)), item = ctx.rng.pick(cand);
      return runTrial({ kind: 'choice', promptHtml: tok(item, 200, 'big'), prompt: `Was this on your board from ${Math.round((Date.parse(today) - Date.parse(saved.date)) / 864e5) === 1 ? 'yesterday' : new Date(saved.date + 'T12:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}?`, options: yesNo('On the board', 'Not on it'), answer: old.has(item), tag: old.has(item) ? 'yes' : 'no' }, ctx);
    },
    onEnd(stats) { if (stats.trials > 0) store.del('ybBoard'); },
    summary: (g, s) => (s.trials ? `Delayed recognition: ${s.correct}/${s.trials} correct (on the board ${s.tags.yesRight || 0}/${s.tags.yesTotal || 0}, new items ${s.tags.noRight || 0}/${s.tags.noTotal || 0}). Your next visit gives you a fresh board.` : 'Board saved. Come back on a later day to be tested on it.') }),
  std({ num: 30, title: 'Fact Ladder', max: 12,
    how: ['Learn a few facts about an imaginary world.', 'Then answer a question that needs you to connect two of the facts.', 'More connected facts as you improve.'],
    makeTrial(rng, lv) {
      const species = rng.sample(['Zorbs', 'Pellins', 'Quaxes', 'Murrows', 'Tindles', 'Vossi'], 4), places = rng.sample(['Kel', 'Ombra', 'Tessaly', 'Varn', 'Ilium', 'Dusk Isle'], 4), stars = rng.sample(['blue', 'red', 'white', 'golden', 'green'], 4), foods = rng.sample(['ice moss', 'glass fruit', 'sand worms', 'sky kelp', 'ember seeds'], 4);
      const facts = [], k = Math.min(4, 2 + Math.floor(lv / 4));
      for (let i = 0; i < k; i++) facts.push(`${species[i]} live on ${places[i]}.`, `${places[i]} orbits a ${stars[i]} star.`, ...(lv >= 5 ? [`${species[i]} eat ${foods[i]}.`] : []));
      const q = rng.int(0, k - 1), kind = lv >= 8 && rng.chance(0.5) ? 'food' : 'star';
      const prompt = kind === 'star' ? `What colour is the star that ${species[q]} live near?` : `What do the creatures near the ${stars[q]} star eat?`;
      const ans = kind === 'star' ? stars[q] : foods[q], pool = kind === 'star' ? stars : foods;
      return { kind: 'choice', study: { title: 'Facts from the star atlas', html: `<span class="memo list">${rng.shuffle(facts).map((f) => `<span>• ${f}</span>`).join('')}</span>`, ms: 2000 + 1500 * facts.length, wide: true }, prompt, options: pool.slice(0, Math.max(k, 3)).map((x) => ({ label: x, value: x })), answer: ans, tag: 'apply' };
    } }),
  std({ num: 31, title: 'Sound Signature', max: 12,
    how: ['Each machine in the workshop makes its own sound pattern. Listen and learn them.', 'Then a sound plays: which machine was it?', 'More machines and more similar sounds as you improve. With sound off, pitch bars are shown.'],
    makeTrial(rng, lv) {
      const MACH = ['Gear Press', 'Steam Loom', 'Copper Still', 'Spring Clock', 'Bell Engine', 'Pump Drum', 'Coil Lift'];
      const k = Math.min(6, 2 + Math.floor(lv / 2)), names = rng.sample(MACH, k), len = lv >= 6 ? 4 : 3, spread = lv >= 8 ? 4 : 9, pats = [];
      while (pats.length < k) { const p = Array.from({ length: len }, () => toneFor(rng.int(0, spread))); if (!pats.some((x) => x.join() === p.join())) pats.push(p); }
      const q = rng.int(0, k - 1);
      return { kind: 'choice', study: { title: 'Learn each machine’s sound', frames: names.map((n, i) => ({ html: card(n, '♪ ♪ ♪', HUES[i * 2 % 9]), tones: pats[i], toneGap: 0.2 })), ms: 1900, blank: 250 },
        prompt: 'Which machine makes this sound?', tones: pats[q], toneGap: 0.2, options: names.map((n, i) => ({ label: n, value: i })), answer: q, cols: 2 };
    } }),
  std({ num: 32, title: 'Face–Detail Match', max: 12,
    how: ['Meet some characters: each has a name and a hobby.', 'Then you see a name: pick that person’s hobby.', 'More people and overlapping hobbies later.'],
    makeTrial(rng, lv) {
      const k = Math.min(7, 2 + Math.floor(lv / 2)), names = rng.sample(NAMES, k), hobs = rng.sample(HOBBIES, k), hues = rng.sample(HUES, k), q = rng.int(0, k - 1);
      return { kind: 'choice', study: { title: 'Meet the club', frames: names.map((n, i) => ({ html: `<span class="who">${face(i, hues[i])}<b>${n}</b><em>loves ${hobs[i]}</em></span>` })), ms: Math.max(1300, 2200 - lv * 60), blank: 150 },
        promptHtml: face(q, hues[q]), prompt: `${names[q]}’s hobby?`, options: mc(rng, { label: hobs[q], value: hobs[q] }, hobs.map((x) => ({ label: x, value: x })), 4), answer: hobs[q], cols: 2 };
    } }),
  std({ num: 33, title: 'Category Hooks', max: 12,
    how: ['Study a list of items, grouped under category labels to help you organise them.', 'The labels disappear: select every item from the list.', 'Bigger lists and trickier groupings later.'],
    makeTrial(rng, lv) {
      const CAT = { Tools: ['hammer', 'chisel', 'wrench', 'saw', 'drill', 'pliers'], Birds: ['heron', 'finch', 'owl', 'crane', 'robin', 'swift'], Spices: ['clove', 'nutmeg', 'cumin', 'saffron', 'anise', 'sumac'], Fabrics: ['linen', 'denim', 'velvet', 'tweed', 'satin', 'flannel'], Trees: ['birch', 'cedar', 'maple', 'willow', 'aspen', 'larch'] };
      const nc = Math.min(4, 2 + Math.floor(lv / 4)), per = Math.min(4, 2 + Math.floor(lv / 3)), cats = rng.sample(Object.keys(CAT), nc), picked = cats.map((c) => rng.sample(CAT[c], per));
      const all = picked.flat(), lures = rng.sample(cats.flatMap((c) => CAT[c].filter((x) => !all.includes(x))), Math.min(6, 2 + Math.floor(lv / 2)));
      return { kind: 'multi', study: { title: 'Study the groups', html: `<span class="groups">${cats.map((c, i) => `<span><b>${c}</b>${picked[i].map((x) => tok(x, HUES[i * 2])).join('')}</span>`).join('')}</span>`, ms: 2000 + 900 * all.length, wide: true },
        items: rng.shuffle([...all, ...lures]).map((x) => ({ label: x, value: x })), answer: all, prompt: 'Select every item from the list', cols: 3 };
    } }),
  std({ num: 34, title: 'Forgotten Item Rescue', max: 12, practiceTrials: 0,
    how: ['Learn which object each invented creature guards.', 'Items you miss come back again after a gap, across days, until you get them right.', 'The more you get right, the longer the gap before an item returns.'],
    makeTrial(rng, lv) { const bank = rescueBank(); return { kind: 'choice', pick: rng.int(0, bank.length - 1), prompt: '', options: [{ label: 'a', value: 0 }, { label: 'b', value: 1 }], answer: 0 }; },
    async play(t, ctx) {
      const { runTrial } = await import('../play.js'); const bank = rescueBank(), st = store.get(forgotKey, {}), now = Date.now();
      const due = Object.entries(st).filter(([, v]) => v.due <= now).sort((a, b) => b[1].miss - a[1].miss || a[1].due - b[1].due);
      const fresh = range(bank.length).filter((i) => !st[i]);
      const idx = due.length && (ctx.rng.chance(0.75) || !fresh.length) ? +due[0][0] : fresh.length ? ctx.rng.pick(fresh) : t.pick;
      const [cre, obj] = bank[idx], isNew = !st[idx];
      const others = ctx.rng.sample(bank.filter((_, i) => i !== idx).map((b) => b[1]).filter((o) => o !== obj), 3);
      const r = await runTrial({ kind: 'choice', study: isNew ? { title: 'New creature', html: `<span class="drop">${card(cre, 'creature', 290)}<i>guards</i>${tok(obj, 40)}</span>`, ms: 2600 } : null,
        prompt: `What does ${cre} guard?`, options: ctx.rng.shuffle([obj, ...others]).map((o) => ({ label: o, value: o })), answer: obj, tag: isNew ? 'early' : 'late', cols: 2 }, ctx);
      const rec = st[idx] || { miss: 0, gap: 0, due: 0 };
      if (r.correct) { rec.gap = rec.gap ? Math.min(rec.gap * 3, 7 * 864e5) : 6e5; } else { rec.miss++; rec.gap = 9e4; }
      rec.due = now + rec.gap; st[idx] = rec; store.set(forgotKey, st);
      return r;
    } }),
  std({ num: 35, title: 'Timeline Traveller', max: 12,
    how: ['Learn when events happened in an imaginary kingdom.', 'Then put the events in time order, earliest first.', 'More events and closer dates as you improve.'],
    makeTrial(rng, lv) {
      const EV = ['The Glass Bridge opens', 'Queen Ilva is crowned', 'The great flood', 'The comet festival', 'The library burns', 'The silver mine is found', 'The harbour wall is built', 'The two towns unite', 'The plague of moths', 'The first airship flies'];
      const n = Math.min(7, 3 + Math.floor(lv / 3)), ev = rng.sample(EV, n), gap = Math.max(2, 60 - lv * 5), yrs = []; let y = rng.int(300, 600);
      for (let i = 0; i < n; i++) { y += rng.int(1, gap); yrs.push(y); }
      const shown = rng.shuffle(range(n));
      return { kind: 'order', textItems: true, study: { title: 'Kingdom chronicle', frames: shown.map((i) => ({ html: `<span class="memo"><b>${yrs[i]}</b> — ${ev[i]}</span>` })), ms: Math.max(1300, 2100 - lv * 60), blank: 150 },
        items: rng.shuffle(ev).map((e) => ({ label: e, value: e })), answer: ev, prompt: 'Earliest first' };
    } }),
  std({ num: 36, title: 'Rule Recall', max: 12,
    how: ['Learn the scoring rules of an imaginary sport.', 'After a short distraction, work out the score for a play.', 'More rules and exceptions as you improve.'],
    makeTrial(rng, lv) {
      const sport = word(rng, 2) + 'ball', pts = { gold: rng.int(2, 5), silver: rng.int(1, 3) }, dbl = lv >= 4, minus = lv >= 7, cap = lv >= 10 ? rng.int(12, 18) : 0;
      const rules = [`A gold ring is worth ${pts.gold} points.`, `A silver ring is worth ${pts.silver} point${pts.silver > 1 ? 's' : ''}.`];
      if (dbl) rules.push('A ring scored from the far line counts double.'); if (minus) rules.push('Touching the net costs 2 points.'); if (cap) rules.push(`No team can score more than ${cap} in one round.`);
      const g = rng.int(0, 3), s = rng.int(0, 3), far = dbl ? rng.int(0, Math.min(1, g + s)) : 0, net = minus ? rng.int(0, 2) : 0;
      const farGold = far && g > 0; let score = g * pts.gold + s * pts.silver + (far ? (farGold ? pts.gold : pts.silver) : 0) - 2 * net; if (cap) score = Math.min(score, cap);
      const play = `${g} gold, ${s} silver${far ? `; one ${farGold ? 'gold' : 'silver'} came from the far line` : ''}${net ? `; touched the net ${net}×` : ''}.`;
      if (score < 0) score = 0;
      return { kind: 'numeric', study: { title: `Rules of ${sport}`, html: `<span class="memo list">${rules.map((r) => `<span>• ${r}</span>`).join('')}${minus ? '<span>• Scores never go below 0.</span>' : ''}</span>`, ms: 2500 + 1600 * rules.length, wide: true },
        distract: { prompt: 'Which is longer: a week or 100 hours?', options: [{ label: 'A week', value: 1 }, { label: '100 hours', value: 0 }], answer: 1 }, prompt: `Round score? ${play}`, answer: score };
    } }),
  std({ num: 37, title: 'Password Palace', max: 12,
    how: ['Each room of the palace has a made-up access code. Memorise them.', 'Then enter the code for the room asked.', 'Longer codes and more rooms later. (These codes are invented; never use real passwords here.)'],
    makeTrial(rng, lv) {
      const r = Math.min(5, 1 + Math.floor(lv / 3)), len = Math.min(7, 3 + Math.floor(lv / 3)), rooms = rng.sample(ROOMS, r), sym = 'ABCDEFGH1234'.split(''), codes = rooms.map(() => Array.from({ length: len }, () => rng.pick(sym))), q = rng.int(0, r - 1);
      return { kind: 'sequence', repeat: true, study: { title: 'Room codes', html: `<span class="memo list">${rooms.map((x, i) => `<span><b>${x}</b> · <code>${codes[i].join('')}</code></span>`).join('')}</span>`, ms: 2000 + 900 * r * len / 2, wide: true },
        palette: sym.map((c) => ({ label: c, value: c })), answer: codes[q], prompt: `Code for the ${rooms[q]}`, cols: 6 };
    } }),
  std({ num: 38, title: 'Detail Detective', max: 12,
    how: ['Study a scene full of objects.', 'It disappears. Answer a specific question about it.', 'Busier scenes and longer delays later.'],
    makeTrial(rng, lv) {
      const n = Math.min(16, 5 + lv), objs = range(n).map(() => ({ shape: rng.pick(SHAPES.slice(0, 5)), color: rng.pick(COLORS.slice(0, 5))[0] }));
      const qt = rng.pick(['color', 'shape', 'both']), tgt = rng.pick(objs);
      const cnt = objs.filter((o) => (qt === 'color' ? o.color === tgt.color : qt === 'shape' ? o.shape === tgt.shape : o.shape === tgt.shape && o.color === tgt.color)).length;
      const q = qt === 'color' ? `How many ${tgt.color} objects?` : qt === 'shape' ? `How many ${tgt.shape}s?` : `How many ${tgt.color} ${tgt.shape}s?`;
      return { kind: 'choice', study: { title: 'Study the scene', html: `<span class="scene">${objs.map((o) => glyph(o)).join('')}</span>`, ms: 2000 + 500 * n, wide: true, after: lv >= 6 ? 'Hold on…' : null, afterMs: 1500 }, prompt: q, options: numOpts(rng, cnt, 4, 2), answer: cnt };
    } }),
  std({ num: 39, title: 'Learn–Teach Cards', max: 10,
    how: ['Read how something works, step by step.', 'Then teach it back: arrange the explanation cards in the right order.', 'Later the steps are shown out of order while you learn them.'],
    makeTrial(rng, lv) {
      const [title, steps] = rng.pick(CONCEPTS), shown = lv >= 6 ? steps.map((s, i) => `${i + 1}. ${s}`) : steps;
      return { kind: 'order', textItems: true, study: { title, html: `<span class="memo list">${(lv >= 6 ? rng.shuffle(shown) : shown).map((s) => `<span>${lv >= 6 ? s : '→ ' + s}</span>`).join('')}</span>`, ms: 7000, wide: true },
        items: rng.shuffle(steps).map((s) => ({ label: s, value: s })), answer: steps, prompt: `Explain: ${title}` };
    } }),
  std({ num: 40, title: 'Memory Confidence', max: 12,
    how: ['Learn some pairs, then answer a question about one of them.', 'Before you see if you were right, say how sure you are.', 'Your results show whether your confidence matches your accuracy.'],
    makeTrial(rng, lv) {
      const k = Math.min(8, 3 + Math.floor(lv / 2)), A = rng.sample(NAMES, k), B = rng.sample(OBJECTS, k), q = rng.int(0, k - 1);
      return { kind: 'choice', confidence: true, study: { title: 'Who owns what', frames: A.map((a, i) => ({ html: `<span class="drop">${tok(a, 260)}<i>owns</i>${tok(B[i], 40)}</span>` })), ms: Math.max(900, 1500 - lv * 45), blank: 130 },
        prompt: `What does ${A[q]} own?`, options: mc(rng, { label: B[q], value: B[q] }, B.map((x) => ({ label: x, value: x })), 4), answer: B[q], cols: 2 };
    } }),
];
