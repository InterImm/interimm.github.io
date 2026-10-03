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
(() => {
  document.documentElement.classList.add('js');
  const script = document.currentScript;
  const base = script ? new URL('.', script.src) : new URL('/kit/', location.href);

  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

  const GITHUB_ICON = '<svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.921.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>';
  const MENU_ICON = '<svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" width="24" height="24"><path d="M4 7h16M4 12h16M4 17h16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';

  // A site with its own page in another language names it on the header, e.g.
  // data-lang-cn="https://cities.interimm.org/?lang=cn"; otherwise the language
  // link goes to that language's interimm.org home page.
  const langUrl = (header, l) => header.getAttribute(`data-lang-${l.lang}`) || l.url;

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
      <a class="brand" href="${esc(nav.home)}"><img class="brand-mark" src="${esc(nav.logo)}" alt="" width="32" height="32"><span class="brand-name">${esc(nav.title)}</span></a>
      <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="site-nav"><span class="sr-only">${esc(nav.labels.menu)}</span>${MENU_ICON}</button>
      <nav id="site-nav" class="site-nav" aria-label="${esc(nav.labels.menu)}">
        <ul class="nav-list">${items}</ul>
        <ul class="nav-list nav-tools">
          <li class="nav-item"><a class="nav-link" href="${esc(nav.github)}" rel="noopener">${GITHUB_ICON}<span>GitHub</span></a></li>
          ${langs ? `<li class="nav-item">${langs}</li>` : ''}
        </ul>
      </nav>
    </div>`;
  };

  const renderFooter = (nav) => `<div class="wrap">
      <div class="footer-brand">
        <a class="brand" href="${esc(nav.home)}"><img class="brand-mark" src="${esc(nav.logo)}" alt="" width="36" height="36" loading="lazy"><span class="brand-name">${esc(nav.title)}</span></a>
        <p class="kicker">${esc(nav.labels.kicker)}</p>
      </div>
      <div class="footer-grid">${nav.footer.map((col) => `<section class="footer-col"><h2>${esc(col.title)}</h2>${col.description ? `<p>${esc(col.description)}</p>` : ''}<ul>${col.links.map((l) => `<li><a href="${esc(l.url)}">${esc(l.title)}</a></li>`).join('')}</ul></section>`).join('')}</div>
      <p class="footer-legal"><span>© ${new Date().getFullYear()} ${esc(nav.author)}</span><a href="#">${esc(nav.labels.backToTop)} ↑</a></p>
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
    if (!header && !footer) { initMenu(); return; }

    const host = header || footer;
    const lang = host.dataset.lang || (document.documentElement.lang.toLowerCase().startsWith('zh') ? 'cn' : 'en');
    fetch(new URL(`nav.${lang}.json`, base))
      .then((r) => { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then((nav) => {
        if (header) header.innerHTML = renderHeader(header, nav, header.dataset.current);
        if (footer) footer.innerHTML = renderFooter(nav);
      })
      .catch(() => { /* keep the page's own fallback markup */ })
      .finally(initMenu);
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
