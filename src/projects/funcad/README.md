# FunCAD project page

Served at https://thegenlab.ai/funcad/. These files are generated from `project_site/` in the
FunCAD-Harness repository by `deploy/thegenlab/export_site.py`; edit the page
there and export again rather than editing them here.

- `Home.astro` is the page markup. Astro bundles it with `styles.css`,
  `script.js` and `failure_viewer.js`.
- `public/funcad/` holds the files the page requests by URL: videos, posters,
  figures, the Figure 7 models, the three.js bundle the 3D viewers load on
  demand, and the service worker, which has to sit at `/funcad/sw.js` to
  control the page.
- The showcase film streams from the UCL copy of the page (https://zigeng.duckdns.org/funcad/)
  so this repository stays small.
