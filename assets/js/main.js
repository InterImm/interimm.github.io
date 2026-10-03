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

// Live Mars clock on the home page (NASA Mars24 algorithm, Allison & McEwen 2000).
(() => {
  const el = document.querySelector('[data-mars-clock]');
  if (!el) return;
  const mtc = el.querySelector('[data-mtc]');
  const msd = el.querySelector('[data-msd]');
  const utc = el.querySelector('[data-utc]');
  const TT_MINUS_UTC = 37 + 32.184; // TAI-UTC (leap seconds since 2017) + TT-TAI, in seconds
  const pad = (n) => String(Math.floor(n)).padStart(2, '0');
  const hms = (hours) => {
    const s = hours * 3600;
    return `${pad(s / 3600)}:${pad((s % 3600) / 60)}:${pad(s % 60)}`;
  };
  const tick = () => {
    const now = Date.now();
    const jdTT = now / 86400000 + 2440587.5 + TT_MINUS_UTC / 86400;
    const sol = (jdTT - 2405522.0028779) / 1.0274912517;
    mtc.textContent = hms((((sol % 1) + 1) % 1) * 24);
    msd.textContent = sol.toFixed(5);
    utc.textContent = new Date(now).toISOString().slice(11, 19);
  };
  tick();
  setInterval(tick, 1000);
})();
