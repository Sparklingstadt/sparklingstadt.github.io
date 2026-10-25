// Shared by every mock: fills [data-profile] text and [data-profile-link] hrefs
// from profile.json. The HTML already holds the same values, so the page reads
// correctly without JavaScript or if the request fails.
'use strict';

(() => {
  const source = new URL('profile.json', document.currentScript.src);

  const render = (profile) => {
    const text = {
      name: profile.name,
      initial: profile.name.charAt(0).toUpperCase(),
      github: `@${profile.github}`,
      email: profile.email,
    };
    const links = {
      github: `https://github.com/${encodeURIComponent(profile.github)}`,
      email: `mailto:${profile.email}`,
    };
    for (const element of document.querySelectorAll('[data-profile]')) {
      const value = text[element.dataset.profile];
      if (value) element.textContent = value;
    }
    for (const element of document.querySelectorAll('[data-profile-link]')) {
      const href = links[element.dataset.profileLink];
      if (href) element.href = href;
    }
  };

  fetch(source)
    .then((response) => {
      if (!response.ok) throw new Error(`${response.status} ${response.url}`);
      return response.json();
    })
    .then(render)
    .catch(() => { /* Keep the values written in the HTML. */ });
})();
