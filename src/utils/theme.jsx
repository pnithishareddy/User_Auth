const KEY = 'theme';
const mq = window.matchMedia('(prefers-color-scheme: dark)');

export const getTheme = () => {
  try { return localStorage.getItem(KEY) || 'light'; } catch { return 'light'; }
};

export const applyTheme = (mode) => {
  const dark = mode === 'dark' || (mode === 'system' && mq.matches);
  document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
};

export const setTheme = (mode) => {
  try { localStorage.setItem(KEY, mode); } catch { /* storage unavailable */ }
  applyTheme(mode);
};

export const initTheme = () => {
  applyTheme(getTheme());
  mq.addEventListener('change', () => {
    if (getTheme() === 'system') applyTheme('system');
  });
};