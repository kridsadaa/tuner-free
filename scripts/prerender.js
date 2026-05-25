import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distPath = path.resolve(__dirname, '../dist');
const indexPath = path.join(distPath, 'index.html');
const tuningsPath = path.resolve(__dirname, '../src/tunings.ts');

if (!fs.existsSync(indexPath)) {
  console.error("No index.html found in dist. Run 'vite build' first.");
  process.exit(1);
}

const htmlTemplate = fs.readFileSync(indexPath, 'utf-8');
const tuningsContent = fs.readFileSync(tuningsPath, 'utf-8');

// Simple regex to extract id and name from INSTRUMENTS array (excluding tunings by requiring category)
const instruments = [];
const regex = /id:\s*'([^']+)',\s*name:\s*'([^']+)',\s*category:\s*'([^']+)'/g;
let match;
while ((match = regex.exec(tuningsContent)) !== null) {
  instruments.push({ id: match[1], name: match[2] });
}

console.log(`Found ${instruments.length} instruments for prerendering.`);

for (const inst of instruments) {
  const dir = path.join(distPath, inst.id);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const title = `${inst.name} Tuner — Free Online Tuner`;
  const desc = `Free online tuner for ${inst.name}. Tune your instrument accurately with real-time pitch detection. No app download needed.`;

  let newHtml = htmlTemplate
    .replace(/<title>.*<\/title>/, `<title>${title}</title>`)
    .replace(/<meta name="title" content="[^"]*"/, `<meta name="title" content="${title}"`)
    .replace(/<meta name="description" content="[^"]*"/, `<meta name="description" content="${desc}"`)
    .replace(/<meta property="og:title" content="[^"]*"/, `<meta property="og:title" content="${title}"`)
    .replace(/<meta property="og:description" content="[^"]*"/, `<meta property="og:description" content="${desc}"`)
    .replace(/<meta property="og:url" content="[^"]*"/, `<meta property="og:url" content="https://tuner-free.vercel.app/${inst.id}"`)
    .replace(/<meta name="twitter:title" content="[^"]*"/, `<meta name="twitter:title" content="${title}"`)
    .replace(/<meta name="twitter:description" content="[^"]*"/, `<meta name="twitter:description" content="${desc}"`)
    .replace(/<link rel="canonical" href="[^"]*"/, `<link rel="canonical" href="https://tuner-free.vercel.app/${inst.id}"`);

  fs.writeFileSync(path.join(dir, 'index.html'), newHtml);
  console.log(`Generated dist/${inst.id}/index.html`);
}

// ── Generate Sitemap ──────────────────────────────────────────────────────────
const baseUrl = "https://tuner-free.vercel.app";
let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/</loc>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>`;

for (const inst of instruments) {
  sitemap += `
  <url>
    <loc>${baseUrl}/${inst.id}</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`;
}
sitemap += `\n</urlset>`;

fs.writeFileSync(path.join(distPath, 'sitemap.xml'), sitemap);
console.log('Generated dist/sitemap.xml');

// ── Generate robots.txt ───────────────────────────────────────────────────────
const robotsTxt = `User-agent: *
Allow: /

Sitemap: ${baseUrl}/sitemap.xml`;

fs.writeFileSync(path.join(distPath, 'robots.txt'), robotsTxt);
console.log('Generated dist/robots.txt');

console.log("Prerendering complete.");
