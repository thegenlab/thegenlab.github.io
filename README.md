# GenLab

A compact academic homepage for **GenLab**, led by Prof. Zhen Liu at The Chinese University of Hong Kong, Shenzhen. Built with Astro and deployed as a static site to GitHub Pages at **https://thegenlab.ai**.

The homepage introduces the lab and highlights a small selection of research projects. Individual project websites can live in their own organization repositories at `thegenlab.ai/project-name/`; the PI’s personal site remains the full research record.

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
| People | `src/content/people.json` |
| News | `src/content/news.json` |
| Lab details | `src/data/site.ts` |
| Homepage introduction | `src/pages/index.astro` |

Every content entry has a unique `id`. Astro validates entries at build time. For projects, `featured: true` shows an entry on the homepage; `order` controls its position. Keep the selection short (three is the intended layout). The first link is the project destination; remaining links typically point to the paper and code. Images belong in `public/images/` and need descriptive `imageAlt` text. `imageFit` can be `contain` (show the whole figure) or `cover` (fill the preview).

People are sorted by `order`. Only the verified PI is included initially; add confirmed members with their own links. News is optional: the section stays hidden while the array is empty, filters out future dates and shows at most three entries. A future-dated item appears only after the next build on/after its date.

Example news entry (replace all example content before use):

```json
{
  "id": "unique-news-slug",
  "title": "Confirmed announcement title",
  "date": "2026-10-10",
  "description": "A concise, verified update.",
  "url": "https://example.com/announcement"
}
```

## Hosting

See [deployment and Cloudflare setup](docs/DEPLOYMENT.md). GitHub Pages must be enabled in repository settings before the deploy workflow can succeed. The custom domain must be saved in Pages settings; adding a CNAME file does not configure an Actions-based deployment.

The workflow validates pull requests and publishes pushes to `main`. No backend, external font service, tracking, or form service is needed.

## Design and assets

The homepage uses locally bundled Manrope and Newsreader fonts (their licenses ship with their packages). The green geometric illustration and favicon are original procedural SVGs; regenerate them with `node scripts/generate-art.mjs`. Project figures come from the linked research websites; their source credits and factual verification are recorded in [content sources](docs/CONTENT-SOURCES.md). These research assets retain their authors’ rights.

Respect reduced-motion preferences. Navigation and all content remain usable without JavaScript; JavaScript only collapses the mobile navigation. Avoid adding homepage routes that collide with separately hosted project repositories.
