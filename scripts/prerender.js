import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distPath = path.resolve(__dirname, '../dist');
const indexPath = path.join(distPath, 'index.html');
const tuningsPath = path.resolve(__dirname, '../src/tunings.ts');
const appPath = path.resolve(__dirname, '../src/App.tsx');

if (!fs.existsSync(indexPath)) {
  console.error("No index.html found in dist. Run 'vite build' first.");
  process.exit(1);
}

const rawHtmlTemplate = fs.readFileSync(indexPath, 'utf-8');

// ── 1. Parse Instruments from tunings.ts ──────────────────────────────────
console.log("Parsing instruments from tunings.ts...");
const tuningsContent = fs.readFileSync(tuningsPath, 'utf-8');

// Clean TypeScript constructs to make it valid JS
let cleanedTunings = tuningsContent
  // Remove interface declarations
  .replace(/export\s+interface\s+\w+\s*\{[\s\S]*?\}/g, '')
  // Remove type annotation in INSTRUMENTS definition
  .replace(/export\s+const\s+INSTRUMENTS:\s*Instrument\[\]\s*=/g, 'const INSTRUMENTS =')
  // Remove matchString function and everything after it
  .replace(/export\s+function\s+matchString[\s\S]*$/g, '')
  // Remove other TS type annotations
  .replace(/:\s*Tuning/g, '')
  .replace(/:\s*Instrument/g, '')
  .replace(/:\s*StringTarget/g, '')
  .replace(/as\s+const/g, '');

const evalInstruments = new Function(cleanedTunings + '; return INSTRUMENTS;');
const instruments = evalInstruments();
console.log(`Successfully parsed ${instruments.length} instruments for prerendering.`);

// Parse seoData.ts
console.log("Parsing seoData from seoData.ts...");
const seoDataPath = path.resolve(__dirname, '../src/seoData.ts');
const seoDataContent = fs.readFileSync(seoDataPath, 'utf-8');
const cleanedSeoData = seoDataContent
  .replace(/export\s+const\s+seoData.*=/g, 'const seoData =');
const evalSeoData = new Function(cleanedSeoData + '; return seoData;');
const seoData = evalSeoData();

// ── 2. Extract SEO content from App.tsx ─────────────────────────────────────
console.log("Extracting SEO content from App.tsx...");
const appContent = fs.readFileSync(appPath, 'utf-8');
let seoHtml = '';
const startIndex = appContent.indexOf('<div className="seo-static-content">');
if (startIndex !== -1) {
  const subContent = appContent.substring(startIndex);
  const mainIndex = subContent.indexOf('</main>');
  if (mainIndex !== -1) {
    const seoSegment = subContent.substring(0, mainIndex);
    const lastSectionClose = seoSegment.lastIndexOf('</section>');
    if (lastSectionClose !== -1) {
      seoHtml = seoSegment.substring(0, lastSectionClose).replace(/className=/g, 'class=');
      console.log("Successfully extracted static SEO content.");
    }
  }
}

if (!seoHtml) {
  console.warn("Warning: Could not find seo-static-content div in App.tsx!");
}

function renderFullSeoContent(instId) {
  const data = seoData[instId || 'chromatic'];
  return `
    <section class="seo-content">
      <article class="seo-intro">
        <h2>${data.title}</h2>
        <p>${data.desc}</p>
      </article>
      ${seoHtml}
    </section>
  `;
}


// ── 3. Define HTML Shell Generators ─────────────────────────────────────────

const REF_NOTES = [
  { label: 'A4', hz: 440.00 },
  { label: 'E4', hz: 329.63 },
  { label: 'B3', hz: 246.94 },
  { label: 'G3', hz: 196.00 },
  { label: 'D3', hz: 146.83 },
  { label: 'A3', hz: 220.00 },
];

function renderHeader(subtitle, modeText) {
  return `
    <header>
      <div class="header-top">
        <button class="hamburger-btn" aria-label="Open menu">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>
        <h1>Tuner Free</h1>
        <div class="header-spacer" aria-hidden="true"></div>
      </div>
      <p class="subtitle">${subtitle}</p>

      <div class="mode-bar">
        <div class="mode-chip" aria-live="polite">
          <span class="mode-chip-dot" aria-hidden="true"></span>
          <span>${modeText}</span>
        </div>
      </div>
    </header>
  `;
}

function renderControls() {
  return `
    <div class="controls">
      <button class="btn btn-start">Start Tuner</button>
      <p class="hint">Allow microphone access when prompted</p>
    </div>
  `;
}

function renderSeoNavigation(instrumentsList, currentId) {
  let html = `
    <section class="seo-navigation" style="margin-top: 2rem; margin-bottom: 2rem;">
      <h2 style="font-size: 1.15rem; margin-bottom: 0.85rem; color: var(--text-2); font-weight: 600; text-align: center;">Select Instrument to Tune</h2>
      <div class="instrument-links-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap: 0.75rem; max-width: 800px; margin: 0 auto; padding: 0 8px;">
  `;
  
  // Chromatic
  const chromaticActive = !currentId ? 'style="border-color: var(--accent); background: var(--surface-3);"' : '';
  html += `
    <a href="/" class="string-card" ${chromaticActive} style="text-decoration: none; display: flex; flex-direction: column; align-items: center; justify-content: center; height: auto; padding: 12px 6px; border: 1px solid var(--border-color); border-radius: var(--radius-md); transition: all 0.2s;">
      <span class="string-label" style="font-size: 0.95rem; color: var(--text-1); font-weight: 500;">Chromatic</span>
      <span class="string-cents" style="font-size: 0.75rem; color: var(--text-3); margin-top: 2px;">All 12 notes</span>
    </a>
  `;

  for (const inst of instrumentsList) {
    const isActive = inst.id === currentId;
    const activeStyle = isActive ? 'style="border-color: var(--accent); background: var(--surface-3);"' : '';
    const stringsCount = inst.tunings[0].strings.length;
    const desc = inst.tunings.length > 1 ? `${inst.tunings.length} Tunings` : `${stringsCount} Strings`;
    html += `
      <a href="/${inst.id}" class="string-card" ${activeStyle} style="text-decoration: none; display: flex; flex-direction: column; align-items: center; justify-content: center; height: auto; padding: 12px 6px; border: 1px solid var(--border-color); border-radius: var(--radius-md); transition: all 0.2s;">
        <span class="string-label" style="font-size: 0.95rem; color: var(--text-1); font-weight: 500;">${inst.name}</span>
        <span class="string-cents" style="font-size: 0.75rem; color: var(--text-3); margin-top: 2px;">${desc}</span>
      </a>
    `;
  }
  
  html += `
      </div>
    </section>
  `;
  return html;
}

function renderReferenceTones(mode) {
  if (mode !== 'chromatic') {
    return `
      <section class="ref-tone-panel" aria-label="Reference Tone" style="margin-bottom: 2rem;">
        <div class="ref-tone-header">
          <span class="ref-tone-title">
            <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor" style="opacity: 0.7; margin-right: 6px; display: inline-block; vertical-align: middle;">
              <path d="M11.596 8.697l-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393z"/>
            </svg>
            Reference Tone
          </span>
          <span class="ref-tone-a4-badge">A4 = 440 Hz</span>
        </div>
        <p class="ref-tone-hint">Tap any string card above to hear the reference pitch</p>
      </section>
    `;
  }

  let html = `
    <section class="ref-tone-panel" aria-label="Reference Tone" style="margin-bottom: 2rem;">
      <div class="ref-tone-header">
        <span class="ref-tone-title">
          <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor" style="opacity: 0.7; margin-right: 6px; display: inline-block; vertical-align: middle;">
            <path d="M11.596 8.697l-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393z"/>
          </svg>
          Reference Tone
        </span>
        <span class="ref-tone-a4-badge">A4 = 440 Hz</span>
      </div>
      <div class="ref-tone-grid">
  `;
  for (const note of REF_NOTES) {
    html += `
      <div class="ref-tone-btn" style="text-align: center;">
        <span class="ref-tone-note">${note.label}</span>
        <span class="ref-tone-hz">${note.hz.toFixed(1)}</span>
      </div>
    `;
  }
  html += `
      </div>
    </section>
  `;
  return html;
}

function renderMetronome() {
  return `
    <section class="metronome-section" aria-label="Metronome" style="margin-bottom: 2rem;">
      <div class="metronome-header">
        <h3>Metronome</h3>
        <button class="btn-metro">Start</button>
      </div>
      <div class="metronome-controls">
        <div class="bpm-display">120 <span style="font-size: 0.6em; color: var(--text-3); font-weight: 500;">BPM</span></div>
        <input type="range" min="40" max="208" value="120" style="width: 100%;" disabled />
      </div>
    </section>
  `;
}

function renderChromaticDisplay() {
  return `
    <div class="display-area">
      <div class="note-display-row">
        <div class="note-display">
          <span class="note-name dim">—</span>
        </div>
        <div class="hz-display">— Hz</div>
      </div>
      <div class="needle-wrap" aria-hidden="true" style="opacity: 0.3;">
        <div style="width: 2px; height: 35px; background: var(--text-3); margin: 0 auto; position: relative; bottom: -5px;"></div>
        <div style="width: 120px; height: 1px; background: var(--border-color); margin: 0 auto;"></div>
      </div>
    </div>
  `;
}

function renderInstrumentDisplay(inst) {
  const defaultTuning = inst.tunings[0];
  let stringCardsHtml = '';
  
  for (let i = 0; i < defaultTuning.strings.length; i++) {
    const s = defaultTuning.strings[i];
    stringCardsHtml += `
      <div class="string-card" role="button" tabindex="0">
        <span class="string-label">${s.label}</span>
        <span class="string-note">${s.note}</span>
        <span class="string-hz">${s.hz.toFixed(1)} Hz</span>
        <span class="string-cents">—</span>
      </div>
    `;
  }
  
  return `
    <div class="display-area">
      <div class="note-display-row">
        <h2 class="instrument-title">${inst.name}</h2>
        <div class="hz-display">— Hz</div>
      </div>
      <div class="string-cards">
        ${stringCardsHtml}
      </div>
      <div class="needle-wrap" aria-hidden="true" style="opacity: 0.3;">
        <div style="width: 2px; height: 35px; background: var(--text-3); margin: 0 auto; position: relative; bottom: -5px;"></div>
        <div style="width: 120px; height: 1px; background: var(--border-color); margin: 0 auto;"></div>
      </div>
    </div>
  `;
}

function renderFooter() {
  const year = new Date().getFullYear();
  return `
    <footer>
      <p class="footer-copyright">
        &copy; ${year} Tuner Free · Free Online Chromatic Tuner
      </p>
      <p class="footer-credit">
        Created by <a href="https://www.linkedin.com/in/kridsada-bunta/" target="_blank" rel="noopener noreferrer" class="footer-link">Kridsada</a> · <a href="https://github.com/kridsadaa/tuner-free" target="_blank" rel="noopener noreferrer" class="footer-link">GitHub</a>
      </p>
    </footer>
  `;
}

function renderChromaticPage(instrumentsList, seoCopyHtml) {
  return `
    <div class="app">
      ${renderHeader('Online Instrument Tuner', 'Chromatic')}
      <main>
        ${renderChromaticDisplay()}
        ${renderControls()}
        ${renderSeoNavigation(instrumentsList, null)}
        ${renderReferenceTones('chromatic')}
        ${renderMetronome()}
        ${renderFullSeoContent(null)}
      </main>
      ${renderFooter()}
    </div>
  `;
}

function renderInstrumentPage(inst, instrumentsList, seoCopyHtml) {
  const defaultTuning = inst.tunings[0];
  const modeText = `${inst.name} · ${defaultTuning.name}`;
  return `
    <div class="app">
      ${renderHeader('Online Instrument Tuner', modeText)}
      <main>
        ${renderInstrumentDisplay(inst)}
        ${renderControls()}
        ${renderSeoNavigation(instrumentsList, inst.id)}
        ${renderReferenceTones('instrument')}
        ${renderMetronome()}
        ${renderFullSeoContent(inst.id)}
      </main>
      ${renderFooter()}
    </div>
  `;
}

// ── 4. Generate Pre-rendered Instrument Pages ──────────────────────────────
for (const inst of instruments) {
  const dir = path.join(distPath, inst.id);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const title = `${inst.name} Tuner — Free Online Tuner`;
  const desc = `Free online tuner for ${inst.name}. Tune your instrument accurately with real-time pitch detection. No app download needed.`;
  const pageHtml = renderInstrumentPage(inst, instruments, seoHtml);

  let newHtml = rawHtmlTemplate
    .replace(/<title>.*<\/title>/, `<title>${title}</title>`)
    .replace(/<meta name="title" content="[^"]*"/, `<meta name="title" content="${title}"`)
    .replace(/<meta name="description" content="[^"]*"/, `<meta name="description" content="${desc}"`)
    .replace(/<meta property="og:title" content="[^"]*"/, `<meta property="og:title" content="${title}"`)
    .replace(/<meta property="og:description" content="[^"]*"/, `<meta property="og:description" content="${desc}"`)
    .replace(/<meta property="og:url" content="[^"]*"/, `<meta property="og:url" content="https://tuner-free.kridsada-bun.com/${inst.id}"`)
    .replace(/<meta name="twitter:title" content="[^"]*"/, `<meta name="twitter:title" content="${title}"`)
    .replace(/<meta name="twitter:description" content="[^"]*"/, `<meta name="twitter:description" content="${desc}"`)
    .replace(/<link rel="canonical" href="[^"]*"/, `<link rel="canonical" href="https://tuner-free.kridsada-bun.com/${inst.id}"`)
    .replace('<div id="root"></div>', `<div id="root">${pageHtml}</div>`);

  fs.writeFileSync(path.join(dir, 'index.html'), newHtml);
  console.log(`Generated pre-rendered dist/${inst.id}/index.html`);
}

// ── 5. Optimize Main Homepage (dist/index.html) ────────────────────────────
console.log("Optimizing main dist/index.html with pre-rendered chromatic shell...");
const chromaticPageHtml = renderChromaticPage(instruments, seoHtml);
const optimizedIndexHtml = rawHtmlTemplate.replace(
  '<div id="root"></div>',
  `<div id="root">${chromaticPageHtml}</div>`
);
fs.writeFileSync(indexPath, optimizedIndexHtml);
console.log("Main dist/index.html optimized.");

// ── 6. Generate Sitemap ─────────────────────────────────────────────────────
const baseUrl = "https://tuner-free.kridsada-bun.com";
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

// ── 7. Generate robots.txt ──────────────────────────────────────────────────
const robotsTxt = `User-agent: *
Allow: /

Sitemap: ${baseUrl}/sitemap.xml`;

fs.writeFileSync(path.join(distPath, 'robots.txt'), robotsTxt);
console.log('Generated dist/robots.txt');

console.log("Prerendering and static content optimization complete.");
