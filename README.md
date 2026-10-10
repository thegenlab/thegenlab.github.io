# GenLab

A compact academic homepage for **GenLab**, led by Prof. Zhen Liu. Built with Astro and deployed as a static site to GitHub Pages at **https://thegenlab.ai**.

The homepage introduces the lab with a conceptual illustration, presents selected research in a horizontal carousel, and lists the team and external collaborators. Each new project can keep its research code and a `website/` Astro app in one organization repository, with the site at `thegenlab.ai/project_name/`; the PI’s personal site remains the full research record. Existing project websites and their current URLs remain unchanged.

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

Every content entry has a unique `id`. Astro validates entries at build time. For projects, `featured: true` includes an entry in Selected research; lower `order` values appear first. The carousel supports more than three projects without changing the layout. Use distinct order values for predictable placement. The first link is the project destination; remaining links typically point to the paper and code. Images belong in `public/images/` and need descriptive `imageAlt` text. `imageFit` can be `contain` (show the whole figure) or `cover` (fill the preview).

The compact Team section reads `people.json` in ascending `order`. The initial roster contains the ten current members listed on the PI’s personal website; add or update members once their names, roles, and details have been confirmed. Keep the existing `group`, `initials`, and `bio` fields when editing a person, as these remain part of the content schema. Use verified personal or institutional links.

External collaborators are maintained separately in `collaborators.json` and sorted by `order`. Each entry needs `id`, `name`, and `affiliation`; use `order` to set its position. The optional `links` array uses `{ "label": "Personal website", "url": "https://…" }` entries. Omit it when no link has been confirmed. The initial four names and affiliations were supplied by the lab owner.

The `news.json` file and its schema are retained, but news is not currently rendered on the homepage. Editing it does not add a visible announcement.

After updating content, run `npm run verify` and inspect desktop and mobile previews. When adding projects, check that the final carousel item is reachable and its links work. Record sources for new figures and factual project details in `docs/CONTENT-SOURCES.md`.

## Hosting

The homepage was published from `main` commit `4e7bf6c` by the successful [Deploy GenLab run](https://github.com/thegenlab/thegenlab.github.io/actions/runs/38060611009). GitHub Pages uses **GitHub Actions** (`build_type: workflow`) and the repository's custom-domain setting is `thegenlab.ai`. Organization domain ownership is verified, and Cloudflare's apex and `www` records are configured.

**Verified on 10 October 2026:** the homepage and original static subpath test loaded over HTTPS with valid certificates, including their images, stylesheets, and nested links. `https://www.thegenlab.ai/` redirects to the apex. Enforce HTTPS is enabled. The test repository's replacement Astro starter has also deployed successfully and passed strict HTTPS checks against its built files. See [deployment status, DNS records, and project setup](docs/DEPLOYMENT.md).

The workflow validates pull requests and publishes pushes to `main`. The Pages custom-domain setting is authoritative for this Actions deployment; this repository has no `public/CNAME` file. No personal access token or Cloudflare API token is needed by the workflows. No backend, external font service, tracking, or form service is needed.

Use the custom domain for **new** project repositories. A public Pages site in `thegenlab/project_name` inherits `https://thegenlab.ai/project_name/`; leave that project's Custom domain field empty and do not add a project `CNAME` file. Subpaths need no additional DNS records. Configure each project's links and assets for its repository path. Existing projects are not being migrated, and their homepage links should keep their current destinations.

The separate [project-test repository](https://github.com/thegenlab/project-test) is a reusable code-and-website starter with **Template repository** enabled. Research code stays in the same repository as a `website/` Astro app; the root `.github/workflows/website.yml` checks pull requests and deploys only `website/dist/` for website or workflow changes on `main`. It also supports manual runs. `PROJECT_SLUG` comes from the repository name, so each new project receives its own URL prefix.

Create a new **public** repository under **thegenlab** using that template, enable **Pages → GitHub Actions**, and leave **Custom domain** empty. The starter retains fake-project labels and `noindex`; replace its sample content before publishing a real project. It is not a publication and should not appear in Selected research.

The successful [Project website run](https://github.com/thegenlab/project-test/actions/runs/38065228955) deployed starter commit `d58b97c`. Its landing page, nested page, stylesheet and SVG returned 200 over verified HTTPS and matched the built files byte for byte. Both pages retain `noindex`; repository README files are excluded from the deployed site. See the [starter setup and verification steps](docs/DEPLOYMENT.md#new-project-websites-under-the-same-domain).

## Design and assets

The homepage uses locally served **IBM Plex Sans** from `public/fonts/plex-sans.woff2`; its license is included in `public/fonts/OFL.txt`. The introduction pairs “Understand. Create.” with `src/assets/concept-room.png`, which Astro optimizes into responsive images at build time. The illustration prompt is recorded in `docs/ILLUSTRATION-PROMPT.txt`.

Project figures come from the linked research websites; their source credits and factual verification are recorded in [content sources](docs/CONTENT-SOURCES.md). These research assets retain their authors’ rights. Keep the Team and External collaborators sections compact, using names, roles or affiliations, and confirmed links.

The carousel uses native horizontal scrolling, with JavaScript adding previous/next buttons and keyboard navigation. It does not advance automatically, respects reduced-motion preferences, and remains scrollable without JavaScript. Keep all project content available in the page. Avoid adding homepage routes that collide with separately hosted project repositories.
