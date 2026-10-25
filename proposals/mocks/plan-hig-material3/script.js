// Only flips data attributes and ARIA state; style.css does the re-skinning.
(() => {
  'use strict';

  const root = document.documentElement;

  const SYSTEM_NAMES = { hig: 'HIG', material: 'Material 3' };

  const DIFFS = {
    hig: ['書体: システムフォント', '主な操作: 文脈に置く角丸ボタン', '選択: セグメントコントロール', 'スイッチ: 緑のトラック', '階層: 白いカード・区切り線・すりガラス'],
    material: ['書体: Roboto Flex', '主な操作: アイコン付きの FAB', '選択: チェック付きのチップ', 'スイッチ: つまみの大きさで状態を示す', '階層: 下地の色の濃淡と大きな角丸']
  };

  const actions = {
    design(value) {
      root.dataset.design = value;
      document.getElementById('sys-name').textContent = SYSTEM_NAMES[value];
      document.getElementById('diffs').replaceChildren(...DIFFS[value].map((text) => {
        const li = document.createElement('li');
        li.textContent = text;
        return li;
      }));
    },
    lang(value) {
      const tagline = document.getElementById('tagline');
      tagline.lang = value;
      window.MockData?.render(tagline); // Text per language comes from ../data.json.
    },
    filter(value) {
      for (const card of document.querySelectorAll('.project[data-kind]')) {
        card.hidden = value !== 'all' && card.dataset.kind !== value;
      }
    }
  };

  // Segmented controls / chips: one delegated handler for all three groups.
  document.addEventListener('click', (event) => {
    const button = event.target.closest('[data-control] button[data-value]');
    if (!button) return;
    const group = button.closest('[data-control]');
    const value = button.dataset.value;
    for (const b of group.querySelectorAll('button[data-value]')) {
      b.setAttribute('aria-pressed', String(b === button));
    }
    actions[group.dataset.control](value);
  });

  const darkSwitch = document.getElementById('sw-dark');
  darkSwitch.addEventListener('click', () => {
    const dark = darkSwitch.getAttribute('aria-checked') !== 'true';
    darkSwitch.setAttribute('aria-checked', String(dark));
    root.dataset.theme = dark ? 'dark' : 'light';
  });
})();
