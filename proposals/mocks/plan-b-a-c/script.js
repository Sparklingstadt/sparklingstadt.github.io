// 表示言語の切り替え: ヒーローのタグライン（本文と lang）とボタンの aria-pressed だけを更新する。
(function () {
  var tagline = document.querySelector('.tagline');
  var buttons = document.querySelectorAll('.lang-switch button');
  if (!tagline || !buttons.length) return;

  function select(button) {
    tagline.textContent = button.dataset.tagline;
    tagline.lang = button.lang;
    buttons.forEach(function (b) {
      b.setAttribute('aria-pressed', b === button ? 'true' : 'false');
    });
  }

  buttons.forEach(function (button) {
    button.addEventListener('click', function () { select(button); });
  });
})();
