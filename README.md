# interimm.org

Source for [interimm.org](https://interimm.org), a bilingual (中文 / English) [Hugo](https://gohugo.io) site.

## Develop

Install Hugo (tested with 0.135.0) and run:

```sh
hugo server
```

The site is self-contained: layouts, styles and data live in this repository (there is no theme submodule).

## Where things live

| Path | What |
| --- | --- |
| `hugo.yaml` | Site config, including the navigation menu for each language |
| `content/{cn,en}/` | Pages. `cn` is the default language and is served from `/` |
| `data/*.yml` | Content for the home page, archives, activities, institutes and footer, keyed by language |
| `i18n/` | Small UI strings (menu label, 404 text, ...) |
| `layouts/` | Templates |
| `assets/` | CSS and JS, minified and fingerprinted by Hugo at build time |
| `assets/kit/`, `static/kit/` | The shared InterImm kit (styles, fonts, header and footer) that other InterImm sites link from interimm.org/kit/. See [kit/README.md](kit/README.md) |
| `static/` | Files served as-is (images, video, favicons) |

## Deploy

Pushing to the `hugo` branch builds the site in GitHub Actions and publishes it with GitHub Pages' official
deployment action. Pull requests against `hugo` only check that the site builds, and the workflow can also be
run by hand from the Actions tab.

This needs the repository's Pages source set to **GitHub Actions** (Settings > Pages > Build and deployment).

Analytics is off: the old Universal Analytics property no longer collects data. To enable Google Analytics 4,
uncomment the `services.googleAnalytics.id` block in `hugo.yaml`.
