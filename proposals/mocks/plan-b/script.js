'use strict';

const root = document.documentElement;

// Switches: flip aria-checked and the matching data attribute on <html>.
for (const sw of document.querySelectorAll('.switch[role="switch"]')) {
  sw.addEventListener('click', () => {
    const on = sw.getAttribute('aria-checked') !== 'true';
    sw.setAttribute('aria-checked', String(on));
    root.dataset[sw.dataset.attr] = on ? sw.dataset.on : sw.dataset.off;
  });
}

// Project filter: press one segment, hide projects of other kinds.
const segments = document.querySelectorAll('.segment[data-filter]');
const projects = document.querySelectorAll('.project[data-kind]');

for (const seg of segments) {
  seg.addEventListener('click', () => {
    const filter = seg.dataset.filter;
    for (const s of segments) {
      s.setAttribute('aria-pressed', String(s === seg));
    }
    for (const p of projects) {
      p.hidden = filter !== 'all' && p.dataset.kind !== filter;
    }
  });
}
