import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

// A deterministic, gently folded torus. Projected surface cells are painted
// back to front so the fine grid reads as a sculpture, rather than a tangle.
const root = fileURLToPath(new URL('../', import.meta.url));
const TAU = Math.PI * 2;
const U = 100;
const V = 24;
const paper = [247, 248, 242];
const ink = [37, 76, 61];
const mix = (a, b, t) => a.map((c, i) => Math.round(c + (b[i] - c) * t));
const rgb = c => `rgb(${c.join(',')})`;
const dot = (a, b) => a.reduce((sum, n, i) => sum + n * b[i], 0);
const sub = (a, b) => a.map((n, i) => n - b[i]);
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const unit = a => a.map(n => n / Math.hypot(...a));

function surface(u, v) {
  const radius = 1.92 + 0.16 * Math.cos(3 * u);
  const roll = 2 * u + 0.25;
  const a = 0.79 * Math.cos(v);
  const b = 0.48 * Math.sin(v);
  const radial = radius + a * Math.cos(roll) - b * Math.sin(roll);
  const p = [radial * Math.cos(u), radial * Math.sin(u), 0.34 * Math.sin(3 * u) + a * Math.sin(roll) + b * Math.cos(roll)];
  // The oblique view exposes the central opening and the changing cross-section.
  const rx = 0.70, ry = -0.20, rz = -0.34;
  let [x, y, z] = p;
  [y, z] = [y * Math.cos(rx) - z * Math.sin(rx), y * Math.sin(rx) + z * Math.cos(rx)];
  [x, z] = [x * Math.cos(ry) + z * Math.sin(ry), -x * Math.sin(ry) + z * Math.cos(ry)];
  [x, y] = [x * Math.cos(rz) - y * Math.sin(rz), x * Math.sin(rz) + y * Math.cos(rz)];
  return [x, y, z];
}

const vertices = Array.from({ length: U }, (_, i) => Array.from({ length: V }, (_, j) => surface(i / U * TAU, j / V * TAU)));
const all = vertices.flat();
const xs = all.map(p => p[0]);
const ys = all.map(p => p[1]);
const xMin = Math.min(...xs), xMax = Math.max(...xs);
const yMin = Math.min(...ys), yMax = Math.max(...ys);
const scale = Math.min(425 / (xMax - xMin), 355 / (yMax - yMin));
const point = p => [300 + (p[0] - (xMin + xMax) / 2) * scale, 250 - (p[1] - (yMin + yMax) / 2) * scale];
const xy = p => point(p).map(n => n.toFixed(2)).join(',');
const light = unit([-0.4, 0.55, 1]);
const cells = [];

for (let i = 0; i < U; i++) {
  for (let j = 0; j < V; j++) {
    const corners = [vertices[i][j], vertices[(i + 1) % U][j], vertices[(i + 1) % U][(j + 1) % V], vertices[i][(j + 1) % V]];
    const normal = unit(cross(sub(corners[1], corners[0]), sub(corners[3], corners[0])));
    const depth = corners.reduce((sum, p) => sum + p[2], 0) / 4;
    const lighting = Math.abs(dot(normal, light));
    const shade = 0.025 + (1 - lighting) * 0.12;
    const fill = rgb(mix(paper, ink, shade));
    const stroke = rgb(mix(paper, ink, 0.38 + (depth + 2.4) / 4.8 * 0.19));
    const dotMarkup = i % 12 === 0 && j % 4 === 0 ? `<circle cx="${point(corners[0])[0].toFixed(2)}" cy="${point(corners[0])[1].toFixed(2)}" r="1.0" fill="#35624e"/>` : '';
    cells.push({ depth, markup: `<polygon points="${corners.map(xy).join(' ')}" fill="${fill}" stroke="${stroke}" stroke-width="0.43" stroke-linejoin="round"/>${dotMarkup}` });
  }
}

cells.sort((a, b) => a.depth - b.depth);
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="510" viewBox="0 0 600 510" fill="none">
<title>Generative form</title>
<desc>A folded toroidal surface drawn as a fine forest-green mesh.</desc>
<g>${cells.map(cell => cell.markup).join('\n')}</g>
</svg>\n`;

const favicon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" fill="none"><rect width="40" height="40" rx="8" fill="#f7f8f2"/><g transform="translate(4 4)" stroke="#254c3d"><path d="M14 3H3v11m15 15h11V18M3 18v11h11M29 14V3H18" stroke-width="2.2"/><path d="M10 16h12m-6-6v12" stroke-width="1.8"/></g></svg>\n`;
mkdirSync(`${root}public/images`, { recursive: true });
writeFileSync(`${root}public/images/generative-form.svg`, svg);
writeFileSync(`${root}public/favicon.svg`, favicon);
console.log('Generated public/images/generative-form.svg and public/favicon.svg');
