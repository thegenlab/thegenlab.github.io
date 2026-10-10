# GenLab

A compact academic homepage for **GenLab**, led by Prof. Zhen Liu. Built with Astro and deployed as a static site to GitHub Pages at **https://thegenlab.ai**.

This is the **one shared website repository** for the GenLab homepage and all new project websites. The homepage introduces the lab, presents selected research in a horizontal carousel, and lists the team and external collaborators. New project website source lives in `src/projects/<project>/`, with explicit routes in `src/pages/<project>/`, and appears at `thegenlab.ai/<project>/`. Research implementations live directly under the GitHub organization in separate repositories such as `thegenlab/<project>`, with Pages disabled. The tracked `src/projects/` directory contains website code and assets only; research code stays in its own repository. Existing project websites and their current URLs remain unchanged; the PI’s personal site remains the full research record.

## Repository structure

```text
src/
  pages/
    index.astro                 # Lab homepage
    404.astro                   # Not-found page
  projects/
    README.md                   # Start here for new project websites
  content/                      # Selected research, people, collaborators
  assets/                       # Homepage illustration source
  layouts/                      # Homepage layout
  styles/                       # Homepage styles
public/                         # Files served unchanged: fonts, images, downloads
scripts/                        # Build verification
docs/                           # Project setup, deployment, content sources
```

The existing [projects directory](src/projects/) is the home for new project website source. Astro's `src/pages/` directory defines the URLs; `src/projects/` holds the corresponding page implementations and assets.

## Add a project website

For a new page at `https://thegenlab.ai/projectA/`, add:

```text
src/
  pages/projectA/index.astro    # Defines /projectA/
  projects/projectA/
    Home.astro                 # Actual webpage, with its own design
    assets/                    # Optional figures, images and videos
```

Only `Home.astro` and the route file are required. The route file `src/pages/projectA/index.astro` contains:

```astro
---
import Home from '../../projects/projectA/Home.astro';
---
<Home />
```

Put the page content and design in `Home.astro`. Add a separate stylesheet, layout or components when useful. For `/projectA/demo/`, add `src/projects/projectA/Demo.astro` and a route at `src/pages/projectA/demo/index.astro`. Follow the [complete project website guide](docs/PROJECTS.md) for a starter page, asset handling and nested routes. These paths are examples; no example project is published.

The research implementation belongs in the separate GitHub repository **`thegenlab/projectA`**, with Pages disabled. All website files stay here. Run `npm run verify` and preview the page; pushing to `main` uses the existing deployment. No new DNS record or workflow is needed.

## Development

Use Node.js 24 (see `.nvmrc`).

```sh
npm ci
npm run dev
```

Astro serves the local preview at `http://127.0.0.1:4321`.

```sh
npm run verify
npm run preview
```

`verify` checks Astro and the content schema, builds the static site, and checks generated anchors, assets and metadata. `preview` serves the production build.

## Updating content

Edit these files without changing the layout:

| Content | File |
| --- | --- |
| Featured projects / papers | `src/content/publications.json` |
| Team | `src/content/people.json` |
| External collaborators | `src/content/collaborators.json` |
| Lab details | `src/data/site.ts` |
| Homepage introduction | `src/pages/index.astro` |
| New project website source | `src/projects/<project>/` |
| New project URL routes | `src/pages/<project>/` |

Every content entry has a unique `id`. Astro validates entries at build time. For projects, `featured: true` includes an entry in Selected research; lower `order` values appear first. The carousel supports more than three projects without changing the layout. Use distinct order values for predictable placement. The first link is the project destination; remaining links typically point to the paper and code. Homepage carousel images belong in `public/images/` and need descriptive `imageAlt` text. `imageFit` can be `contain` (show the whole figure) or `cover` (fill the preview).

The compact Team section groups `people.json` into Faculty, Core members, and Research assistants & visiting students, preserving ascending `order` within each group. Only PhD and MPhil students belong to the `Students` group displayed as Core members; the content schema enforces this. Research assistants and visiting students keep their separate group regardless of degree level. Add or update members using confirmed names, roles, and affiliations, and only include verified personal or institutional links.

External collaborators are maintained separately in `collaborators.json` and sorted by `order`. Each entry needs `id`, `name`, and `affiliation`; use `order` to set its position. The optional `links` array uses `{ "label": "Personal website", "url": "https://…" }` entries. Omit it when no link has been confirmed. The initial four names and affiliations were supplied by the lab owner.

After updating content, run `npm run verify` and inspect desktop and mobile previews. When adding projects, check that the final carousel item is reachable and its links work. Record sources for new figures and factual project details in `docs/CONTENT-SOURCES.md`.

## Hosting

[thegenlab/thegenlab.github.io](https://github.com/thegenlab/thegenlab.github.io) publishes the homepage and all new project websites through the existing Astro/GitHub Actions workflow. Pull requests are checked; pushes to `main` build the shared site and publish `dist/` to GitHub Pages. The repository's custom domain is `thegenlab.ai`, organization ownership is verified, and Cloudflare's apex and `www` records are configured. No personal access token or Cloudflare API token is needed by the workflows.

**Verified on 10 October 2026:** the homepage and its assets loaded over HTTPS with valid certificates, and `https://www.thegenlab.ai/` redirected to the apex. Enforce HTTPS is enabled. See [deployment status and DNS records](docs/DEPLOYMENT.md).

For a new project, create its website source and assets in `src/projects/<project>/`, and add thin Astro page files in `src/pages/<project>/` to define its URLs. Each website can have its own design; add shared layout or component files only when useful. One Astro build publishes everything. Reserve `public/` for files that need unchanged contents or stable filenames, not authored page source. No per-project website repository, DNS record, CNAME, custom-domain setting or deployment workflow is needed. See the [project website guide](docs/PROJECTS.md) for the folder structure and a short setup recipe.

Keep the research implementation in `thegenlab/<project>` and link to it from the project page. **Leave GitHub Pages disabled in code repositories** so a separate project Pages site cannot override the shared website's route. Existing research repositories and project URLs are not being migrated.

## Design and assets

The homepage uses locally served **IBM Plex Sans** from `public/fonts/plex-sans.woff2`; its license is included in `public/fonts/OFL.txt`. The introduction pairs “Understand. Create.” with `src/assets/concept-room.png`, which Astro optimizes into responsive images at build time. The illustration prompt is recorded in `docs/ILLUSTRATION-PROMPT.txt`.

Project figures come from the linked research websites; their source credits and factual verification are recorded in [content sources](docs/CONTENT-SOURCES.md). These research assets retain their authors’ rights. Keep the Team and External collaborators sections compact, using names, roles or affiliations, and confirmed links.

The carousel uses native horizontal scrolling, with JavaScript adding previous/next buttons and keyboard navigation. It does not advance automatically, respects reduced-motion preferences, and remains scrollable without JavaScript. Keep all project content available in the page. Keep each project website’s layout and styles independent of the homepage. The [project website guide](docs/PROJECTS.md) explains asset imports, nested routes and style isolation.
