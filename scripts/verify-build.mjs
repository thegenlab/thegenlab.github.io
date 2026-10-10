import { readFile, access, readdir, stat } from 'node:fs/promises';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('../dist/', import.meta.url));
const html = await readFile(path.join(root, 'index.html'), 'utf8');
assert.match(html, /<html lang="en"/);
assert.match(html, /<title>GenLab/);
assert.match(html, /rel="canonical" href="https:\/\/thegenlab.ai\/"/);
assert.equal((html.match(/<h1\b/g) || []).length, 1, 'Homepage needs one main heading');
for (const id of ['main', 'work', 'research-track', 'team', 'collaborators']) assert.match(html, new RegExp(`id="${id}"`));
for (const asset of ['404.html', 'favicon.svg', 'social-card.png', 'robots.txt', 'sitemap.xml']) await access(path.join(root, asset));
// Validate every generated page, including the explicit Astro project routes.
async function htmlFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const nested = await Promise.all(entries.map(entry => {
    const filename = path.join(dir, entry.name);
    return entry.isDirectory() ? htmlFiles(filename) : filename.endsWith('.html') ? [filename] : [];
  }));
  return nested.flat();
}
const publicPages = await htmlFiles(fileURLToPath(new URL('../public/', import.meta.url)));
assert.equal(publicPages.length, 0,
  'Page source belongs in src/pages and src/projects, not public/: ' + publicPages.join(', '));
let localLinks = 0;
const pages = await htmlFiles(root);
for (const file of pages) {
  const page = await readFile(file, 'utf8');
  const route = path.relative(root, file).split(path.sep).join('/');
  const pageURL = new URL(route, 'https://thegenlab.ai/');
  const references = Array.from(page.matchAll(/(?:href|src)=['"]([^'"]*)['"]/g), match => match[1]);
  for (const [, src] of page.matchAll(/<img\b[^>]*\bsrc=['"]([^'"]*)['"]/g)) {
    assert.ok(src && !src.includes('[object Object]'), `Invalid image source in ${route}: ${src}`);
  }
  // Astro's responsive images use srcset; every generated variant must exist.
  for (const [, srcset] of page.matchAll(/\bsrcset=['"]([^'"]*)['"]/g)) {
    let cursor = 0;
    while (cursor < srcset.length) {
      while (cursor < srcset.length && /[\s,]/.test(srcset[cursor])) cursor++;
      const start = cursor;
      while (cursor < srcset.length && !/\s/.test(srcset[cursor])) cursor++;
      const candidate = srcset.slice(start, cursor);
      if (!candidate) break;
      references.push(candidate.replace(/,+$/, ''));
      // Keep commas inside data URLs, but skip a candidate's width/density descriptor.
      if (!candidate.endsWith(',')) while (cursor < srcset.length && srcset[cursor] !== ',') cursor++;
    }
  }
  for (const href of references) {
    if (/^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(href)) continue;
    const url = new URL(href, pageURL);
    if (url.origin !== pageURL.origin) continue;
    const pathname = decodeURIComponent(url.pathname);
    const target = path.resolve(root, `.${pathname}${pathname.endsWith('/') ? 'index.html' : ''}`);
    assert.ok(target.startsWith(root), `URL escapes site directory: ${href} in ${route}`);
    assert.ok((await stat(target)).isFile(), `Missing local file: ${href} in ${route}`);
    if (url.hash && target.endsWith('.html')) {
      const targetHTML = target === file ? page : await readFile(target, 'utf8');
      const id = decodeURIComponent(url.hash.slice(1));
      assert.ok(targetHTML.includes(`id="${id}"`) || targetHTML.includes(`id='${id}'`), `Missing anchor: ${href} in ${route}`);
    }
    localLinks++;
  }
}
// Guard decoded pixel dimensions, rather than only compressed transfer size.
// This estimates one RGBA buffer per largest candidate, not total browser RAM.
let decodedImageBytes = 0;
for (const [tag] of html.matchAll(/<img\b[^>]*>/g)) {
  const attributes = Object.fromEntries(Array.from(tag.matchAll(/([\w:-]+)="([^"]*)"/g), match => [match[1], match[2]]));
  const width = Number(attributes.width), height = Number(attributes.height);
  assert.ok(width > 0 && height > 0, 'Homepage images need explicit positive dimensions');
  const candidates = Array.from((attributes.srcset ?? '').matchAll(/\s(\d+)w(?:,|$)/g), match => Number(match[1]));
  const largestWidth = Math.max(width, ...candidates);
  decodedImageBytes += largestWidth * Math.ceil(height * largestWidth / width) * 4;
}
assert.ok(decodedImageBytes <= 10 * 1024 ** 2,
  'Homepage exceeds its 10 MiB decoded-image estimate; review preview sizes before increasing this budget.');
console.log(`Largest homepage image candidates: ${(decodedImageBytes / 1024 ** 2).toFixed(2)} MiB estimated RGBA pixels.`);
assert.ok(!html.includes('contact@thegenlab.ai'), 'Unconfigured lab email must not be advertised');
console.log(`Verified homepage metadata, domain configuration, ${pages.length} pages and ${localLinks} local links/assets.`);
