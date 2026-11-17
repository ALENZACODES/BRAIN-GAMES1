
// Per-app settings. brain-games-logic only changes this file, the games list and the catalogue range.
export const CONFIG = {
  key: 'bg1', brand: 'PRISMIND', brandName: 'Prismind', sub: 'Memory & Focus', appId: 'memory-focus',
  range: [1, 100], hue: 265, repo: 'brain-games-memory',
  music: ["calm-lifewave", "snowfall", "balance"],
  sibling: { sub: 'Logic & Reasoning', url: 'https://alenzacodes.github.io/brain-games-logic/' },
  operator: 'ALENZA CODES',
  contact: '', // public contact email for the Privacy Policy and Terms; leave '' until it exists
  analytics: { posthogKey: '', host: 'https://us.i.posthog.com' }, // paste the PostHog project API key here to start collecting stats
};
