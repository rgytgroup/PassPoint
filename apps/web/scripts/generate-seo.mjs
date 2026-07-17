// Generador de páginas SEO estáticas (SPEC §4.8, §9).
// Produce HTML pre-renderizado, indexable y rápido + sitemap.xml + robots.txt.
// Salida: apps/web/dist/ (se sirve tal cual en Vercel; la SPA hace fallback).
import { fileURLToPath } from 'node:url';
import { dirname, resolve, join } from 'node:path';
import { mkdirSync, writeFileSync } from 'node:fs';
import { site, states } from './seo-content.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(__dirname, '..', 'dist');
const today = new Date().toISOString().slice(0, 10);

const esc = (s) =>
  String(s)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');

const urls = [];

/** Envuelve el contenido en un HTML completo, indexable y autocontenido. */
function html({ title, description, path, jsonLd, body }) {
  const canonical = site.url + path;
  urls.push(path);
  return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<meta name="robots" content="index,follow">
<link rel="canonical" href="${esc(canonical)}">
<meta property="og:type" content="website">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${esc(canonical)}">
<meta name="theme-color" content="#0f172a">
<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>
<style>
:root{color-scheme:light dark}
*{box-sizing:border-box}
body{margin:0;font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;line-height:1.6;color:#0f172a;background:#f8fafc}
a{color:#0f172a}
header,footer{background:#fff;border-color:#e2e8f0}
header{border-bottom:1px solid #e2e8f0}
footer{border-top:1px solid #e2e8f0;margin-top:3rem}
.wrap{max-width:760px;margin:0 auto;padding:1rem}
h1{font-size:1.7rem;line-height:1.25}
h2{font-size:1.25rem;margin-top:2rem}
.brand{font-weight:800;text-decoration:none;font-size:1.1rem}
.cta{display:inline-block;background:#0f172a;color:#fff;text-decoration:none;padding:.7rem 1.2rem;border-radius:.5rem;font-weight:600;margin-top:1rem}
.q{border:1px solid #e2e8f0;background:#fff;border-radius:.6rem;padding:1rem;margin:.8rem 0}
.q p{margin:.2rem 0 .6rem;font-weight:600}
.q ul{margin:.3rem 0;padding-left:1.2rem}
details{margin-top:.5rem}
summary{cursor:pointer;color:#334155;font-weight:600}
.muted{color:#64748b;font-size:.85rem}
nav.links a{display:inline-block;margin:.2rem .6rem .2rem 0}
@media(prefers-color-scheme:dark){body{background:#0b1120;color:#e2e8f0}header,footer,.q{background:#111827;border-color:#1f2937}a{color:#e2e8f0}.cta{background:#e2e8f0;color:#0b1120}}
</style>
</head>
<body>
<header><div class="wrap"><a class="brand" href="/">${site.name}</a></div></header>
<main class="wrap">
${body}
</main>
<footer><div class="wrap muted">
<p>${esc(site.disclaimer)}</p>
<nav class="links"><a href="/terminos">Términos</a><a href="/privacidad">Privacidad</a><a href="/reembolsos">Reembolsos</a></nav>
</div></footer>
</body>
</html>`;
}

/** Render de una lista de preguntas de ejemplo con respuesta desplegable. */
function questionsBlock(questions) {
  return questions
    .map(
      (q) => `<div class="q">
<p>${esc(q.question)}</p>
<ul>${q.options.map((o) => `<li>${esc(o)}</li>`).join('')}</ul>
<details><summary>Ver respuesta</summary>
<p class="muted">Correcta: <strong>${esc(q.options[q.correct])}</strong>. ${esc(q.explanation)}</p>
</details>
</div>`,
    )
    .join('\n');
}

function write(path, content) {
  const dir = join(OUT, path);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'index.html'), content, 'utf8');
}

let pageCount = 0;

for (const state of states) {
  const appHub = `/${state.slug}`;

  // 1) Landing SEO principal: /[state]/examen-de-manejo-espanol
  {
    const path = `/${state.slug}/examen-de-manejo-espanol`;
    const title = `Examen de manejo de ${state.nameEs} en español (2025) | ${site.name}`;
    const description = `Practica gratis el examen teórico del DMV de ${state.nameEs} en español: ${state.examCount} preguntas, apruebas con ${state.passCount}. Test gratis de 5 preguntas.`;
    const body = `
<h1>Examen de manejo de ${esc(state.nameEs)} en español</h1>
<p>${esc(state.intro)}</p>
<a class="cta" href="${appHub}">Empezar a practicar gratis →</a>
<h2>Test gratis: 5 preguntas de práctica</h2>
${questionsBlock(state.freeQuestions)}
<h2>Practica por tema</h2>
<nav class="links">
${state.topics.map((t) => `<a href="/${state.slug}/preguntas/${t.slug}">${esc(t.nameEs)}</a>`).join('')}
</nav>
<h2>Preguntas frecuentes</h2>
<nav class="links">
${state.faqs.slice(0, 6).map((f) => `<a href="/${state.slug}/faq/${f.slug}">${esc(f.question)}</a>`).join('')}
</nav>
<a class="cta" href="${appHub}">Ver simulacro completo →</a>`;
    write(path, html({ title, description, path, body, jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: title,
      description,
      inLanguage: 'es',
    } }));
    pageCount++;
  }

  // 2) Una página por tema: /[state]/preguntas/[topic]
  for (const t of state.topics) {
    const path = `/${state.slug}/preguntas/${t.slug}`;
    const title = `Preguntas de ${t.nameEs} — examen DMV ${state.nameEs} | ${site.name}`;
    const description = `${t.intro} Preguntas de práctica en español con respuesta y explicación.`;
    const body = `
<p class="muted"><a href="/${state.slug}/examen-de-manejo-espanol">Examen de ${esc(state.nameEs)}</a> › ${esc(t.nameEs)}</p>
<h1>Preguntas de ${esc(t.nameEs)}</h1>
<p>${esc(t.intro)}</p>
${questionsBlock(t.questions)}
<a class="cta" href="${appHub}/practica/${t.slug}">Practicar ${esc(t.nameEs)} en la app →</a>`;
    write(path, html({ title, description, path, body, jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'QAPage',
      name: title,
      inLanguage: 'es',
    } }));
    pageCount++;
  }

  // 3) Una página por FAQ: /[state]/faq/[slug]
  for (const f of state.faqs) {
    const path = `/${state.slug}/faq/${f.slug}`;
    const title = `${f.question} | ${site.name} ${state.nameEs}`;
    const body = `
<p class="muted"><a href="/${state.slug}/examen-de-manejo-espanol">Examen de ${esc(state.nameEs)}</a> › FAQ</p>
<h1>${esc(f.question)}</h1>
<p>${esc(f.answer)}</p>
<a class="cta" href="${appHub}">Practicar el examen gratis →</a>
<h2>Más preguntas frecuentes</h2>
<nav class="links">
${state.faqs.filter((o) => o.slug !== f.slug).slice(0, 6).map((o) => `<a href="/${state.slug}/faq/${o.slug}">${esc(o.question)}</a>`).join('')}
</nav>`;
    write(path, html({ title, description: f.answer, path, body, jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [{ '@type': 'Question', name: f.question, acceptedAnswer: { '@type': 'Answer', text: f.answer } }],
    } }));
    pageCount++;
  }
}

// Sitemap + robots
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `<url><loc>${site.url}${u}</loc><lastmod>${today}</lastmod></url>`).join('\n')}
</urlset>`;
writeFileSync(join(OUT, 'sitemap.xml'), sitemap, 'utf8');

writeFileSync(
  join(OUT, 'robots.txt'),
  `User-agent: *\nAllow: /\nSitemap: ${site.url}/sitemap.xml\n`,
  'utf8',
);

console.log(`[seo] ${pageCount} páginas generadas + sitemap.xml (${urls.length} URLs) + robots.txt en ${OUT}`);
