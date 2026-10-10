# Publish GenLab at thegenlab.ai

**One repository, [thegenlab/thegenlab.github.io](https://github.com/thegenlab/thegenlab.github.io), hosts the homepage and all new project websites.** Astro builds the homepage and copies each standalone project site from `public/<project>/` into `dist/<project>/`. The existing GitHub Actions workflow publishes the complete `dist/` directory to GitHub Pages.

Research code belongs in separate `thegenlab/<project>` repositories with **Pages disabled**. Project pages link to those code repositories. Existing project websites and their current URLs remain unchanged.

**Verified on 10 October 2026:** the homepage and its assets loaded over HTTPS with valid certificates, and `https://www.thegenlab.ai/` redirected to the apex. Enforce HTTPS is enabled. On **11 October 2026**, the fake example was deployed from this shared repository and passed live HTTPS checks after the old standalone Pages site was disabled.

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
| Shared project test | `public/project-test/` → `https://thegenlab.ai/project-test/`; verified from the shared deployment |
| Old separate test repository | Archived recoverably; Pages removed, deployment workflow disabled, template setting off |

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

Create a directory under `public/` for each new project. For example:

```text
public/project-name/
  index.html
  styles.css
  assets/
    teaser.webp
  nested/
    index.html
```

This produces `https://thegenlab.ai/project-name/` and `https://thegenlab.ai/project-name/nested/`. Astro copies `public/` files unchanged to the build output, so these pages are ordinary HTML with their own CSS and assets. They do not require another Astro app or project-specific deployment workflow. See [Astro's public-directory documentation](https://docs.astro.build/en/basics/project-structure/#public).

For each project:

1. Add verified project content and assets to `public/<project>/`. Only place files intended for publication there; Astro copies everything in that directory into the deployed site.
2. Use paths that work from each page. For example, the landing page can load `styles.css` and `assets/teaser.webp`; a nested page can use `../styles.css`, `../assets/teaser.webp`, and `../` to return. Explicit `/<project>/...` paths also work. Do not create a duplicate route under `src/pages/`.
3. Keep research code in its own `thegenlab/<project>` repository and link to that repository from the page. **Keep Pages disabled in the code repository.** A separately published Pages site with the same project name can take over that URL path and shadow the shared website's files.
4. Keep the shared Astro `base` unset and the existing `thegenlab.ai` custom-domain setting on this repository. Add no project CNAME, custom domain, DNS record, or separate website repository.
5. Run `npm run verify`, preview the build, and inspect the project at its real `/<project>/` path, including a nested page and its assets. Commit website changes to this repository and deploy with the existing **Deploy GenLab** workflow.
6. After the live project page is verified, add its URL and code link to `src/content/publications.json` if it should appear in Selected research.

Research-code changes remain separate from website changes. To update a project page, edit its files in this shared repository; no code-repository deployment is involved. Existing project websites and code repositories are left at their current locations.

### Shared fake project test

The fake example lives in `public/project-test/` with `index.html`, `styles.css`, `assets/path-check.svg`, and `nested/index.html`. Its address is `https://thegenlab.ai/project-test/`. Keep its visible test labels and `noindex, nofollow` metadata; it is not a research project and should not appear in Selected research.

The successful [shared deployment](https://github.com/thegenlab/thegenlab.github.io/actions/runs/38066741473) published commit `8dff97d8806ec128fccb31ebcb6f680e8678c4b3` on **11 October 2026**. The build validated four HTML pages and 26 local links/assets; the homepage output was unchanged.

After removing Pages from the old `thegenlab/project-test` repository, normal HTTPS URLs for the homepage, test landing page, nested page, CSS and SVG all returned 200 and matched this repository's `dist/` files byte for byte. Both test pages contain the shared-repository marker and `noindex, nofollow`. The test's README URL returns 404. This verifies that the shared website serves the project path even while a same-name repository exists with Pages disabled.

The obsolete separate test repository is archived with `is_template: false`, `has_pages: false`, and its deployment workflow disabled. Its README points here. Its history is retained for recovery; all future project website changes belong in this shared repository.

## Workflow versions

The deployed workflows use the following exact action releases, checked against their official GitHub release pages on 10 October 2026:

| Action | Version |
| --- | --- |
| [actions/checkout](https://github.com/actions/checkout/releases/tag/v7.0.1) | `v7.0.1` |
| [actions/setup-node](https://github.com/actions/setup-node/releases/tag/v7.1.0) | `v7.1.0` |
| [actions/configure-pages](https://github.com/actions/configure-pages/releases/tag/v6.0.0) | `v6.0.0` |
| [actions/upload-pages-artifact](https://github.com/actions/upload-pages-artifact/releases/tag/v5.0.0) | `v5.0.0` |
| [actions/deploy-pages](https://github.com/actions/deploy-pages/releases/tag/v5.0.1) | `v5.0.1` |
