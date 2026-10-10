# Publish GenLab at thegenlab.ai

The site is prepared for `thegenlab/thegenlab.github.io`, GitHub Pages, and `https://thegenlab.ai`. Live publication, repository settings, DNS, and HTTPS have **not yet been verified**. Completing a local build does not publish the site.

## 1. Connect and enable GitHub Pages

1. Add these source files to the existing [thegenlab.github.io repository](https://github.com/thegenlab/thegenlab.github.io). Preserve any existing repository work. Use `main` as the production branch; update both workflows if the repository uses another branch.
2. Open [repository Settings → Pages](https://github.com/thegenlab/thegenlab.github.io/settings/pages). Under **Build and deployment → Source**, choose **GitHub Actions**.
3. Push or merge the source into `main`. The **Deploy GenLab** workflow installs the lockfile with `npm ci`, checks content and Astro types, builds static files, verifies the output, and publishes `dist`.
4. Confirm the workflow succeeds and the deployment opens at `https://thegenlab.github.io` before moving on. If Pages was enabled after the first push, rerun the workflow from **Actions → Deploy GenLab → Run workflow** on `main`.

Pull requests run the separate **Check site** workflow with read-only repository permissions. Only the deployment job has permission to publish Pages. No personal access token or Cloudflare API token is needed in these workflows. GitHub's hosted Ubuntu runner uses Node 24.

Astro is configured with `site: 'https://thegenlab.ai'` and no repository `base` prefix. This also works for the organization site's root path before DNS is connected. Canonical metadata already targets the final domain. See the [Astro Pages guide](https://docs.astro.build/en/guides/deploy/github/).

## 2. Verify domain ownership and set the custom domain

In the **thegenlab organization Settings → Pages**, choose **Add a domain** and enter `thegenlab.ai`. GitHub supplies a TXT record and challenge value. Add the exact record in Cloudflare, then return to GitHub and select **Verify**. Keep this TXT record after verification. This is an organization setting, separate from the repository's Pages settings. See [GitHub's organization domain-verification guide](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/verifying-your-custom-domain-for-github-pages).

Next, in **repository Settings → Pages → Custom domain**, enter `thegenlab.ai` and save it **before adding the website DNS records below**. A `public/CNAME` file documents the intended domain, but GitHub ignores that file when publishing through a custom Actions workflow; the Pages setting is authoritative. See [GitHub's custom-domain instructions](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site).

## 3. Add Cloudflare DNS records

Open the Cloudflare dashboard, select **thegenlab.ai → DNS → Records**, then add each record below. Set **Proxy status: DNS only** (gray cloud) and **TTL: Auto**. DNS-only is recommended here to keep GitHub's domain checks and certificate setup straightforward. Cloudflare's [record instructions](https://developers.cloudflare.com/dns/manage-dns-records/how-to/create-dns-records/) and [proxy guidance](https://developers.cloudflare.com/dns/proxy-status/use-cases/) explain the controls.

| Type | Name | Content |
| --- | --- | --- |
| A | `@` | `185.199.108.153` |
| A | `@` | `185.199.109.153` |
| A | `@` | `185.199.110.153` |
| A | `@` | `185.199.111.153` |
| CNAME | `www` | `thegenlab.github.io` |

For optional IPv6 support, add all four records below alongside the IPv4 records:

| Type | Name | Content |
| --- | --- | --- |
| AAAA | `@` | `2606:50c0:8000::153` |
| AAAA | `@` | `2606:50c0:8001::153` |
| AAAA | `@` | `2606:50c0:8002::153` |
| AAAA | `@` | `2606:50c0:8003::153` |

Replace conflicting website records at `@` or `www` after reviewing them. Preserve unrelated TXT and email records. Do not add a wildcard record. The addresses above are [GitHub's published Pages DNS values](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site).

## 4. Confirm HTTPS and redirects

Return to repository **Settings → Pages**. Wait for the DNS check and certificate provisioning, then enable **Enforce HTTPS**. DNS propagation and HTTPS availability can take up to 24 hours. See [GitHub's HTTPS guidance](https://docs.github.com/en/pages/getting-started-with-github-pages/securing-your-github-pages-site-with-https).

Open `https://thegenlab.ai` and check the homepage and each navigation link. Open `https://www.thegenlab.ai` and confirm it redirects to the apex domain. GitHub supplies that redirect when the apex and `www` DNS records are configured; a separate Cloudflare redirect rule is unnecessary. See [GitHub's redirect behavior](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/about-custom-domains-and-github-pages).

The website setup does not create email mailboxes. Only publish `contact@thegenlab.ai` once email routing or a mailbox has been configured and tested.

## 5. Host project websites under the same domain

Keep this repository as the minimal introduction and featured-project homepage. Each project can have its own repository and Pages deployment under the **thegenlab** organization. Once the organization site uses `thegenlab.ai`, a public Pages site in a repository named `project-name` is available at `https://thegenlab.ai/project-name/` by default. GitHub documents this [custom-domain inheritance across repositories](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/about-custom-domains-and-github-pages#using-a-custom-domain-across-multiple-repositories).

For each project, enable Pages and deploy its static website separately. Leave its **Custom domain** field empty and omit a project `CNAME` file. The existing apex DNS records cover these URLs; no per-project DNS record is needed. A custom domain assigned to a project overrides the inherited address. Privately published Pages sites do not inherit the organization domain.

For an Astro project named `project-name`, use this configuration in that project's repository:

```js
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://thegenlab.ai',
  base: '/project-name/',
  output: 'static',
});
```

Use the actual repository name for `base`. Ensure manually written internal links and public asset URLs include it, for example `${import.meta.env.BASE_URL}images/teaser.jpg`. Astro's [base configuration](https://docs.astro.build/en/reference/configuration-reference/#base) controls the path prefix; the [Pages guide](https://docs.astro.build/en/guides/deploy/github/#how-to-deploy) explains project paths. Projects using another framework need its equivalent path setting.

Reserve each project path for that project's deployment: do not generate a page or copy a folder with the same name into this homepage's build. Keep this homepage's `base` unset. Link featured projects to their deployed URLs only after checking their pages, nested links, images, and videos at the real path. Changing the homepage should not require rebuilding the project websites.

## Workflow versions

The exact action releases were checked against their official GitHub release pages on 10 October 2026:

| Action | Version |
| --- | --- |
| [actions/checkout](https://github.com/actions/checkout/releases/tag/v7.0.1) | `v7.0.1` |
| [actions/setup-node](https://github.com/actions/setup-node/releases/tag/v7.1.0) | `v7.1.0` |
| [actions/configure-pages](https://github.com/actions/configure-pages/releases/tag/v6.0.0) | `v6.0.0` |
| [actions/upload-pages-artifact](https://github.com/actions/upload-pages-artifact/releases/tag/v5.0.0) | `v5.0.0` |
| [actions/deploy-pages](https://github.com/actions/deploy-pages/releases/tag/v5.0.1) | `v5.0.1` |
