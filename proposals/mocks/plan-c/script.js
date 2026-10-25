// 案C Polyglot — language switcher, plural demo, city clocks.
(function () {
  'use strict';

  // --- language switcher ---------------------------------------------------
  // The greeting and tagline text for each language comes from ../data.json.
  var hero = document.querySelector('.hero');
  var greet = document.getElementById('greet');
  var tagline = document.getElementById('tagline');
  var chips = document.querySelectorAll('.chip');

  function setLang(code) {
    hero.setAttribute('data-lang', code);
    greet.lang = tagline.lang = code;
    if (window.MockData) {
      window.MockData.render(greet);
      window.MockData.render(tagline);
    }
    chips.forEach(function (c) {
      c.setAttribute('aria-pressed', String(c.getAttribute('data-lang') === code));
    });
  }

  chips.forEach(function (c) {
    c.addEventListener('click', function () { setLang(c.getAttribute('data-lang')); });
  });

  // --- plurals -------------------------------------------------------------
  var WORDS = {
    ru: { one: 'проект', few: 'проекта', many: 'проектов', other: 'проекта' },
    cs: { one: 'projekt', few: 'projekty', many: 'projektu', other: 'projektů' },
    en: { one: 'project', other: 'projects' }
  };
  var n = 5;

  function cat(locale) {
    try { return new Intl.PluralRules(locale).select(n); } catch (e) { return 'other'; }
  }

  function word(locale, c) {
    var w = WORDS[locale];
    return w[c] || w.other;
  }

  var rows = {};
  document.querySelectorAll('[data-row]').forEach(function (tr) {
    rows[tr.getAttribute('data-row')] = {
      text: tr.querySelector('.row-text'),
      cat: tr.querySelector('.row-cat')
    };
  });

  function setRow(key, text, c) {
    rows[key].text.textContent = text;
    rows[key].cat.textContent = c;
  }

  function renderPlural() {
    var ruCat = cat('ru'), csCat = cat('cs'), enCat = cat('en');
    document.getElementById('count').textContent = n;
    document.getElementById('code-n').textContent = n;
    document.getElementById('code-cat').textContent = ruCat;
    setRow('ja', n + ' 件のプロジェクト', cat('ja'));
    setRow('zh', n + ' 个项目', cat('zh'));
    setRow('ru', n + ' ' + word('ru', ruCat), ruCat);
    setRow('cs', n + ' ' + word('cs', csCat), csCat);
    setRow('en', n + ' ' + word('en', enCat), enCat);
    document.querySelectorAll('.preset').forEach(function (b) {
      b.setAttribute('aria-pressed', String(Number(b.getAttribute('data-n')) === n));
    });
  }

  function setN(v) { n = v; renderPlural(); }

  document.getElementById('dec').addEventListener('click', function () { setN(Math.max(0, n - 1)); });
  document.getElementById('inc').addEventListener('click', function () { setN(Math.min(999, n + 1)); });
  document.querySelectorAll('.preset').forEach(function (b) {
    b.addEventListener('click', function () { setN(Number(b.getAttribute('data-n'))); });
  });

  // --- clocks --------------------------------------------------------------
  var clocks = document.querySelectorAll('.clock');

  function renderClocks() {
    var now = new Date();
    clocks.forEach(function (el) {
      var locale = el.getAttribute('data-locale');
      var tz = el.getAttribute('data-tz');
      var time = '--:--';
      var date = '';
      try {
        time = new Intl.DateTimeFormat(locale, { timeZone: tz, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(now);
        date = new Intl.DateTimeFormat(locale, { timeZone: tz, weekday: 'long', month: 'long', day: 'numeric' }).format(now);
      } catch (e) {}
      el.querySelector('.ck-time').textContent = time;
      el.querySelector('.ck-date').textContent = date;
    });
  }

  renderPlural();
  renderClocks();
  setInterval(renderClocks, 15000);
})();
