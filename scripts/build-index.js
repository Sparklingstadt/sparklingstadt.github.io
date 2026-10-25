// Writes the generated parts of index.html from data.json:
// - §5 project articles, from "projects";
// - §8 certification list, from "certifications".
// The HTML gets the English text as the no-JavaScript fallback; src/main.js
// swaps in the visitor's language from the same data at runtime.
//
//   node scripts/build-index.js           rewrite index.html
//   node scripts/build-index.js --check   exit 1 if index.html is out of date
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

export const INDEX = new URL('../index.html', import.meta.url);
export const LANGUAGES = ['en', 'ja', 'zh'];

const escapeText = (text) => text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
const escapeAttribute = (text) => escapeText(text).replaceAll('"', '&quot;');

export function readData() {
  return JSON.parse(readFileSync(new URL('../data.json', import.meta.url), 'utf8'));
}

function readEnglishLabels() {
  return JSON.parse(readFileSync(new URL('../src/locales/en.json', import.meta.url), 'utf8'));
}

function checkId(item, ids, where) {
  if (!/^[a-z0-9][a-z0-9-]*$/.test(item.id ?? '')) throw new Error(`${where}: id must be lowercase letters, digits and hyphens`);
  if (ids.has(item.id)) throw new Error(`${where}: duplicate id`);
  ids.add(item.id);
}

function checkTranslations(item, field, where) {
  for (const language of LANGUAGES) {
    if (!item[field]?.[language]?.trim()) throw new Error(`${where}: missing ${field}.${language}`);
  }
}

// Throws with a readable message when a project entry is incomplete.
export function validateProjects(projects) {
  const ids = new Set();
  for (const project of projects) {
    const where = `data.json project "${project.id}"`;
    checkId(project, ids, where);
    if (!project.name) throw new Error(`${where}: missing name`);
    for (const field of ['category', 'description']) checkTranslations(project, field, where);
    if (!Array.isArray(project.stack) || project.stack.length === 0) throw new Error(`${where}: stack must be a non-empty list`);
    for (const link of ['app', 'source']) {
      if (!/^https:\/\//.test(project.links?.[link] ?? '')) throw new Error(`${where}: links.${link} must be an https URL`);
    }
  }
}

// Throws with a readable message when a certification entry is incomplete.
export function validateCertifications(certifications) {
  const ids = new Set();
  for (const certification of certifications) {
    const where = `data.json certification "${certification.id}"`;
    checkId(certification, ids, where);
    checkTranslations(certification, 'name', where);
  }
}

export function renderProjects(projects, labels) {
  validateProjects(projects);
  const label = (key) => `<span data-i18n="${key}">${escapeText(labels[key])}</span>`;
  const field = (project, name) =>
    `<span data-project="${escapeAttribute(project.id)}" data-project-field="${name}">${escapeText(project[name].en)}</span>`;
  return projects.map((project, index) => {
    const id = escapeAttribute(project.id);
    const sourceLabel = project.links.sourcePrivate ? 'links.privateSource' : 'links.source';
    return [
      `        <article class="project" aria-labelledby="${id}">`,
      `          <h3 id="${id}"><span class="secno">§5.${index + 1}</span> ${escapeText(project.name)}</h3>`,
      `          <p>${field(project, 'description')}</p>`,
      '          <dl class="facts">',
      `            <dt>${label('project.category')}</dt><dd>${field(project, 'category')}</dd>`,
      `            <dt>${label('project.stack')}</dt><dd class="mono">${escapeText(project.stack.join(' · '))}</dd>`,
      `            <dt>${label('project.links')}</dt><dd><a href="${escapeAttribute(project.links.app)}">${label('links.visit')}</a> · <a href="${escapeAttribute(project.links.source)}">${label(sourceLabel)}</a></dd>`,
      '          </dl>',
      '        </article>',
      '',
    ].join('\n');
  }).join('\n');
}

export function renderCertifications(certifications) {
  validateCertifications(certifications);
  const items = certifications.map((certification) =>
    `          <li><span data-certification="${escapeAttribute(certification.id)}">${escapeText(certification.name.en)}</span></li>`);
  return ['        <ul class="certifications">', ...items, '        </ul>', ''].join('\n');
}

function replaceBlock(html, name, content) {
  const start = `        <!-- ${name}:start: generated from data.json by npm run build -->\n`;
  const end = `        <!-- ${name}:end -->\n`;
  const from = html.indexOf(start);
  const to = html.indexOf(end);
  if (from === -1 || to === -1 || to < from) throw new Error(`index.html is missing the ${name}:start / ${name}:end markers`);
  return html.slice(0, from + start.length) + content + html.slice(to);
}

export function renderIndex(html, data, labels = readEnglishLabels()) {
  const withProjects = replaceBlock(html, 'projects', renderProjects(data.projects, labels));
  return replaceBlock(withProjects, 'certifications', renderCertifications(data.certifications));
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const check = process.argv.includes('--check');
  const html = readFileSync(INDEX, 'utf8');
  const rendered = renderIndex(html, readData());
  if (rendered === html) {
    console.log('index.html is up to date with data.json.');
  } else if (check) {
    console.error('index.html is out of date with data.json. Run npm run build.');
    process.exit(1);
  } else {
    writeFileSync(INDEX, rendered);
    console.log('Updated: index.html projects and certifications');
  }
}
