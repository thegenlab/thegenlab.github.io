# GenLab

A compact academic homepage for **GenLab**, led by Prof. Zhen Liu. Built with Astro and deployed as a static site to GitHub Pages at **https://thegenlab.ai**.

This is the **one shared website repository** for the GenLab homepage and all new project websites. The homepage introduces the lab, presents selected research in a horizontal carousel, and lists the team and external collaborators. New project pages live in `public/<project>/` and appear at `thegenlab.ai/<project>/`. Research code lives separately in `thegenlab/<project>`, with Pages disabled. Existing project websites and their current URLs remain unchanged; the PI’s personal site remains the full research record.

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
| New project websites | `public/<project>/` |

Every content entry has a unique `id`. Astro validates entries at build time. For projects, `featured: true` includes an entry in Selected research; lower `order` values appear first. The carousel supports more than three projects without changing the layout. Use distinct order values for predictable placement. The first link is the project destination; remaining links typically point to the paper and code. Images belong in `public/images/` and need descriptive `imageAlt` text. `imageFit` can be `contain` (show the whole figure) or `cover` (fill the preview).

The compact Team section reads `people.json` in ascending `order`. The initial roster contains the ten current members listed on the PI’s personal website; add or update members once their names, roles, and details have been confirmed. Keep the existing `group`, `initials`, and `bio` fields when editing a person, as these remain part of the content schema. Use verified personal or institutional links.

External collaborators are maintained separately in `collaborators.json` and sorted by `order`. Each entry needs `id`, `name`, and `affiliation`; use `order` to set its position. The optional `links` array uses `{ "label": "Personal website", "url": "https://…" }` entries. Omit it when no link has been confirmed. The initial four names and affiliations were supplied by the lab owner.

The `news.json` file and its schema are retained, but news is not currently rendered on the homepage. Editing it does not add a visible announcement.

After updating content, run `npm run verify` and inspect desktop and mobile previews. When adding projects, check that the final carousel item is reachable and its links work. Record sources for new figures and factual project details in `docs/CONTENT-SOURCES.md`.

## Hosting

[thegenlab/thegenlab.github.io](https://github.com/thegenlab/thegenlab.github.io) publishes the homepage and all new project websites through the existing Astro/GitHub Actions workflow. Pull requests are checked; pushes to `main` build the shared site and publish `dist/` to GitHub Pages. The repository's custom domain is `thegenlab.ai`, organization ownership is verified, and Cloudflare's apex and `www` records are configured. No personal access token or Cloudflare API token is needed by the workflows.

**Verified on 10 October 2026:** the homepage and its assets loaded over HTTPS with valid certificates, and `https://www.thegenlab.ai/` redirected to the apex. Enforce HTTPS is enabled. See [deployment status and DNS records](docs/DEPLOYMENT.md).

For a new project, add standalone HTML and assets to `public/<project>/`, starting with `index.html`. Astro copies these files unchanged into `dist/<project>/`, producing `https://thegenlab.ai/<project>/`. Keep the shared Astro `base` unset, use links and asset paths that work within the project's directory, and deploy through this repository. No per-project website repository, DNS record, CNAME, or custom-domain setting is needed.

Keep the research implementation in `thegenlab/<project>` and link to it from the project page. **Leave GitHub Pages disabled in code repositories** so a separate project Pages site cannot override the shared website's route. Existing research repositories and project URLs are not being migrated.

The fake example lives in `public/project-test/`, including its nested page, stylesheet and SVG. It retains its test labels and `noindex, nofollow` and must not appear in Selected research. On **11 October 2026**, the shared deployment and live HTTPS checks passed after the old separate test site's Pages configuration was removed. That obsolete repository is now archived, with its workflow disabled and template setting off. See [new project setup](docs/DEPLOYMENT.md#new-project-websites-in-this-repository).

## Design and assets

The homepage uses locally served **IBM Plex Sans** from `public/fonts/plex-sans.woff2`; its license is included in `public/fonts/OFL.txt`. The introduction pairs “Understand. Create.” with `src/assets/concept-room.png`, which Astro optimizes into responsive images at build time. The illustration prompt is recorded in `docs/ILLUSTRATION-PROMPT.txt`.

Project figures come from the linked research websites; their source credits and factual verification are recorded in [content sources](docs/CONTENT-SOURCES.md). These research assets retain their authors’ rights. Keep the Team and External collaborators sections compact, using names, roles or affiliations, and confirmed links.

The carousel uses native horizontal scrolling, with JavaScript adding previous/next buttons and keyboard navigation. It does not advance automatically, respects reduced-motion preferences, and remains scrollable without JavaScript. Keep all project content available in the page. Give each project its own directory, and avoid defining the same route in both `src/pages/` and `public/`.
