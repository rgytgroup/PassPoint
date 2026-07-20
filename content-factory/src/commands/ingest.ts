import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { requireState, getFlag } from '../util/args.js';

// SPEC §6.1 — descarga/parsea el manual oficial → chunks con referencia de
// sección. Usa `pdftotext` (poppler) para extraer el texto del PDF.

interface Chunk {
  ref: string; // sección del manual (para anclar preguntas: manualRef)
  text: string;
  words: number;
}

/** ¿Parece un encabezado de sección? (línea corta, mayúsculas, sin punto final). */
function isHeading(line: string): boolean {
  const t = line.trim();
  if (t.length < 4 || t.length > 60) return false;
  if (/[.:;]$/.test(t)) return false;
  const letters = t.replace(/[^A-Za-zÁÉÍÓÚÑáéíóúñ]/g, '');
  if (letters.length < 4) return false;
  const upper = letters.replace(/[^A-ZÁÉÍÓÚÑ]/g, '').length;
  return upper / letters.length > 0.7; // mayormente mayúsculas
}

function slug(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 50);
}

function chunkText(raw: string, targetWords: number): Chunk[] {
  const lines = raw.split(/\r?\n/);
  const chunks: Chunk[] = [];
  let currentRef = 'Introducción';
  let buffer: string[] = [];
  let words = 0;

  const flush = () => {
    const text = buffer.join(' ').replace(/\s+/g, ' ').trim();
    if (text.split(' ').length >= 40) {
      chunks.push({ ref: currentRef, text, words: text.split(' ').length });
    }
    buffer = [];
    words = 0;
  };

  for (const line of lines) {
    const t = line.trim();
    if (!t) continue;
    if (isHeading(t)) {
      // Nuevo encabezado: cierra el chunk actual y cambia la referencia.
      flush();
      currentRef = t.replace(/\s+/g, ' ');
      continue;
    }
    buffer.push(t);
    words += t.split(/\s+/).length;
    if (words >= targetWords) flush();
  }
  flush();
  return chunks;
}

export async function run(args: string[]): Promise<void> {
  const state = requireState(args);
  const file = getFlag(args, 'file');
  const lang = (getFlag(args, 'lang') ?? 'es').toLowerCase();
  const targetWords = Number(getFlag(args, 'words') ?? '450');
  if (!file) {
    throw new Error('Uso: ingest --state CA --file <manual.pdf> [--lang es|en] [--words 450]');
  }

  let raw: string;
  try {
    raw = execFileSync('pdftotext', ['-layout', file, '-'], {
      encoding: 'utf8',
      maxBuffer: 64 * 1024 * 1024,
    });
  } catch {
    throw new Error(
      'No se pudo extraer el PDF. ¿Está instalado pdftotext (poppler) y la ruta del --file es correcta?',
    );
  }

  const chunks = chunkText(raw, targetWords);
  if (chunks.length === 0) {
    throw new Error('No se extrajeron chunks; revisa el PDF o baja --words.');
  }

  const outDir = join('manuals', `${state}-${lang}`);
  mkdirSync(outDir, { recursive: true });
  writeFileSync(join(outDir, 'chunks.json'), JSON.stringify(chunks, null, 2), 'utf8');
  // También un .txt por chunk, para usar con `generate --source`.
  chunks.forEach((c, i) => {
    const name = `${String(i).padStart(3, '0')}-${slug(c.ref) || 'seccion'}.txt`;
    writeFileSync(join(outDir, name), `# ${c.ref}\n\n${c.text}\n`, 'utf8');
  });

  const totalWords = chunks.reduce((n, c) => n + c.words, 0);
  const sections = [...new Set(chunks.map((c) => c.ref))];
  console.log(`[ingest] ${state}/${lang}: ${chunks.length} chunks (${totalWords} palabras) desde el PDF.`);
  console.log(`  Secciones detectadas: ${sections.length}`);
  console.log(`  Guardado en content-factory/${outDir}/ (chunks.json + un .txt por chunk).`);
  console.log(`\n  Ejemplo — sección "${chunks[0].ref}":`);
  console.log(`  ${chunks[0].text.slice(0, 200)}…`);
}
