import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { INDEX, readData, renderCertifications, renderIndex, validateCertifications, validateProjects } from '../scripts/build-index.js';

const data = readData();

test('index.html projects and certifications match data.json (run npm run build after editing it)', () => {
  const html = readFileSync(INDEX, 'utf8');
  assert.equal(renderIndex(html, data), html);
});

test('every project and certification in data.json is complete in en, ja and zh', () => {
  assert.ok(data.projects.length > 0);
  assert.doesNotThrow(() => validateProjects(data.projects));
  assert.ok(data.certifications.length > 0);
  assert.doesNotThrow(() => validateCertifications(data.certifications));
});

test('validateProjects reports what is missing', () => {
  const project = {
    id: 'demo', name: 'Demo', stack: ['Go'],
    category: { en: 'Tool', ja: 'ツール', zh: '工具' },
    description: { en: 'A demo.', ja: 'デモ。', zh: '' },
    links: { app: 'https://example.com', source: 'https://example.com/src' },
  };
  assert.throws(() => validateProjects([project]), /description\.zh/);
  assert.throws(() => validateProjects([{ ...project, description: { en: 'a', ja: 'b', zh: 'c' }, links: { app: 'http://x', source: 'https://y' } }]), /links\.app/);
});

test('certifications render in order and must be complete', () => {
  const list = [
    { id: 'a', name: { en: 'A <1>', ja: 'エー', zh: '甲' } },
    { id: 'b', name: { en: 'B', ja: 'ビー', zh: '乙' } },
  ];
  assert.equal(renderCertifications(list), [
    '        <ul class="certifications">',
    '          <li><span data-certification="a">A &lt;1&gt;</span></li>',
    '          <li><span data-certification="b">B</span></li>',
    '        </ul>',
    '',
  ].join('\n'));
  assert.throws(() => validateCertifications([{ id: 'a', name: { en: 'A', ja: 'エー' } }]), /name\.zh/);
  assert.throws(() => validateCertifications([list[0], list[0]]), /duplicate id/);
});
