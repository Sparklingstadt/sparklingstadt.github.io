import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { INDEX, readData, renderIndex, validateProjects } from '../scripts/build-projects.js';

const data = readData();

test('index.html projects match data.json (run npm run build after editing it)', () => {
  const html = readFileSync(INDEX, 'utf8');
  assert.equal(renderIndex(html, data), html);
});

test('every project in data.json is complete in en, ja and zh', () => {
  assert.ok(data.projects.length > 0);
  assert.doesNotThrow(() => validateProjects(data.projects));
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
