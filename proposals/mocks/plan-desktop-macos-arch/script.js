// Desktop mock: switches <html data-desktop> between "macos" and "hyprland"
// and keeps the menu bar / Waybar clocks current. All styling lives in style.css.
(function () {
  'use strict';

  var root = document.documentElement;

  var DIFFS = {
    macos: [
      'ウインドウ: タイトルバーと3つのボタン',
      '配置: 影で重なりを示し、余白を広く',
      '書体: システムフォント',
      '色: 明るい壁紙と白いウインドウ'
    ],
    hyprland: [
      'ウインドウ: タイトルバーなし、枠線で選択中を示す',
      '配置: 隙間 10px のタイル',
      '書体: 等幅フォント',
      '色: Catppuccin Mocha'
    ]
  };

  var buttons = document.querySelectorAll('.seg__btn[data-mode]');
  var chips = document.querySelectorAll('.diffs__chip');

  function setMode(mode) {
    root.setAttribute('data-desktop', mode);
    buttons.forEach(function (btn) {
      btn.setAttribute('aria-pressed', btn.dataset.mode === mode ? 'true' : 'false');
    });
    DIFFS[mode].forEach(function (text, i) {
      if (chips[i]) chips[i].textContent = text;
    });
  }

  buttons.forEach(function (btn) {
    btn.addEventListener('click', function () { setMode(btn.dataset.mode); });
  });

  // Clocks
  var clocks = {
    macos: document.querySelector('[data-clock="macos"]'),
    hyprland: document.querySelector('[data-clock="hyprland"]')
  };

  function tick() {
    var now = new Date();
    try {
      clocks.macos.textContent = new Intl.DateTimeFormat('ja-JP', {
        month: 'numeric', day: 'numeric', weekday: 'short', hour: '2-digit', minute: '2-digit'
      }).format(now);
      clocks.hyprland.textContent = new Intl.DateTimeFormat('ja-JP', {
        hour: '2-digit', minute: '2-digit', hourCycle: 'h23'
      }).format(now);
    } catch (e) {
      // Keep the placeholder if Intl is unavailable.
    }
  }

  tick();
  setInterval(tick, 30000);
})();
