import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import i18next from 'i18next';
const resources = Object.fromEntries(['en', 'ja', 'zh'].map(language => [language, { translation: JSON.parse(readFileSync(new URL(`../src/locales/${language}.json`, import.meta.url))) }]));
const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');

test('all UI and metadata keys have nonempty translations in every language', () => {
  const expected = Object.keys(resources.en.translation).sort();
  for (const { translation } of Object.values(resources)) {
    assert.deepEqual(Object.keys(translation).sort(), expected);
    for (const value of Object.values(translation)) assert.ok(typeof value === 'string' && value.trim());
    for (const [, key] of html.matchAll(/data-i18n(?:-aria)?="([^"]+)"/g)) assert.ok(translation[key], key);
  }
});

test('i18next changes languages and falls back to Japanese for missing resources', async () => {
  const instance = i18next.createInstance();
  await instance.init({ resources, lng: 'en', fallbackLng: 'ja', keySeparator: false });
  for (const language of ['en', 'ja', 'zh']) {
    await instance.changeLanguage(language);
    assert.equal(instance.t('zhuelog.description'), resources[language].translation['zhuelog.description']);
    assert.equal(instance.t('theme.dark'), resources[language].translation['theme.dark']);
  }
  await instance.changeLanguage('fr');
  assert.equal(instance.t('nav.work'), '代表作');
});
