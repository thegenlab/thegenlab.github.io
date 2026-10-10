# Publish GenLab at thegenlab.ai

**One repository, [thegenlab/thegenlab.github.io](https://github.com/thegenlab/thegenlab.github.io), hosts the homepage and all new project websites.** One Astro app builds the homepage and explicit project routes from `src/pages/` into `dist/`. Each project website keeps its implementation and assets in `src/projects/<project>/`. These folders contain website source, not research implementations. The existing GitHub Actions workflow publishes the complete `dist/` directory to GitHub Pages.

Research code belongs directly under the GitHub organization in separate repositories such as `thegenlab/<project>`, with **Pages disabled**. Project pages link to those code repositories. Existing project websites and their current URLs remain unchanged.

**Verified on 10 October 2026:** the homepage and its assets loaded over HTTPS with valid certificates, and `https://www.thegenlab.ai/` redirected to the apex. Enforce HTTPS is enabled.

## Current deployment

| Item | Recorded state |
| --- | --- |
| Production branch / initial homepage commit | `main` / `4e7bf6c` |
| Initial homepage deployment | Successful [Deploy GenLab run](https://github.com/thegenlab/thegenlab.github.io/actions/runs/38060611009) |
| Shared website Pages source | GitHub Actions (`build_type: workflow`) |
| Repository Pages custom domain | `thegenlab.ai` |
| Organization domain ownership | Verified; retain the GitHub challenge TXT record |
| Cloudflare website records | Four GitHub Pages apex A records and `www` CNAME; DNS only; TTL 300 seconds |
| HTTPS certificate | Approved for `thegenlab.ai` and `www.thegenlab.ai`; expires 8 January 2027 |
| Enforce HTTPS | Enabled |

## Publish website updates

1. Make and review changes in the existing repository. Run `npm run verify` and inspect the desktop and mobile layouts.
2. Open a pull request when review is useful. The **Check site** workflow validates pull requests with read-only repository permissions.
3. Merge or push the approved source to `main`. **Deploy GenLab** installs locked dependencies with `npm ci`, checks Astro and content types, builds the static site, verifies generated output, and publishes `dist`.
4. Confirm the deployment succeeds in [Actions](https://github.com/thegenlab/thegenlab.github.io/actions). Check `https://thegenlab.ai/` and every changed project page, nested link and asset in a browser.

If a deployment needs to be repeated, use **Actions → Deploy GenLab → Run workflow** on `main`. The repository's [Settings → Pages](https://github.com/thegenlab/thegenlab.github.io/settings/pages) source should remain **GitHub Actions**. Only the deployment job has permission to publish Pages. No personal access token or Cloudflare API token is needed in these workflows. GitHub's hosted Ubuntu runner uses Node 24.

Astro is configured with `site: 'https://thegenlab.ai'`, static output, and no repository `base` prefix. Keep this root configuration for the whole shared website. See the [Astro Pages guide](https://docs.astro.build/en/guides/deploy/github/).

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

The certificate covers both hostnames, and **Enforce HTTPS** is enabled in repository **Settings → Pages**. On 10 October 2026, strict certificate checks passed for the homepage, its stylesheet, illustration and research images; the live homepage was also inspected in a browser. Check new project paths after their shared deployment. See [GitHub's HTTPS guidance](https://docs.github.com/en/pages/getting-started-with-github-pages/securing-your-github-pages-site-with-https).

After any future hosting changes, check that:

- `https://thegenlab.ai/` renders correctly with a valid certificate.
- `http://thegenlab.ai/` redirects to HTTPS.
- `https://www.thegenlab.ai/` redirects to the apex domain without a certificate warning.
- Project pages, nested links, and assets work at their `/<project>/` paths.

GitHub supplies the `www`/apex redirect; a separate Cloudflare redirect rule is unnecessary. See [GitHub's redirect behavior](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/about-custom-domains-and-github-pages). Newly changed redirect settings can take time to reach cached responses.

The website setup does not create email mailboxes. Only publish `contact@thegenlab.ai` once email routing or a mailbox has been configured and tested.

## New project websites in this repository

Use native Astro routes: `src/pages/<project>/index.astro` imports that website’s landing page from `src/projects/<project>/`. Nested page files define nested URLs. Each website owns its design and assets; all websites share the existing root dependencies, build and deployment. Create project source and route folders when adding a real project; no empty scaffold is required. See the [project website guide](PROJECTS.md) for the structure and setup recipe. Reserve `public/` for files that must be served unchanged at stable URLs, not authored page source.

Keep the root Astro `base` unset and the existing `thegenlab.ai` custom domain on this repository. A project needs no new DNS record, CNAME, custom domain, routing registry or deployment workflow. Run `npm run verify`, inspect the actual `/<project>/` paths locally, then publish through **Deploy GenLab** and check the live pages and assets.

Research code remains in a separate repository directly under `thegenlab`, for example `thegenlab/project-name`; the website source remains here. **Keep Pages disabled in research-code repositories.** A separately published project Pages site can claim the same URL path and shadow the shared website’s route. Link to the code repository from the website. Existing external project sites keep their current URLs.

After a real project website is verified, add its URL and code link to `src/content/publications.json` if it should appear in Selected research.

## Workflow versions

The deployed workflows use the following exact action releases, checked against their official GitHub release pages on 10 October 2026:

| Action | Version |
| --- | --- |
| [actions/checkout](https://github.com/actions/checkout/releases/tag/v7.0.1) | `v7.0.1` |
| [actions/setup-node](https://github.com/actions/setup-node/releases/tag/v7.1.0) | `v7.1.0` |
| [actions/configure-pages](https://github.com/actions/configure-pages/releases/tag/v6.0.0) | `v6.0.0` |
| [actions/upload-pages-artifact](https://github.com/actions/upload-pages-artifact/releases/tag/v5.0.0) | `v5.0.0` |
| [actions/deploy-pages](https://github.com/actions/deploy-pages/releases/tag/v5.0.1) | `v5.0.1` |
