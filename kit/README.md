# InterImm kit

The shared look of every InterImm site: colours, fonts, header, signal line, footer, buttons, cards and page headers.
Every page reads as a public document of the Interplanetary Immigration Center: paper and ink, serif headings,
thin rules, one Mars-rust accent, and a live signal line under the header with the Earth to Mars distance,
the one-way signal delay, Isidis time (MTC) and the sol.
interimm.org owns it and publishes it; every other site links it instead of copying it, so a change here
reaches all of them on their next page load and they can't drift apart again.

| Published at | What | Source in this repo |
| --- | --- | --- |
| `https://interimm.org/kit/interimm.css` | Stylesheet, including the fonts below | `assets/kit/interimm.css` |
| `https://interimm.org/kit/interimm.js` | Header menu behaviour, and fills in the shared header and footer | `assets/kit/interimm.js` |
| `https://interimm.org/kit/nav.cn.json`, `nav.en.json` | The current menu and footer for each language | generated from `hugo.yaml` and `data/footer.yml` by `layouts/partials/kit.html` |
| `https://interimm.org/kit/fonts/` | Source Serif 4, IBM Plex Sans and IBM Plex Mono (SIL OFL) | `static/kit/fonts/` |
| `https://interimm.org/kit/` | Live style guide showing every component | `static/kit/index.html` |

All of it is static files on GitHub Pages, so it costs nothing. GitHub Pages sends
`Access-Control-Allow-Origin: *`, so subdomains such as cities.interimm.org can load the fonts and menu too.

## Using it on another site

```html
<html lang="en" class="js">
<head>
  <link rel="stylesheet" href="https://interimm.org/kit/interimm.css">
  <link rel="stylesheet" href="css/style.css"> <!-- only what this site adds -->
  <script src="https://interimm.org/kit/interimm.js" defer></script>
</head>
<body>
  <!-- Replaced by the live interimm.org menu. data-current marks the menu item to highlight
       (its identifier in hugo.yaml, e.g. logistics). What is inside is the fallback. -->
  <header class="site-header" data-interimm-header data-lang="en" data-current="logistics">
    <div class="wrap header-inner">
      <a class="brand" href="https://interimm.org/en/">InterImm</a>
    </div>
  </header>

  <main id="main">
    <header class="page-hero">
      <div class="wrap">
        <p class="kicker">InterImm</p>
        <h1>Page title</h1>
        <p class="lede">One sentence about the page.</p>
      </div>
    </header>
    ...
  </main>

  <footer class="site-footer" data-interimm-footer></footer>
</body>
</html>
```

The header gets the signal line automatically; add `data-no-signal` to the header to leave it out (for example on
a full-screen app). Any element with `data-signal-au`, `data-signal-delay`, `data-signal-mtc` or `data-signal-sol`
is filled in live, and page scripts can use the same calculations through `window.InterImm.astro`.
`.space` no longer draws a dark starfield; it is kept so older pages still get the right spacing.

`data-lang` is `en` or `cn`; without it the script uses the page's `lang`. Without JavaScript, or if
interimm.org can't be reached, the fallback markup stays.

The header's language link (中文 / English) goes to the interimm.org home page of the other language. A site
that has its own page in another language says where it is with `data-lang-cn` or `data-lang-en` on the header,
for example `data-lang-cn="https://cities.interimm.org/?lang=cn"`, and the link goes there instead.

### Toolkit button

For pages that are mostly reading, put `data-toolkit` on the header (usually with `data-no-signal`). interimm.js then
adds a small round button at the bottom right. It opens a panel with the live signal readings, the light/dark
switch and the language links. To add a list of links to the panel (a chapter list, say), put them in any element
marked `data-toolkit-links`, hidden if you like, and set `data-toolkit-title` for its heading:

```html
<header class="site-header" data-interimm-header data-no-signal data-toolkit data-lang="en">...</header>
<nav hidden data-toolkit-links data-toolkit-title="Chapters"><a href="/history/">History</a> ...</nav>
```

### Light and dark

Every page follows the visitor's system setting, and the header has a switch (moon / sun) to pick light or dark
by hand. The choice is a cookie on `interimm.org`, so it holds on interimm.org, its project pages
(`/interplanetary-logistics/`, `/mars-map/`, ...) and its subdomains (cities.interimm.org, book.interimm.org).
interimm.js adds the switch to `.nav-tools` in the header; put `data-theme-toggle` on any other button to make
it a switch too. A picked theme is set as `data-theme="light"` or `data-theme="dark"` on `<html>`, and
`data-theme-now` always says which one is showing.

To avoid a flash of the wrong theme while the deferred script loads, put this in `<head>`, before the stylesheets:

```html
<script>(function(m){if(m)document.documentElement.dataset.theme=m[1]})(document.cookie.match(/(?:^|; )interimm-theme=(light|dark)/))</script>
```

Site styles write their own dark colours with the same two selectors the kit uses, so both the system setting
and the switch work:

```css
@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) { --plot-line: #e27a50; } }
:root[data-theme="dark"] { --plot-line: #e27a50; }
```

A plain `@media (prefers-color-scheme: dark)` block still works for visitors who never touch the switch, but
it ignores the switch. Scripts that draw in colour (canvas, WebGL) read `InterImm.theme.get()` and redraw on the
`interimm:theme` event, which fires on `document` whenever the theme in use changes, by switch or by system.

### Caching

GitHub Pages lets browsers cache files for about 10 minutes, so a kit change reaches other sites within that
time. A site's own scripts and styles are a different matter: when a page starts using a new kit feature, add a
version stamp to its own asset URLs (for example `js/main.js?v=20261003`, changed on every deploy) so phones
don't keep running an old copy against the new page.

Main building blocks: `.wrap`, `.kicker` (small mono label), `.signal`, `.doc-grid` + `.doc-side` + `.doc-main`,
`.meta-list`, `.plate`, `.crumbs`, `.section`, `.section-alt`,
`.section-title`, `.page-hero`, `.btn` / `.btn-primary` / `.btn-ghost` / `.btn-lg`, `.chips`, `.card`,
`.card-grid`, `.tile` and `.bento`, `.card-link-wrap` + `.card-link` (whole card clickable), `.text-link`,
`.prose`. Tokens such as `--bg`, `--surface`, `--text`, `--muted`, `--border`, `--accent`, `--link`,
`--radius`, `--font-display` and `--font-mono` are on `:root`; use them in site styles so light and dark
both work. The style guide at https://interimm.org/kit/ shows each one.

## Changing it

- Edit the files in this repo and open a PR against `hugo`; once merged it is live everywhere.
- Keep changes additive. Other sites depend on these class names and tokens, so rename or remove one only
  after checking them (today: interplanetary-logistics and the cities explorer in martian-cities).
- Menu and footer changes go in `hugo.yaml` and `data/footer.yml` as before; the JSON follows automatically.
