import { h } from '../engine.js';
import { choiceTrial } from '../kit.js';

export const INKS = [['RED', '#ff5a47'], ['BLUE', '#4d94ff'], ['GREEN', '#22c77f'], ['YELLOW', '#ffd84a'], ['PINK', '#ff7ac6'], ['ORANGE', '#ff9f1c']];
export const logic = {
  params(level) { return { nColors: Math.min(6, 3 + Math.floor((level - 1) / 3)), pIncong: Math.min(0.85, 0.35 + level * 0.05), timeMs: Math.max(1100, 3600 - level * 160) }; },
  makeTrial(rng, level) {
    const p = logic.params(level), set = INKS.slice(0, p.nColors);
    const word = rng.int(0, p.nColors - 1); let ink = word, incong = rng.chance(p.pIncong);
    if (incong) { do { ink = rng.int(0, p.nColors - 1); } while (ink === word); }
    return { ...p, word: set[word][0], ink: set[ink][0], inkHex: set[ink][1], incong, names: set.map((x) => x[0]) };
  },
  /** Scores the ink attribute only. */
  check: (trial, pick) => pick === trial.ink,
};

export default {
  id: 'ink-interpreter', num: 63, title: 'Ink Interpreter', min: 1, max: 16, start: 1, mode: 'both', practiceTrials: 3,
  how: ['A colour word appears, printed in coloured ink.', 'Tap the name of the INK colour, never the word itself.', 'It speeds up and adds colours. Misses and timeouts cost a strike.'],
  makeTrial: logic.makeTrial,
  async play(trial, ctx) {
    const node = h('div', { class: 'prompt inkword', style: { color: trial.inkHex } }, trial.word);
    const r = await choiceTrial(ctx, { promptNode: node, options: trial.names.map((n) => ({ label: n, value: n })), answer: trial.ink, timeMs: trial.timeMs, cols: trial.names.length <= 3 ? 3 : trial.names.length === 4 ? 2 : 3,
      hint: 'Practice: say the colour of the LETTERS, ignore what the word says.' });
    return { ...r, tags: { [trial.incong ? 'conflictTotal' : 'plainTotal']: 1, ...(r.correct ? { [trial.incong ? 'conflictRight' : 'plainRight']: 1 } : {}), ...(r.timedOut ? { omission: 1 } : {}) },
      explain: r.correct ? '' : r.timedOut ? 'Time ran out.' : `The ink was ${trial.ink}, the word said ${trial.word}.` };
  },
  summary: (g, s) => `Conflict trials right: ${s.tags.conflictRight || 0} of ${s.tags.conflictTotal || 0}. Plain trials right: ${s.tags.plainRight || 0} of ${s.tags.plainTotal || 0}. Timeouts: ${s.tags.omission || 0}.`,
};
