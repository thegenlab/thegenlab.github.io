# Project websites

This directory holds the source and assets for new project websites served at `https://thegenlab.ai/<project>/`. Research code belongs in separate GitHub repositories directly under `thegenlab`, such as `thegenlab/projectA`.

For a new website, the minimum source is:

```text
src/projects/projectA/Home.astro     # The webpage and its design
src/pages/projectA/index.astro       # The route for /projectA/
```

Keep project media in `src/projects/projectA/assets/`. Add styles, components and a shared layout only when needed. Each project can have its own visual design.

See the [project website guide](../../docs/PROJECTS.md) for a complete starter page, route imports, assets, nested pages and deployment instructions.

No project websites are stored here yet. This README keeps the directory visible in Git; it does not create a published page.
