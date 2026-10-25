// 表示言語の切り替え: ヒーローのタグラインの lang とボタンの aria-pressed を更新する。
// 各言語の文言は ../data.json から ../data.js が入れる。
(function () {
  var tagline = document.querySelector('.tagline');
  var buttons = document.querySelectorAll('.lang-switch button');
  if (!tagline || !buttons.length) return;

  function select(button) {
    tagline.lang = button.lang;
    if (window.MockData) window.MockData.render(tagline);
    buttons.forEach(function (b) {
      b.setAttribute('aria-pressed', b === button ? 'true' : 'false');
    });
  }

  buttons.forEach(function (button) {
    button.addEventListener('click', function () { select(button); });
  });
})();
