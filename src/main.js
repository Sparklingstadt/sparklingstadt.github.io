import i18next from 'i18next';
import en from './locales/en.json';
import ja from './locales/ja.json';
import zh from './locales/zh.json';

const root = document.documentElement;
const toggle = document.querySelector('.theme-toggle');
const languageSelect = document.querySelector('.language-select');
const preference = window.matchMedia('(prefers-color-scheme: dark)');
const supported = ['ja', 'en', 'zh'];
const readPreference = (key) => {
  try { return localStorage.getItem(key); } catch { return null; }
};
const savePreference = (key, value) => {
  try { localStorage.setItem(key, value); } catch { /* Storage is optional. */ }
};
const savedTheme = readPreference('color-theme');
if (savedTheme === 'light' || savedTheme === 'dark') root.dataset.theme = savedTheme;
const savedLanguage = readPreference('language');
const browserLanguage = (navigator.languages || [navigator.language])
  .map(language => language.toLowerCase().split('-')[0])
  .find(language => supported.includes(language));
const language = supported.includes(savedLanguage) ? savedLanguage : browserLanguage || 'ja';
const isDark = () => root.dataset.theme ? root.dataset.theme === 'dark' : preference.matches;
const updateTheme = () => {
  toggle.setAttribute('aria-label', i18next.t(isDark() ? 'theme.light' : 'theme.dark'));
  document.querySelector('meta[name="theme-color"]').content = isDark() ? '#191f1c' : '#f5f3ed';
};
const renderLanguage = () => {
  root.lang = i18next.language === 'zh' ? 'zh-Hans' : i18next.language;
  document.querySelectorAll('[data-i18n]').forEach(element => {
    element.textContent = i18next.t(element.dataset.i18n);
  });
  document.querySelectorAll('[data-i18n-aria]').forEach(element => {
    element.setAttribute('aria-label', i18next.t(element.dataset.i18nAria));
  });
  document.title = i18next.t('meta.title');
  document.querySelector('meta[name="description"]').content = i18next.t('meta.description');
  document.querySelector('meta[property="og:title"]').content = i18next.t('meta.title');
  document.querySelector('meta[property="og:description"]').content = i18next.t('meta.social');
  languageSelect.value = i18next.language;
  updateTheme();
};

i18next.init({
  lng: language,
  fallbackLng: 'ja',
  supportedLngs: supported,
  keySeparator: false,
  resources: { en: { translation: en }, ja: { translation: ja }, zh: { translation: zh } },
  // Every translation is assigned through textContent, never interpreted as HTML.
  interpolation: { escapeValue: false },
}).then(() => {
  renderLanguage();
  i18next.on('languageChanged', renderLanguage);
  languageSelect.hidden = false;
  languageSelect.addEventListener('change', async () => {
    const nextLanguage = languageSelect.value;
    if (!supported.includes(nextLanguage)) return;
    await i18next.changeLanguage(nextLanguage);
    savePreference('language', nextLanguage);
  });
  toggle.hidden = false;
  toggle.addEventListener('click', () => {
    root.dataset.theme = isDark() ? 'light' : 'dark';
    savePreference('color-theme', root.dataset.theme);
    updateTheme();
  });
  preference.addEventListener('change', updateTheme);
});
