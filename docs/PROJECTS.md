# Project website source

All new project websites belong in **`thegenlab/thegenlab.github.io`**, alongside the lab homepage. Research implementations belong in **separate GitHub repositories directly under `thegenlab`**, such as `thegenlab/project-name`. Project folders in this website repository contain pages, styles and media only.

| Purpose | Repository / location | Published address |
| --- | --- | --- |
| Lab homepage | `thegenlab/thegenlab.github.io` → `src/pages/index.astro` | `https://thegenlab.ai/` |
| A new project website | Same website repository → `src/projects/project-name/` and `src/pages/project-name/` | `https://thegenlab.ai/project-name/` |
| Research implementation | Separate repository `thegenlab/project-name` | GitHub repository; Pages disabled |

Existing external project websites keep their current URLs. Adding a new website should not change the frozen homepage design or another project’s layout. Create the project source folders with the first real new website; an empty `src/projects/` folder does not need to be tracked in Git.

## Architecture

Use one Astro app, one set of dependencies, one build and one deployment. Astro’s [file-based routing](https://docs.astro.build/en/guides/routing/) defines URLs through small files in `src/pages/`; each imports the corresponding website page from `src/projects/`. A folder in `src/projects/` does not create a URL by itself.

| Approach | Fit for this website |
| --- | --- |
| Native Astro routes and project source folders | Chosen: independent designs and assets with one familiar build and preview. |
| A separate app per project in a workspace | Useful only for an incompatible framework or dependency set; adds multiple builds and output assembly. |
| A custom routing or folder-copy pipeline | Adds conventions and tooling for behavior Astro already provides. |

All websites share dependency versions and build health: an error in one project blocks the shared deployment. Keep the full-site checks in CI.

## Add a project website

Choose a unique lowercase slug, such as `project-name`. Check that `src/pages/` and `public/` do not already publish that path. Keep Pages disabled in the separate `thegenlab/project-name` research repository. The names and text below are documentation placeholders; replace them with verified project information.

Create `src/projects/project-name/Home.astro` as a small, independent page:

```astro
---
const title = 'Paper title';
const description = 'Replace with a verified one-sentence project summary.';
---
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{title}</title>
    <meta name="description" content={description} />
    <link rel="canonical" href="https://thegenlab.ai/project-name/" />
  </head>
  <body>
    <main>
      <h1>{title}</h1>
      <p>{description}</p>
      <a href="https://github.com/thegenlab/project-name">Research code</a>
    </main>
  </body>
</html>
```

Create the thin route `src/pages/project-name/index.astro`:

```astro
---
import Home from '../../projects/project-name/Home.astro';
---
<Home />
```

That route produces `/project-name/`. Add the project’s verified authors, paper links, figures and design in its source folder. Add `Layout.astro`, `styles.css`, reusable components or content files only when needed; a single page does not require all of them. There is no project registry to update.

For an optional nested page, create `src/projects/project-name/Details.astro` and a wrapper at `src/pages/project-name/details/index.astro` importing it from `../../../projects/project-name/Details.astro`. Its URL is `/project-name/details/`.

Run `npm run verify`, then `npm run preview`. Inspect the landing page, any nested pages and their assets at their real URLs, including mobile. Publish with the existing workflow and check the live result; see [deployment](DEPLOYMENT.md). Add a verified entry to `src/content/publications.json` only when the project should appear on the homepage.

## Layout, styles and links

Each website owns its document structure and imports only its own styles and components. It can use a completely different composition from the homepage. Do not import the homepage layout or edit its styles just to create a project page. Extract a private layout when multiple pages need the same structure.

Astro component `<style>` blocks are [scoped by default](https://docs.astro.build/en/guides/styling/). An imported `.css` file is global within pages that load it: import it only from that project’s pages or private layout, and use a project-root class for broad rules when needed. Avoid a shared entry point that imports every project’s styles.

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
