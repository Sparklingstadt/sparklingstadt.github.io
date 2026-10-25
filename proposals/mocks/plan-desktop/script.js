// One markup, four looks: this script only flips attributes on <html> and a few
// text nodes. Every visual difference lives in style.css as design tokens.
(function () {
  'use strict';

  var root = document.documentElement;

  var DESIGNS = {
    macos: {
      name: 'macOS',
      diffs: ['ウインドウ: タイトルバーと3つのボタン', '奥行き: 影で重なりを示す', '選択: 小さめのセグメントコントロール', 'スイッチ: アクセントカラーのトグル', '書体: システムフォント']
    },
    hyprland: {
      name: 'Hyprland',
      diffs: ['ウインドウ: 枠線で選択中を示すタイル', '隙間: gaps_in 5 / gaps_out 10', '選択: ワークスペース風のボタン', '書体: 等幅フォント', '色: Catppuccin Mocha']
    },
    material: {
      name: 'Material 3',
      diffs: ['カード: 色の濃淡と大きな角丸', '主な操作: アイコン付きの FAB', '選択: チェック付きのチップ', 'スイッチ: つまみの大きさで状態を示す', '書体: Roboto Flex']
    },
    harmonyos: {
      name: 'HarmonyOS',
      diffs: ['カード: 角丸 20〜24px の白いカード', 'ボタン: カプセル型', '選択: 青く塗りつぶすチップ', 'スイッチ: ブランドブルーの小さなトグル', 'コード: ArkTS(TypeScript ベース)', '書体: HarmonyOS Sans']
    }
  };

  function $(sel) { return document.querySelector(sel); }
  function $$(sel) { return Array.prototype.slice.call(document.querySelectorAll(sel)); }

  // Mark the button whose data-value matches as pressed, the rest as not.
  function press(control, value) {
    $$('[data-control="' + control + '"] button').forEach(function (b) {
      b.setAttribute('aria-pressed', String(b.dataset.value === value));
    });
  }

  function setDesign(id) {
    var d = DESIGNS[id];
    if (!d) return;
    root.dataset.design = id;
    press('design', id);
    $('#viewing-as').textContent = d.name;
    var list = $('#diffs');
    list.textContent = '';
    d.diffs.forEach(function (text) {
      var li = document.createElement('li');
      li.textContent = text;
      list.appendChild(li);
    });
  }

  function setLang(code) {
    if (!$('[data-control="lang"] button[data-value="' + code + '"]')) return;
    var h1 = $('#tagline');
    h1.lang = code;
    // The tagline for each language comes from ../data.json.
    if (window.MockData) window.MockData.render(h1);
    press('lang', code);
  }

  function setFilter(kind) {
    $$('.proj').forEach(function (p) {
      p.hidden = !(kind === 'all' || p.dataset.kind === kind);
    });
    press('filter', kind);
  }

  function toggleDark() {
    var dark = root.dataset.theme !== 'dark';
    root.dataset.theme = dark ? 'dark' : 'light';
    $('#tri-dark').setAttribute('aria-checked', String(dark));
  }

  var handlers = { design: setDesign, lang: setLang, filter: setFilter };
  $$('[data-control]').forEach(function (group) {
    group.addEventListener('click', function (e) {
      var b = e.target.closest('button');
      if (b && group.contains(b)) handlers[group.dataset.control](b.dataset.value);
    });
  });
  $$('[data-action="toggle-dark"]').forEach(function (b) {
    b.addEventListener('click', toggleDark);
  });

  // Clocks (menu bar and Waybar), refreshed every 30 s.
  function tick() {
    try {
      var now = new Date();
      var mac = new Intl.DateTimeFormat('ja-JP', { month: 'numeric', day: 'numeric', weekday: 'short', hour: '2-digit', minute: '2-digit' }).format(now);
      var hypr = new Intl.DateTimeFormat('ja-JP', { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(now);
      $$('[data-clock="mac"]').forEach(function (el) { el.textContent = mac; });
      $$('[data-clock="hypr"]').forEach(function (el) { el.textContent = hypr; });
    } catch (e) { /* keep the placeholder */ }
  }
  tick();
  setInterval(tick, 30000);
})();
