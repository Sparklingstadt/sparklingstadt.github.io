(() => {
  const root = document.documentElement;
  const toggle = document.querySelector('.theme-toggle');
  const preference = window.matchMedia('(prefers-color-scheme: dark)');
  let saved;
  try { saved = localStorage.getItem('color-theme'); } catch {}
  if (saved === 'light' || saved === 'dark') root.dataset.theme = saved;
  const isDark = () => root.dataset.theme ? root.dataset.theme === 'dark' : preference.matches;
  const update = () => {
    toggle.setAttribute('aria-label', `Switch to ${isDark() ? 'light' : 'dark'} theme`);
    document.querySelector('meta[name="theme-color"]').content = isDark() ? '#191f1c' : '#f5f3ed';
  };
  toggle.hidden = false;
  toggle.addEventListener('click', () => {
    root.dataset.theme = isDark() ? 'light' : 'dark';
    try { localStorage.setItem('color-theme', root.dataset.theme); } catch {}
    update();
  });
  preference.addEventListener('change', update);
  update();
})();
