// Writes the text from data.json (repository root) into each mock's HTML, so the
// static pages already hold the current copy before data.js runs (and without
// JavaScript). It fills the same hooks data.js fills at runtime:
// [data-profile], [data-profile-link] (href), [data-content], [data-content-lang],
// [data-certification] (the Japanese name, since the mocks are in Japanese).
//
//   node scripts/build-mocks.js           rewrite the HTML files
//   node scripts/build-mocks.js --check   exit 1 if any file is out of date
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

export const MOCKS_DIR = new URL('../proposals/mocks/', import.meta.url);
export const PLANS = ['plan-b', 'plan-c', 'plan-b-a-c', 'plan-hig-material3', 'plan-desktop-macos-arch', 'plan-desktop'];

const HOOKED_TAG = /<([a-zA-Z][\w-]*)(\s[^>]*?\bdata-(?:profile|profile-link|content|content-lang|certification)="[^"]*"[^>]*)>/g;
const ATTRIBUTE = /([\w-]+)="([^"]*)"/g;

const escapeText = (text) => text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
const escapeAttribute = (text) => escapeText(text).replaceAll('"', '&quot;');

export function readData() {
  return JSON.parse(readFileSync(new URL('../data.json', import.meta.url), 'utf8'));
}

// Same rules as proposals/mocks/data.js.
function resolver(data) {
  const lookup = (path) => path.split('.').reduce((value, key) => value?.[key], data.text);
  const fill = (template) => (typeof template === 'string' ? template.replaceAll('{name}', data.profile.name) : undefined);
  const profileText = {
    name: data.profile.name,
    initial: data.profile.name.charAt(0).toUpperCase(),
    github: `@${data.profile.github}`,
    email: data.profile.email,
  };
  const profileLinks = {
    github: `https://github.com/${encodeURIComponent(data.profile.github)}`,
    email: `mailto:${data.profile.email}`,
  };
  return {
    text(attributes) {
      const profile = attributes['data-profile'];
      const content = attributes['data-content'];
      const contentLang = attributes['data-content-lang'];
      const certification = attributes['data-certification'];
      let key;
      let value;
      if (profile) [key, value] = [`profile ${profile}`, profileText[profile]];
      else if (content) [key, value] = [content, fill(lookup(content))];
      else if (contentLang) [key, value] = [`${contentLang}.${attributes.lang}`, fill(lookup(`${contentLang}.${attributes.lang}`))];
      else if (certification) [key, value] = [`certification ${certification}`, data.certifications?.find((item) => item.id === certification)?.name[attributes.lang || 'ja']];
      else return undefined;
      if (value === undefined) throw new Error(`data.json has no text for "${key}"`);
      return value;
    },
    link(attributes) {
      const kind = attributes['data-profile-link'];
      if (!kind) return undefined;
      if (!profileLinks[kind]) throw new Error(`Unknown data-profile-link "${kind}"`);
      return profileLinks[kind];
    },
  };
}

// Index just past the </tag> that closes the element whose content starts at `from`.
function closingEnd(html, tag, from) {
  const pattern = new RegExp(`<(/?)${tag}(?=[\\s>/])[^>]*>`, 'gi');
  pattern.lastIndex = from;
  let depth = 1;
  for (let match; (match = pattern.exec(html));) {
    depth += match[1] ? -1 : 1;
    if (depth === 0) return { start: match.index, end: pattern.lastIndex };
  }
  throw new Error(`No closing </${tag}> after offset ${from}`);
}

export function renderMock(html, data) {
  const resolve = resolver(data);
  let out = '';
  let cursor = 0;
  HOOKED_TAG.lastIndex = 0;
  for (let match; (match = HOOKED_TAG.exec(html));) {
    const [startTag, tag, attributeText] = match;
    const attributes = Object.fromEntries([...attributeText.matchAll(ATTRIBUTE)].map(([, name, value]) => [name, value]));
    let newStartTag = startTag;
    const href = resolve.link(attributes);
    if (href !== undefined) newStartTag = newStartTag.replace(/\bhref="[^"]*"/, `href="${escapeAttribute(href)}"`);
    out += html.slice(cursor, match.index) + newStartTag;
    cursor = match.index + startTag.length;
    const text = resolve.text(attributes);
    if (text === undefined) continue; // Only the href changes; keep scanning inside.
    const close = closingEnd(html, tag, cursor);
    out += escapeText(text) + html.slice(close.start, close.end);
    cursor = close.end;
    HOOKED_TAG.lastIndex = cursor;
  }
  return out + html.slice(cursor);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const check = process.argv.includes('--check');
  const data = readData();
  const stale = [];
  for (const plan of PLANS) {
    const file = new URL(`${plan}/index.html`, MOCKS_DIR);
    const html = readFileSync(file, 'utf8');
    const rendered = renderMock(html, data);
    if (rendered === html) continue;
    stale.push(plan);
    if (!check) writeFileSync(file, rendered);
  }
  if (check && stale.length) {
    console.error(`Out of date with data.json: ${stale.join(', ')}. Run npm run build.`);
    process.exit(1);
  }
  console.log(stale.length ? `${check ? 'Stale' : 'Updated'}: ${stale.join(', ')}` : 'Mocks are up to date with data.json.');
}
