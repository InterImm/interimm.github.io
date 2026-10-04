// InterImm kit: shared header and footer for every InterImm site.
//
// Source of truth: InterImm/interimm.github.io (branch `hugo`), assets/kit/.
// Published at https://interimm.org/kit/interimm.js. See kit/README.md.
//
// 1. On a page that marks its header with `data-interimm-header` (and its
//    footer with `data-interimm-footer`), it replaces them with the current
//    interimm.org menu and footer, read from nav.<lang>.json next to this
//    script. The page's own markup stays as the fallback if that fails.
// 2. On every page it wires up the header menu: the mobile toggle and one
//    dropdown open at a time. Without JavaScript the menu is simply always
//    visible and the dropdowns are native <details> elements.
// 3. It keeps the signal line under the header live: the current Earth to Mars
//    distance, the one-way signal delay, Mars time (MTC) and the sol. Any
//    element with data-signal-au, -delay, -mtc or -sol is filled in. The same
//    calculations are exposed as window.InterImm.astro for page scripts.
// 4. It adds a light/dark switch to the header. The choice is kept in a cookie
//    on interimm.org, so it holds across interimm.org and its subdomains, and is
//    set as data-theme="light" or "dark" on <html>; with no choice the page
//    follows the system setting. data-theme-now always holds the theme in use.
//    Page scripts can read and change it through window.InterImm.theme and
//    listen for the `interimm:theme` event on document.
(() => {
  document.documentElement.classList.add('js');
  const script = document.currentScript;
  const base = script ? new URL('.', script.src) : new URL('/kit/', location.href);

  // ---------- astronomy ----------
  // Mars time: NASA Mars24 (Allison & McEwen 2000). Planet positions: JPL
  // approximate Keplerian elements (Standish), accurate to a few thousandths
  // of an AU over 1800-2050, which is plenty for a light-time readout.
  const TT_MINUS_UTC = 37 + 32.184; // TAI-UTC (leap seconds since 2017) + TT-TAI, seconds
  const AU_KM = 149597870.7;
  const AU_LIGHT_S = 499.004784;
  const RAD = Math.PI / 180;
  const julian = (ms) => ms / 86400000 + 2440587.5;
  const msd = (ms) => (julian(ms) + TT_MINUS_UTC / 86400 - 2405522.0028779) / 1.0274912517;
  const pad = (n) => String(Math.floor(n)).padStart(2, '0');
  const mtc = (ms) => {
    const s = Math.floor((((msd(ms) % 1) + 1) % 1) * 86400);
    return `${pad(s / 3600)}:${pad((s % 3600) / 60)}:${pad(s % 60)}`;
  };
  // a (AU), e, I, L, longitude of perihelion, longitude of node (deg), then rates per century
  const ELEMENTS = {
    earth: [1.00000261, 0.01671123, -0.00001531, 100.46457166, 102.93768193, 0, 0.00000562, -0.00004392, -0.01294668, 35999.37244981, 0.32327364, 0],
    mars: [1.52371034, 0.09339410, 1.84969142, -4.55343205, -23.94362959, 49.55953891, 0.00001847, 0.00007882, -0.00813131, 19140.30268499, 0.44441088, -0.29257343],
  };
  // Heliocentric ecliptic position in AU. Pass meanAnomaly (deg) to trace the orbit instead.
  const position = (planet, ms, meanAnomaly) => {
    const T = (julian(ms) - 2451545) / 36525;
    const [a0, e0, i0, l0, p0, o0, da, de, di, dl, dp, dO] = ELEMENTS[planet];
    const a = a0 + da * T;
    const e = e0 + de * T;
    const inc = (i0 + di * T) * RAD;
    const peri = p0 + dp * T;
    const node = (o0 + dO * T) * RAD;
    const w = peri * RAD - node;
    const M = (meanAnomaly ?? ((((l0 + dl * T - peri) % 360) + 540) % 360) - 180) * RAD;
    let E = M + e * Math.sin(M);
    for (let k = 0; k < 8; k++) E -= (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E));
    const x1 = a * (Math.cos(E) - e);
    const y1 = a * Math.sqrt(1 - e * e) * Math.sin(E);
    const cw = Math.cos(w), sw = Math.sin(w), cn = Math.cos(node), sn = Math.sin(node), ci = Math.cos(inc);
    return [
      (cw * cn - sw * sn * ci) * x1 + (-sw * cn - cw * sn * ci) * y1,
      (cw * sn + sw * cn * ci) * x1 + (-sw * sn + cw * cn * ci) * y1,
      Math.sin(w) * Math.sin(inc) * x1 + Math.cos(w) * Math.sin(inc) * y1,
    ];
  };
  const distance = (ms) => {
    const e = position('earth', ms);
    const m = position('mars', ms);
    return Math.hypot(m[0] - e[0], m[1] - e[1], m[2] - e[2]);
  };
  const astro = { msd, mtc, position, distance, AU_KM, AU_LIGHT_S };
  window.InterImm = Object.assign(window.InterImm || {}, { astro });

  // ---------- theme ----------
  const root = document.documentElement;
  const THEME_COOKIE = 'interimm-theme';
  const darkQuery = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;
  const systemTheme = () => (darkQuery && darkQuery.matches ? 'dark' : 'light');
  const savedTheme = () => {
    const m = document.cookie.match(/(?:^|; )interimm-theme=(light|dark)/);
    return m ? m[1] : null;
  };
  const saveTheme = (t) => {
    const domain = /(^|\.)interimm\.org$/.test(location.hostname) ? '; domain=interimm.org' : '';
    document.cookie = t
      ? `${THEME_COOKIE}=${t}; path=/; max-age=31536000; SameSite=Lax${domain}`
      : `${THEME_COOKIE}=; path=/; max-age=0; SameSite=Lax${domain}`;
  };
  const themeNow = () => root.dataset.theme || systemTheme();
  const themeLabels = () => (document.documentElement.lang.toLowerCase().startsWith('zh')
    ? { dark: '切换到深色', light: '切换到浅色' }
    : { dark: 'Switch to dark theme', light: 'Switch to light theme' });
  // The browser bar colour: follow the page background when a theme is picked.
  const syncThemeColor = () => {
    let meta = document.querySelector('meta[name="theme-color"][data-interimm]');
    if (!root.dataset.theme) { if (meta) meta.remove(); return; }
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'theme-color';
      meta.setAttribute('data-interimm', '');
      document.head.prepend(meta);
    }
    meta.content = getComputedStyle(root).getPropertyValue('--bg').trim() || (root.dataset.theme === 'dark' ? '#131315' : '#f5f5f1');
  };
  const syncThemeButtons = () => {
    const next = themeNow() === 'dark' ? 'light' : 'dark';
    const label = themeLabels()[next];
    document.querySelectorAll('[data-theme-toggle]').forEach((b) => {
      b.setAttribute('aria-label', label);
      b.title = label;
    });
  };
  const applyTheme = (t) => {
    if (t === 'light' || t === 'dark') root.dataset.theme = t;
    else delete root.dataset.theme;
    const now = themeNow();
    const changed = root.dataset.themeNow !== now;
    root.dataset.themeNow = now;
    syncThemeColor();
    syncThemeButtons();
    if (changed) document.dispatchEvent(new CustomEvent('interimm:theme', { detail: { theme: now } }));
  };
  // Picking the theme the system already uses clears the choice, so the page
  // follows the system again from then on.
  const setTheme = (t) => {
    const pick = t === systemTheme() ? null : t;
    saveTheme(pick);
    applyTheme(pick);
  };
  applyTheme(savedTheme());
  if (darkQuery && darkQuery.addEventListener) darkQuery.addEventListener('change', () => applyTheme(root.dataset.theme));
  window.InterImm.theme = { get: themeNow, set: setTheme, toggle: () => setTheme(themeNow() === 'dark' ? 'light' : 'dark') };

  const SUN_ICON = '<svg class="icon-sun" aria-hidden="true" focusable="false" viewBox="0 0 24 24" width="18" height="18"><g fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><circle cx="12" cy="12" r="4.2"/><path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M5.3 18.7l1.6-1.6M17.1 6.9l1.6-1.6"/></g></svg>';
  const MOON_ICON = '<svg class="icon-moon" aria-hidden="true" focusable="false" viewBox="0 0 24 24" width="18" height="18"><path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>';
  const initThemeToggle = () => {
    const tools = document.querySelector('.site-header .nav-tools');
    if (tools && !document.querySelector('.site-header [data-theme-toggle]')) {
      const li = document.createElement('li');
      li.className = 'nav-item';
      li.innerHTML = `<button class="theme-toggle" type="button" data-theme-toggle>${MOON_ICON}${SUN_ICON}</button>`;
      tools.prepend(li);
    }
    document.querySelectorAll('[data-theme-toggle]').forEach((b) => {
      if (b.dataset.themeBound) return;
      b.dataset.themeBound = '1';
      b.addEventListener('click', () => window.InterImm.theme.toggle());
    });
    syncThemeButtons();
  };

  // "13 min 42 s" / "13 分 42 秒", from the page's own data-unit-min / data-unit-s, else English.
  const duration = (seconds, el) => {
    const min = el.dataset.unitMin || 'min';
    const sec = el.dataset.unitS || 's';
    return `${Math.floor(seconds / 60)} ${min} ${String(Math.round(seconds % 60)).padStart(2, '0')} ${sec}`;
  };
  const tickSignal = () => {
    const now = Date.now();
    const au = distance(now);
    const set = (attr, fn) => document.querySelectorAll(`[${attr}]`).forEach((el) => { el.textContent = fn(el); });
    set('data-signal-au', () => au.toFixed(3));
    set('data-signal-km', () => (au * AU_KM / 1e6).toFixed(1));
    set('data-signal-delay', (el) => duration(au * AU_LIGHT_S, el));
    set('data-signal-mtc', () => mtc(now));
    set('data-signal-sol', () => Math.floor(msd(now)).toLocaleString('en-US'));
  };
  const startSignal = () => {
    if (!document.querySelector('[data-signal-au],[data-signal-delay],[data-signal-mtc],[data-signal-sol]')) return;
    tickSignal();
    setInterval(tickSignal, 1000);
  };

  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

  const GITHUB_ICON = '<svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.921.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>';
  const MENU_ICON = '<svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" width="24" height="24"><path d="M4 7h16M4 12h16M4 17h16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';

  // A site with its own page in another language names it on the header, e.g.
  // data-lang-cn="https://cities.interimm.org/?lang=cn"; otherwise the language
  // link goes to that language's interimm.org home page.
  const langUrl = (header, l) => header.getAttribute(`data-lang-${l.lang}`) || l.url;

  const renderSignal = (nav) => {
    const s = nav.labels.signal;
    if (!s) return '';
    return `<div class="signal"><p class="wrap signal-inner">
      <span class="signal-item">${esc(s.distance)} <b data-signal-au>–</b> AU</span>
      <span class="signal-item">${esc(s.delay)} <b data-signal-delay data-unit-min="${esc(s.min)}" data-unit-s="${esc(s.s)}">–</b></span>
      <span class="signal-item">${esc(s.mars)} <b data-signal-mtc>–</b> MTC</span>
      <span class="signal-item">${esc(s.sol)} <b data-signal-sol>–</b></span>
    </p></div>`;
  };

  const renderHeader = (header, nav, current) => {
    const link = (item) => `<a href="${esc(item.url)}"${item.id === current ? ' aria-current="page"' : ''}>${esc(item.name)}</a>`;
    const items = nav.menu.map((item) => {
      if (item.children && item.children.length) {
        const open = item.children.some((c) => c.id === current) ? ' data-current' : '';
        return `<li class="nav-item"><details class="dropdown"${open}><summary>${esc(item.name)}</summary><ul class="dropdown-menu">${item.children.map((c) => `<li>${link(c)}</li>`).join('')}</ul></details></li>`;
      }
      return `<li class="nav-item">${link(item).replace('<a ', '<a class="nav-link" ')}</li>`;
    }).join('');
    const langs = nav.languages.map((l) => `<a class="nav-link lang-link" href="${esc(langUrl(header, l))}" hreflang="${esc(l.code)}" lang="${esc(l.code)}"><span class="sr-only">${esc(nav.labels.language)}: </span>${esc(l.name)}</a>`).join('');
    return `<div class="wrap header-inner">
      <a class="brand" href="${esc(nav.home)}"><img class="brand-mark" src="${esc(nav.logo)}" alt="" width="36" height="36"><span class="brand-name">${esc(nav.name || nav.title)}${nav.subtitle ? `<span class="brand-sub">${esc(nav.subtitle)}</span>` : ''}</span></a>
      <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="site-nav"><span class="sr-only">${esc(nav.labels.menu)}</span>${MENU_ICON}</button>
      <nav id="site-nav" class="site-nav" aria-label="${esc(nav.labels.menu)}">
        <ul class="nav-list">${items}</ul>
        <ul class="nav-list nav-tools">
          <li class="nav-item"><a class="nav-link" href="${esc(nav.github)}" rel="noopener">${GITHUB_ICON}<span>GitHub</span></a></li>
          ${langs ? `<li class="nav-item">${langs}</li>` : ''}
        </ul>
      </nav>
    </div>${header.hasAttribute('data-no-signal') ? '' : renderSignal(nav)}`;
  };

  const renderFooter = (nav) => `<div class="wrap">
      <div class="footer-brand">
        <a class="brand" href="${esc(nav.home)}"><img class="brand-mark" src="${esc(nav.logo)}" alt="" width="36" height="36" loading="lazy"><span class="brand-name">${esc(nav.name || nav.title)}${nav.subtitle ? `<span class="brand-sub">${esc(nav.subtitle)}</span>` : ''}</span></a>
        <p class="kicker">${esc(nav.labels.kicker)}</p>
      </div>
      <div class="footer-grid">${nav.footer.map((col) => `<section class="footer-col"><h2>${esc(col.title)}</h2>${col.description ? `<p>${esc(col.description)}</p>` : ''}<ul>${col.links.map((l) => `<li><a href="${esc(l.url)}">${esc(l.title)}</a></li>`).join('')}</ul></section>`).join('')}</div>
      <p class="footer-legal"><span>© ${new Date().getFullYear()} ${esc(nav.author)}</span><span class="footer-legal-links">${nav.project ? `<a href="${esc(nav.project.url)}">${esc(nav.project.name)}</a>` : ''}<a href="#">${esc(nav.labels.backToTop)} ↑</a></span></p>
    </div>`;

  const initMenu = () => {
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
  };

  const start = () => {
    const header = document.querySelector('[data-interimm-header]');
    const footer = document.querySelector('[data-interimm-footer]');
    if (!header && !footer) { initThemeToggle(); initMenu(); startSignal(); return; }

    const host = header || footer;
    const lang = host.dataset.lang || (document.documentElement.lang.toLowerCase().startsWith('zh') ? 'cn' : 'en');
    fetch(new URL(`nav.${lang}.json`, base))
      .then((r) => { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then((nav) => {
        if (header) header.innerHTML = renderHeader(header, nav, header.dataset.current);
        if (footer) footer.innerHTML = renderFooter(nav);
      })
      .catch(() => { /* keep the page's own fallback markup */ })
      .finally(() => { initThemeToggle(); initMenu(); startSignal(); });
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
