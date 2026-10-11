# FunCAD project page

Served at https://thegenlab.ai/funcad/. These files are generated from `project_site/` in the
FunCAD-Harness repository by `deploy/thegenlab/export_site.py`; edit the page
there and export again rather than editing them here.

- `Home.astro` is the page markup. `styles.css`, `script.js`,
  `failure_viewer.js` and `demo/` here are review copies of the page and demo
  stylesheets and scripts; the served copies are in `public/funcad/`, at stable
  URLs that the page service worker can cache inside its `/funcad/` scope.
- `public/funcad/` holds the files the page requests by URL: videos, posters,
  figures, the paper, the Figure 7 models, the three.js bundle the 3D viewers
  load on demand, and the service worker, which has to sit at `/funcad/sw.js`
  to control the page.
- The comparison demo pages (`Demo*.astro`, routes under `src/pages/funcad/demo/`)
  load their scripts, replay data and clips from `public/funcad/demo/`.
