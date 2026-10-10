# Publish GenLab at thegenlab.ai

The homepage is published from [thegenlab/thegenlab.github.io](https://github.com/thegenlab/thegenlab.github.io) using Astro, GitHub Actions, and GitHub Pages. The custom domain and Cloudflare DNS are configured. **Verified on 10 October 2026:** the homepage and the original static subpath test loaded over HTTPS with valid certificates, including their assets and nested links. `https://www.thegenlab.ai/` redirects to the apex. Enforce HTTPS is enabled. The test repository has since been converted into the code-and-website starter described below; its deployment, template setting, and strict HTTPS checks also passed.

The custom domain will also serve **new project websites** in separate organization repositories. Existing project websites and their current URLs remain unchanged; they are not being migrated as part of this setup.

## Current deployment

| Item | Recorded state |
| --- | --- |
| Production branch / initial homepage commit | `main` / `4e7bf6c` |
| Initial homepage deployment | Successful [Deploy GenLab run](https://github.com/thegenlab/thegenlab.github.io/actions/runs/38060611009) |
| Homepage Pages source | GitHub Actions (`build_type: workflow`) |
| Repository Pages custom domain | `thegenlab.ai` |
| Organization domain ownership | Verified; retain the GitHub challenge TXT record |
| Cloudflare website records | Four GitHub Pages apex A records and `www` CNAME; DNS only; TTL 300 seconds |
| HTTPS certificate | Approved for `thegenlab.ai` and `www.thegenlab.ai`; expires 8 January 2027 |
| Enforce HTTPS | Enabled |
| Project starter | Public `thegenlab/project-test`; `website/` Astro app; template enabled; Pages uses GitHub Actions with no project custom domain |
| Starter deployment | Commit `d58b97c`; successful [Project website run](https://github.com/thegenlab/project-test/actions/runs/38065228955); landing page, nested page, CSS and SVG verified over HTTPS |

## Publish homepage updates

1. Make and review changes in the existing repository. Run `npm run verify` and inspect the desktop and mobile layouts.
2. Open a pull request when review is useful. The **Check site** workflow validates pull requests with read-only repository permissions.
3. Merge or push the approved source to `main`. **Deploy GenLab** installs locked dependencies with `npm ci`, checks Astro and content types, builds the static site, verifies generated output, and publishes `dist`.
4. Confirm the deployment succeeds in [Actions](https://github.com/thegenlab/thegenlab.github.io/actions). Check `https://thegenlab.ai/` and the changed content in a browser.

If a deployment needs to be repeated, use **Actions → Deploy GenLab → Run workflow** on `main`. The repository's [Settings → Pages](https://github.com/thegenlab/thegenlab.github.io/settings/pages) source should remain **GitHub Actions**. Only the deployment job has permission to publish Pages. No personal access token or Cloudflare API token is needed in these workflows. GitHub's hosted Ubuntu runner uses Node 24.

Astro is configured with `site: 'https://thegenlab.ai'`, static output, and no repository `base` prefix. Keep this homepage at the domain root. See the [Astro Pages guide](https://docs.astro.build/en/guides/deploy/github/).

## Domain ownership and custom-domain setting

The **thegenlab organization Settings → Pages** domain verification is complete. Preserve the TXT record named `_github-pages-challenge-thegenlab` in the `thegenlab.ai` Cloudflare zone, together with its existing challenge value. The complete record name is `_github-pages-challenge-thegenlab.thegenlab.ai`. The value is available in the organization's Pages settings and Cloudflare; it does not need to be duplicated in this repository. See [GitHub's domain-verification guide](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/verifying-your-custom-domain-for-github-pages).

The homepage repository's **Settings → Pages → Custom domain** is already `thegenlab.ai`. This setting is authoritative for the custom Actions deployment. There is no `public/CNAME` file in the homepage source, and none is required for this workflow. See [GitHub's custom-domain instructions](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site).

## Cloudflare DNS configuration

The following website records are configured in **thegenlab.ai → DNS → Records**. Their proxy status is **DNS only** (gray cloud), with **TTL 300 seconds**. Keep these values when maintaining the current GitHub Pages setup.

| Type | Name | Content | Proxy status | TTL |
| --- | --- | --- | --- | --- |
| A | `@` | `185.199.108.153` | DNS only | 300 |
| A | `@` | `185.199.109.153` | DNS only | 300 |
| A | `@` | `185.199.110.153` | DNS only | 300 |
| A | `@` | `185.199.111.153` | DNS only | 300 |
| CNAME | `www` | `thegenlab.github.io` | DNS only | 300 |

The organization-verification TXT record described above is separate from these website records. Preserve it and any unrelated TXT or email records. Do not add wildcard records or per-project DNS records for URL subpaths. Cloudflare's [record instructions](https://developers.cloudflare.com/dns/manage-dns-records/how-to/create-dns-records/) and [proxy guidance](https://developers.cloudflare.com/dns/proxy-status/use-cases/) explain the controls. The addresses above are [GitHub's published Pages DNS values](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site).

Optional IPv6 records, if added later, are all four of the following; they are not part of the recorded IPv4 setup above:

| Type | Name | Content |
| --- | --- | --- |
| AAAA | `@` | `2606:50c0:8000::153` |
| AAAA | `@` | `2606:50c0:8001::153` |
| AAAA | `@` | `2606:50c0:8002::153` |
| AAAA | `@` | `2606:50c0:8003::153` |

## HTTPS and redirects

The certificate covers both hostnames, and **Enforce HTTPS** is enabled in repository **Settings → Pages**. Strict certificate checks passed for the homepage, its stylesheet, illustration and research images, and the original static test project's root page, nested page, CSS and SVG. The live homepage and original test pages were also inspected in a browser. The replacement Astro starter subsequently passed strict HTTPS requests for its landing page, nested page, stylesheet and SVG, with downloaded bytes matching the built files. Its live landing page was inspected in a browser, and clicking through to the nested page succeeded with the stylesheet and SVG loaded. See [GitHub's HTTPS guidance](https://docs.github.com/en/pages/getting-started-with-github-pages/securing-your-github-pages-site-with-https).

After any future hosting changes, check that:

- `https://thegenlab.ai/` renders correctly with a valid certificate.
- `http://thegenlab.ai/` redirects to HTTPS.
- `https://www.thegenlab.ai/` redirects to the apex domain without a certificate warning.
- Project pages, nested links, and assets still work at their repository paths.

GitHub supplies the `www`/apex redirect; a separate Cloudflare redirect rule is unnecessary. See [GitHub's redirect behavior](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/about-custom-domains-and-github-pages). Newly changed redirect settings can take time to reach cached responses.

The website setup does not create email mailboxes. Only publish `contact@thegenlab.ai` once email routing or a mailbox has been configured and tested.

## New project websites under the same domain

For future projects, keep the research code and project website in **one public repository under thegenlab**, for example `thegenlab/project_name`. Place the Astro app in `website/` and deploy only its built output. The repository's Pages site inherits `https://thegenlab.ai/project_name/` from the organization homepage's custom domain; `website/` is a source folder and does not appear in the public URL. GitHub documents this [custom-domain inheritance across repositories](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/about-custom-domains-and-github-pages#using-a-custom-domain-across-multiple-repositories).

For every new project:

1. Use **Use this template → Create a new repository** on [thegenlab/project-test](https://github.com/thegenlab/project-test). Choose **thegenlab** as the owner, a new project name, public visibility, and the default branch only. Keep research code alongside the `website/` app in that same repository.
2. Replace the example content and assets with verified project material. The template keeps its fake-project labels and `noindex` metadata; remove those only when preparing a real project for publication. Creating a repository from a template does not rewrite its content for the new project.
3. In the new repository's **Settings → Pages**, select **GitHub Actions** as the source. Leave **Custom domain** empty and omit any project `CNAME` file. A project-specific custom domain overrides the inherited address.
4. Add no DNS records for `/project_name/`; the existing apex records already cover the domain. DNS does not route URL subpaths.
5. Use the exact repository name as the URL path. The starter workflow passes it as `PROJECT_SLUG`; internal links and assets must use Astro's configured base. Publish the project's `website/dist/` independently from this homepage.
6. Run the `website.yml` workflow on `main` after enabling Pages, or push a website change to `main`. Pull requests check the website but do not deploy it. Research-code-only pushes to `main` do not deploy the website.
7. Check the deployed project, including at least one nested page and its assets, before adding its new URL to this homepage's `src/content/publications.json`.

Pages setup is a per-repository step. A repository created from a template starts with a new commit history and does not automatically receive later template changes. See [GitHub's repository-template guide](https://docs.github.com/en/repositories/creating-and-managing-repositories/creating-a-repository-from-a-template) and [Pages publishing-source instructions](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site).

Publicly accessible Pages sites inherit the organization domain; privately published Pages sites do not. Keep existing project repositories, domains, and homepage links at their current addresses unless the owner separately requests a migration.

### Astro project configuration

The starter builds Astro from `website/`. Its workflow sets `PROJECT_SLUG` to `${{ github.event.repository.name }}`, so a new repository gets its own URL prefix without editing the deployment workflow. The configuration in **that project's `website/astro.config.mjs`** follows this pattern:

```js
import { defineConfig } from 'astro/config';

const projectSlug = process.env.PROJECT_SLUG || 'project-test';

export default defineConfig({
  site: 'https://thegenlab.ai',
  base: `/${projectSlug}/`,
  output: 'static',
  trailingSlash: 'always',
});
```

For local checks of a new project, set `PROJECT_SLUG` to its exact repository name, for example `PROJECT_SLUG=project_name npm run build` from `website/`; the example fallback is only for the test project. Ensure manually written internal links and public asset URLs include the base, for example `${import.meta.env.BASE_URL}images/teaser.jpg`. Keep the prefix when using the inherited organization domain. See Astro's [base configuration](https://docs.astro.build/en/reference/configuration-reference/#base) and [Pages project-path guidance](https://docs.astro.build/en/guides/deploy/github/#how-to-deploy). Other frameworks need their equivalent path setting.

For a plain HTML site, explicit prefixed paths such as `/project_name/assets/site.css` and `/project_name/nested/` work from both the root page and nested pages. Relative paths are also possible, but must account for each page's depth.

Reserve each project path for that project's deployment: do not generate a page or copy a folder with the same name into this homepage's build. Keep this homepage's `base` unset. Changing the homepage should not require rebuilding project websites.

### Code-and-website starter

The separate [thegenlab/project-test](https://github.com/thegenlab/project-test) repository has been converted from the original root-level HTML test into a reusable starter with this structure:

```text
.github/workflows/website.yml
website/
  package.json
  package-lock.json
  astro.config.mjs
  src/
  public/
```

Research code belongs elsewhere in the same repository. The workflow runs website checks on pull requests; changes to `website/**` or `.github/workflows/website.yml` on `main` also deploy. `workflow_dispatch` allows a manual run. Only `website/dist/` is uploaded to Pages. Keep the workflow at the repository root, even though the Astro app is in a subdirectory.

The confirmed settings are **Pages → GitHub Actions** (`build_type: workflow`), an empty project **Custom domain** (`cname: null`), and **Template repository** enabled (`is_template: true`). This replaces the old branch-based root publishing configuration. No `CNAME` or additional DNS record is needed.

Its inherited address remains `https://thegenlab.ai/project-test/`. Keep the example visibly labeled as fake/test content and retain `noindex`; it is not a lab publication and should not appear in Selected research.

The successful [Project website run](https://github.com/thegenlab/project-test/actions/runs/38065228955) deployed commit `d58b97c83f582daccdae69b9cd67039e33e38b99`. Post-deployment checks on 10 October 2026 returned **200 with valid TLS** for the landing page, nested page, stylesheet and SVG; all four responses matched the files in `website/dist/` byte for byte. Browser inspection also confirmed the landing page, navigation to the nested page, and loaded styles and SVG. Both pages retain `noindex`. Repository-only `code/README.md` and `README.md` return **404 at their project-site URLs**, confirming that those source files were not published. The GenLab homepage also remained available with a **200** response. Repeat these checks and inspect the browser layout when adapting the starter for a real project.

## Workflow versions

The deployed workflows use the following exact action releases, checked against their official GitHub release pages on 10 October 2026:

| Action | Version |
| --- | --- |
| [actions/checkout](https://github.com/actions/checkout/releases/tag/v7.0.1) | `v7.0.1` |
| [actions/setup-node](https://github.com/actions/setup-node/releases/tag/v7.1.0) | `v7.1.0` |
| [actions/configure-pages](https://github.com/actions/configure-pages/releases/tag/v6.0.0) | `v6.0.0` |
| [actions/upload-pages-artifact](https://github.com/actions/upload-pages-artifact/releases/tag/v5.0.0) | `v5.0.0` |
| [actions/deploy-pages](https://github.com/actions/deploy-pages/releases/tag/v5.0.1) | `v5.0.1` |
