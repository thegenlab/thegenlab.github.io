# Project website source

All new project websites belong in **`thegenlab/thegenlab.github.io`**, alongside the lab homepage. Research implementations belong in **separate GitHub repositories directly under `thegenlab`**, such as `thegenlab/project-name`. The `src/projects/` directory below contains website pages, styles and media only; it does not contain research code.

| Purpose | Repository / location | Published address |
| --- | --- | --- |
| Lab homepage | `thegenlab/thegenlab.github.io` → `src/pages/index.astro` | `https://thegenlab.ai/` |
| A new project website | Same website repository → `src/projects/project-name/` and `src/pages/project-name/` | `https://thegenlab.ai/project-name/` |
| Research implementation | Separate repository `thegenlab/project-name` | GitHub repository; Pages disabled |

Existing external project websites keep their current URLs. Adding a new website should not change the frozen homepage design or another project’s layout.

## Architecture

Use one Astro app, one set of dependencies, one build and one deployment. Astro’s [file-based routing](https://docs.astro.build/en/guides/routing/) defines URLs through small files in `src/pages/`; each file imports the corresponding website page from `src/projects/`.

```text
src/
  pages/
    index.astro                     # Lab homepage
    project-test/
      index.astro                   # Thin landing-page route
      nested/index.astro            # Thin nested-page route
  projects/
    project-test/                   # Website source only
      Home.astro
      Nested.astro
      Layout.astro                  # This website’s HTML/head/layout
      styles.css
      assets/path-check.svg
```

For example, `src/pages/project-test/index.astro` contains:

```astro
---
import Home from '../../projects/project-test/Home.astro';
---
<Home />
```

The route renders at `/project-test/`. A nested wrapper imports `Nested.astro` using `../../../projects/project-test/Nested.astro` and renders at `/project-test/nested/`. A folder in `src/projects/` does not create a URL by itself.

This keeps ordinary framework conventions while allowing independent designs:

| Approach | Fit for this website |
| --- | --- |
| Native Astro routes and project source folders | Chosen: independent layouts and assets with one familiar build and preview. |
| A separate app per project in a workspace | Useful only when a project needs an incompatible framework or dependency set; adds multiple builds and output assembly. |
| A custom routing or folder-copy pipeline | Adds conventions and tooling students must maintain for behavior Astro already provides. |

All websites share dependency versions and build health: an error in one project blocks the shared deployment. Keep the full-site checks in CI. Reconsider separate applications only when a real project needs an incompatible toolchain.

## Add a project website

1. Choose a unique lowercase URL slug, such as `project-name`. Check that `src/pages/` and `public/` do not already publish that path. Keep Pages disabled in the separate `thegenlab/project-name` research repository.
2. Use `src/projects/project-test/` as a small starting example: copy its layout, landing page, stylesheet and required assets into `src/projects/project-name/`. Replace the sample content with verified project material. Copy `Nested.astro` only if a nested page is useful; add components or content files only when the website needs them.
3. Create `src/pages/project-name/index.astro` with the wrapper above, changing its import to the new folder. Add explicit nested route wrappers only for pages that exist. There is no project registry to update.
4. Update the page title, description, canonical URL, links and assets in the new website. Link to its research repository. Remove sample labels and `noindex, nofollow` only when publishing a real, reviewed project; retain them in `project-test`.
5. Run `npm run verify`, then `npm run preview`. Inspect the landing page, any nested pages and their assets at their real URLs, including mobile. Publish with the existing workflow and check the live result. See [deployment](DEPLOYMENT.md).

The existing fake example is a hosting test, not a paper or carousel entry. For real projects, add a verified entry to `src/content/publications.json` only when it should appear on the homepage.

## Layout, styles and links

Each website owns its `Layout.astro` and imports only its own styles and components. It can use a completely different composition from the homepage. Do not import the homepage layout or edit its styles just to create a project page.

Astro component `<style>` blocks are [scoped by default](https://docs.astro.build/en/guides/styling/). An imported `.css` file is global within pages that load it: import it from the project’s private layout, and use a project-root class for broad rules when needed. Avoid a shared entry point that imports every project’s styles.

Use ordinary links such as `<a href="/project-name/">` and `<a href="/project-name/details/">`. Keep the shared Astro `base` unset; projects are routes within the root site. Route files, public files and project slugs must not produce the same output path.

## Images, videos and stable files

Keep authored assets beside their website in `src/projects/<project>/assets/` and import them. Astro can process local images through [`Image` or `Picture`](https://docs.astro.build/en/guides/images/); an explicit URL import works for assets used directly by HTML:

```astro
---
import diagramUrl from './assets/diagram.svg?url';
import demoUrl from './assets/demo.mp4?url';
---
<img src={diagramUrl} alt="Describe the actual diagram" />
<video src={demoUrl} controls preload="metadata"></video>
```

Imported assets are part of the build: their output URLs may be hashed or inlined, so use the imported value rather than guessing a `dist/` filename. A video import provides a URL; it does not transcode or compress the video. Compress large media before adding it, or use appropriate external media hosting. See [Vite’s asset handling](https://vite.dev/guide/assets.html#importing-asset-as-url) and [Astro’s media guide](https://docs.astro.build/en/guides/media/).

Use `public/` only when a file needs unchanged contents or a stable public filename, for example a downloadable PDF at `public/downloads/project-name/paper.pdf`. Link to it as `/downloads/project-name/paper.pdf`. Astro [copies public files unchanged](https://docs.astro.build/en/basics/project-structure/#public); do not put authored HTML pages, source code or private files there. Keep source credits and licenses with the assets or in the project’s documentation.
