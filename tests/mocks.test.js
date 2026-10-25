import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { MOCKS_DIR, PLANS, readData, renderMock } from '../scripts/build-mocks.js';

const data = readData();

test('every mock HTML matches the text in data.json (run npm run build after editing it)', () => {
  for (const plan of PLANS) {
    const html = readFileSync(new URL(`${plan}/index.html`, MOCKS_DIR), 'utf8');
    assert.equal(renderMock(html, data), html, `${plan}/index.html is out of date`);
  }
});

test('renderMock fills each hook type from data.json', () => {
  const sample = {
    profile: { name: 'someone', github: 'gh-user', email: 'a@example.com' },
    text: { label: { contact: 'Contact <me>' }, intro: { web: 'I am {name}.' }, tagline: { ja: 'こんにちは', ru: 'Привет' } },
  };
  const html = [
    '<span data-profile="name">old</span>',
    '<a href="#x" data-profile-link="github">GitHub <span data-profile="github">@old</span></a>',
    '<h2 data-content="label.contact">old</h2>',
    '<p data-content="intro.web">I am <span data-profile="name">old</span>.</p>',
    '<h1 lang="ru" data-content-lang="tagline">old</h1>',
  ].join('');
  assert.equal(renderMock(html, sample), [
    '<span data-profile="name">someone</span>',
    '<a href="https://github.com/gh-user" data-profile-link="github">GitHub <span data-profile="github">@gh-user</span></a>',
    '<h2 data-content="label.contact">Contact &lt;me&gt;</h2>',
    '<p data-content="intro.web">I am someone.</p>',
    '<h1 lang="ru" data-content-lang="tagline">Привет</h1>',
  ].join(''));
  assert.throws(() => renderMock('<b data-content="label.missing">x</b>', sample), /label\.missing/);
});

test('renderMock fills certification names in Japanese unless the element sets lang', () => {
  const sample = {
    profile: { name: 'someone', github: 'gh', email: 'a@example.com' },
    certifications: [{ id: 'hsk1', name: { en: 'HSK Level 1', ja: '漢語水平考試一級', zh: '汉语水平考试一级' } }],
    text: {},
  };
  assert.equal(renderMock('<li data-certification="hsk1">old</li>', sample), '<li data-certification="hsk1">漢語水平考試一級</li>');
  assert.equal(renderMock('<li lang="zh" data-certification="hsk1">old</li>', sample), '<li lang="zh" data-certification="hsk1">汉语水平考试一级</li>');
  assert.throws(() => renderMock('<li data-certification="nope">old</li>', sample), /certification nope/);
});
