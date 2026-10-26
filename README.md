# Sparklingstadt

The portfolio has moved to **https://sparklingstadt.github.io/portfolio/** ([Sparklingstadt/portfolio](https://github.com/Sparklingstadt/portfolio), built with Astro).

This repository now only redirects the old URLs, served by GitHub Pages from the root of `main`:

| Old URL | New URL |
| --- | --- |
| `/` | `/portfolio/` (Japanese), `/portfolio/en/`, or `/portfolio/zh/` |
| `/proposals/mocks/` and `/proposals/mocks/<plan>/` | the same path under `/portfolio/` |
| anything else (`404.html`) | the same path under `/portfolio/` |

The root picks the language the old site would have shown: the language saved by its selector (the new site shares this origin, so the same `localStorage`), then the browser language, then Japanese. Every page keeps the `#fragment`, sets `noindex` and a canonical link to the new URL, and falls back to `<meta http-equiv="refresh">` and a plain link without JavaScript.

The previous static site (i18next, `data.json`, and the build scripts) remains in the Git history up to #8.
