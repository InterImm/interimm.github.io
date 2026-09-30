// Progressive enhancement for the site header. Without JavaScript the menu is
// simply always visible and the dropdowns are native <details> elements.
(() => {
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.getElementById('site-nav');
  const dropdowns = Array.from(document.querySelectorAll('.dropdown'));

  const setMenu = (open) => {
    toggle.setAttribute('aria-expanded', String(open));
    nav.classList.toggle('is-open', open);
  };

  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      setMenu(toggle.getAttribute('aria-expanded') !== 'true');
    });
  }

  const closeDropdowns = (except) => {
    dropdowns.forEach((d) => { if (d !== except) d.open = false; });
  };

  // One dropdown open at a time; close on outside click and on Escape.
  dropdowns.forEach((d) => {
    d.addEventListener('toggle', () => { if (d.open) closeDropdowns(d); });
  });
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.dropdown')) closeDropdowns();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    const open = dropdowns.find((d) => d.open);
    closeDropdowns();
    if (open) open.querySelector('summary').focus();
    else if (toggle && toggle.getAttribute('aria-expanded') === 'true') {
      setMenu(false);
      toggle.focus();
    }
  });
})();
