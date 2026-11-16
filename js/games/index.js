// Live games. Everything else in the catalogue shows as "in development".
export const LIVE = {
  'window-watch': () => import('./window-watch.js'),
  'echo-grid': () => import('./echo-grid.js'),
  'two-back-orchard': () => import('./two-back-orchard.js'),
  'ink-interpreter': () => import('./ink-interpreter.js'),
  'one-different': () => import('./one-different.js'),
  'rapid-equation-check': () => import('./rapid-equation-check.js'),
};
