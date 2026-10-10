import { readFile, access } from 'node:fs/promises';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('../dist/', import.meta.url));
const html = await readFile(path.join(root, 'index.html'), 'utf8');
assert.match(html, /<html lang="en"/);
assert.match(html, /<title>GenLab/);
assert.match(html, /rel="canonical" href="https:\/\/thegenlab.ai\/"/);
assert.equal((html.match(/<h1\b/g) || []).length, 1, 'Homepage needs one main heading');
for (const id of ['main', 'work', 'about']) assert.match(html, new RegExp(`id="${id}"`));
for (const asset of ['404.html', 'favicon.svg', 'social-card.png', 'robots.txt', 'sitemap.xml']) await access(path.join(root, asset));
// Catch broken local links/assets and anchors before a deployment reaches Pages.
for (const [, url] of html.matchAll(/(?:href|src)="([^"\s]+)"/g)) {
  if (url.startsWith('#') || url.startsWith('/#')) {
    const id = url.split('#')[1];
    assert.ok(html.includes(`id="${id}"`), `Missing anchor: ${url}`);
  } else if (url.startsWith('/')) {
    const pathname = decodeURIComponent(url.split(/[?#]/)[0]);
    const filename = pathname.endsWith('/') ? `${pathname}index.html` : pathname;
    await access(path.join(root, filename));
  }
}
assert.ok(!html.includes('contact@thegenlab.ai'), 'Unconfigured lab email must not be advertised');
console.log('Verified homepage metadata, anchors, local assets, 404, and domain configuration.');
