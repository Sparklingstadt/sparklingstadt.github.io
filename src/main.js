import i18next from 'i18next';
import en from './locales/en.json';
import ja from './locales/ja.json';
import zh from './locales/zh.json';
// Only these lists are bundled; esbuild drops the rest of data.json.
import { certifications, projects } from '../data.json';

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
  document.querySelector('meta[name="theme-color"]').content = isDark() ? '#15171a' : '#ffffff';
};
const renderDates = () => {
  document.querySelectorAll('time[datetime]').forEach(element => {
    const date = new Date(`${element.getAttribute('datetime')}T00:00:00Z`);
    if (Number.isNaN(date.getTime())) return;
    element.textContent = new Intl.DateTimeFormat(root.lang, { dateStyle: 'long', timeZone: 'UTC' }).format(date);
  });
};
// Project and certification text lives in data.json; scripts/build-index.js
// writes the English version into index.html, and this swaps in the current
// language.
const translated = (text) => text?.[i18next.language] ?? text?.en;
const renderProjects = () => {
  document.querySelectorAll('[data-project][data-project-field]').forEach(element => {
    const project = projects.find(item => item.id === element.dataset.project);
    const value = translated(project?.[element.dataset.projectField]);
    if (value) element.textContent = value;
  });
  document.querySelectorAll('[data-certification]').forEach(element => {
    const certification = certifications.find(item => item.id === element.dataset.certification);
    const value = translated(certification?.name);
    if (value) element.textContent = value;
  });
};
const renderLanguage = () => {
  root.lang = i18next.language === 'zh' ? 'zh-Hans' : i18next.language;
  document.querySelectorAll('[data-i18n]').forEach(element => {
    element.textContent = i18next.t(element.dataset.i18n);
  });
  renderProjects();
  document.querySelectorAll('[data-i18n-aria]').forEach(element => {
    element.setAttribute('aria-label', i18next.t(element.dataset.i18nAria));
  });
  document.title = i18next.t('meta.title');
  document.querySelector('meta[name="description"]').content = i18next.t('meta.description');
  document.querySelector('meta[property="og:title"]').content = i18next.t('meta.title');
  document.querySelector('meta[property="og:description"]').content = i18next.t('meta.social');
  languageSelect.value = i18next.language;
  renderDates();
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
