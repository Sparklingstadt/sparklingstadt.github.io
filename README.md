# Sparklingstadt

Personal portfolio: **https://sparklingstadt.github.io/**

HTML and CSS with [i18next](https://www.i18next.com/) installed through npm. The interface supports Japanese, English, and Simplified Chinese, including navigation, project descriptions, metadata, and accessible labels. Project and technology names remain unchanged.

## Development

```sh
npm ci
npm test
npm run build
python3 -m http.server 8000
```

Visit http://localhost:8000. Edit `index.html` for structure, `style.css` for appearance, and `src/main.js` for behavior. Translations live in `src/locales/{ja,en,zh}.json`; keep translation keys identical across languages. `data-i18n` binds text and `data-i18n-aria` binds accessible labels. Translation values are inserted as text, not HTML.

Run `npm run build` after changing JavaScript or translations. esbuild bundles i18next and all translations into the committed `script.js`, so visitors do not depend on a translation CDN or extra language requests. Google Fonts is optional; system fonts are used when unavailable.

## Language and theme

The language selector switches text immediately without navigation. The saved language takes priority, followed by the first supported browser language, with Japanese as the fallback. Chinese variants use Simplified Chinese (`zh-Hans`). Language and theme preferences are stored locally when browser storage is available. With JavaScript disabled, the original English content and all project links remain available.

## Deployment

GitHub Pages serves the root of `main`. Commit the rebuilt `script.js` together with source changes. Pushes publish automatically; `.nojekyll` disables Jekyll processing.

The site features public projects from [Sparklingstadt on GitHub](https://github.com/Sparklingstadt). Artwork is decorative CSS typography, not application screenshots. No analytics or tracking scripts are included.
