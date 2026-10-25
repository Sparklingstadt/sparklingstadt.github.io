# Sparklingstadt

Personal portfolio: **https://sparklingstadt.github.io/**

The site is written as a "Living Standard": a specification-style document with numbered sections, a table of contents, RFC 2119 requirements, an IDL block, notes, examples, and references.

HTML and CSS with [i18next](https://www.i18next.com/) installed through npm. The interface supports Japanese, English, and Simplified Chinese, including navigation, project descriptions, metadata, and accessible labels. Project and technology names remain unchanged.

## Development

```sh
npm ci
npm test
npm run build
python3 -m http.server 8000
```

Visit http://localhost:8000. Edit `index.html` for structure, `style.css` for appearance, and `src/main.js` for behavior. Translations live in `src/locales/{ja,en,zh}.json`; keep translation keys identical across languages. `data-i18n` binds text and `data-i18n-aria` binds accessible labels. Translation values are inserted as text, not HTML.

Projects (§5) come from the `projects` list in `data.json`: id, name, `category` and `description` in `en`/`ja`/`zh`, `stack`, and `links` (`app`, `source`, optional `sourcePrivate`). `scripts/build-index.js` writes the articles between the `projects:start` / `projects:end` markers in `index.html` with the English text, and `src/main.js` swaps in the selected language from the same data (esbuild bundles only the `projects` part of `data.json`). Certifications (§8) work the same way from the `certifications` list (`id` and `name` in `en`/`ja`/`zh`), written between the `certifications:start` / `certifications:end` markers. To add or edit a project or certification, change `data.json` and run `npm run build`; `npm test` fails if a project or certification is missing a language or a link, or if `index.html` is out of date.

Run `npm run build` after changing JavaScript, translations, or `data.json`. esbuild bundles i18next and all translations into the committed `script.js`, so visitors do not depend on a translation CDN or extra language requests. Google Fonts is optional; system fonts are used when unavailable.

## Language and theme

The language selector switches text immediately without navigation. The saved language takes priority, followed by the first supported browser language, with Japanese as the fallback. Chinese variants use Simplified Chinese (`zh-Hans`). The "Last Updated" date is formatted for the selected language with `Intl.DateTimeFormat`; update its `datetime` attribute in `index.html` when the content changes. The theme follows `prefers-color-scheme` until the visitor picks one with the toggle. Language and theme preferences are stored locally when browser storage is available. With JavaScript disabled, the original English content and all project links remain available.

## Deployment

GitHub Pages serves the root of `main`. Commit the rebuilt `script.js` together with source changes. Pushes publish automatically; `.nojekyll` disables Jekyll processing.

The site features public projects from [Sparklingstadt on GitHub](https://github.com/Sparklingstadt). No analytics or tracking scripts are included.

## Design proposals

`proposals/mocks/<plan>/` holds standalone design mocks for the portfolio (plain HTML, CSS, and JavaScript; no build step). Each page sets `noindex`. The list page `proposals/mocks/` is linked from §10 of the main page and reuses `style.css`. All six mocks load the root `data.json` through `proposals/mocks/data.js`. `profile` holds the name, GitHub account, and email; `text` holds every piece of copy that two or more mocks share (greetings and taglines in five languages, section labels, project placeholders, notes, the Rice story, and so on). Elements opt in with `data-profile`, `data-profile-link`, `data-certification="id"` (the Japanese name from `certifications`), `data-content="group.key"`, or `data-content-lang="group"` (which picks the entry for the element's `lang`, so language switchers only change `lang` and call `MockData.render()`). Edit the JSON, then run `npm run build`: `scripts/build-mocks.js` writes the same text into each mock's HTML, so the pages read correctly before `data.js` runs and without JavaScript. `npm test` fails if any mock HTML is out of date with `data.json`. Open a mock at `https://sparklingstadt.github.io/proposals/mocks/<plan>/`:

- `plan-b`: Apple HIG style
- `plan-c`: multilingual (Intl.PluralRules and Intl.DateTimeFormat demos)
- `plan-b-a-c`: HIG layout, spec-style type card, and multilingual hero
- `plan-hig-material3`: one markup switched between HIG and Material 3 with design tokens
- `plan-desktop-macos-arch`: desktop of windows switched between macOS and Arch Linux + Hyprland
- `plan-desktop`: macOS, Arch Linux + Hyprland, Material 3, and HarmonyOS
