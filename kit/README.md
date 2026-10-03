# InterImm kit

The shared look of every InterImm site: colours, fonts, header, footer, buttons, cards and page headers.
interimm.org owns it and publishes it; every other site links it instead of copying it, so a change here
reaches all of them on their next page load and they can't drift apart again.

| Published at | What | Source in this repo |
| --- | --- | --- |
| `https://interimm.org/kit/interimm.css` | Stylesheet, including the fonts below | `assets/kit/interimm.css` |
| `https://interimm.org/kit/interimm.js` | Header menu behaviour, and fills in the shared header and footer | `assets/kit/interimm.js` |
| `https://interimm.org/kit/nav.cn.json`, `nav.en.json` | The current menu and footer for each language | generated from `hugo.yaml` and `data/footer.yml` by `layouts/partials/kit.html` |
| `https://interimm.org/kit/fonts/` | Space Grotesk and JetBrains Mono (SIL OFL) | `static/kit/fonts/` |
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
    <header class="page-hero space">
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

`data-lang` is `en` or `cn`; without it the script uses the page's `lang`. Without JavaScript, or if
interimm.org can't be reached, the fallback markup stays.

Main building blocks: `.wrap`, `.space` (always-dark band with stars), `.kicker`, `.section`, `.section-alt`,
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
