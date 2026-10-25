// Shared by every mock. Loads the site's data.json (../../data.json) and fills:
// - [data-profile="name|initial|github|email"] text and [data-profile-link] hrefs;
// - [data-content="group.key"] text from data.text ({name} is replaced);
// - [data-content-lang="group"] text from data.text[group][element.lang];
// - [data-certification="id"] text from data.certifications (name in the page's language).
// scripts/build-mocks.js writes the same text into the HTML (npm run build), so
// pages read correctly without JavaScript or if the request fails. Page scripts
// that change an element's lang call MockData.render(element) to refresh it.
'use strict';

(() => {
  const source = new URL('../../data.json', document.currentScript.src);
  const HOOKS = '[data-profile], [data-profile-link], [data-content], [data-content-lang], [data-certification]';
  let data = null;

  const lookup = (path) => path.split('.').reduce((value, key) => value?.[key], data.text);
  const fill = (template) => (typeof template === 'string' ? template.replaceAll('{name}', data.profile.name) : undefined);

  const profileText = () => ({
    name: data.profile.name,
    initial: data.profile.name.charAt(0).toUpperCase(),
    github: `@${data.profile.github}`,
    email: data.profile.email,
  });
  const profileLinks = () => ({
    github: `https://github.com/${encodeURIComponent(data.profile.github)}`,
    email: `mailto:${data.profile.email}`,
  });

  const renderElement = (element, text, links) => {
    const { profile, profileLink, content, contentLang, certification } = element.dataset;
    let value;
    if (profile) value = text[profile];
    else if (content) value = fill(lookup(content));
    else if (contentLang) value = fill(lookup(`${contentLang}.${element.lang}`));
    else if (certification) {
      const language = element.closest('[lang]')?.lang || 'ja';
      value = data.certifications?.find((item) => item.id === certification)?.name[language];
    }
    if (value) element.textContent = value;
    if (profileLink && links[profileLink]) element.href = links[profileLink];
  };

  const render = (scope = document) => {
    if (!data) return;
    const text = profileText();
    const links = profileLinks();
    const elements = [...scope.querySelectorAll(HOOKS)];
    if (scope instanceof Element && scope.matches(HOOKS)) elements.unshift(scope);
    for (const element of elements) renderElement(element, text, links);
  };

  window.MockData = { render };

  fetch(source)
    .then((response) => {
      if (!response.ok) throw new Error(`${response.status} ${response.url}`);
      return response.json();
    })
    .then((json) => {
      data = json;
      render();
    })
    .catch(() => { /* Keep the text written in the HTML. */ });
})();
