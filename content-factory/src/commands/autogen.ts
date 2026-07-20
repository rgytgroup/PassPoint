import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { QuestionStatus, Prisma } from '@prisma/client';
import { prisma } from '../db.js';
import { generateJson, isGeminiConfigured } from '../gemini.js';
import { requireState, getFlag } from '../util/args.js';

// Taxonomía fija de temas (el modelo asigna cada pregunta a uno de estos).
const TOPICS: Record<string, { es: string; en: string; order: number }> = {
  senales: { es: 'Señales de tránsito', en: 'Road signs', order: 1 },
  semaforos: { es: 'Semáforos', en: 'Traffic signals', order: 2 },
  carriles: { es: 'Uso de carriles', en: 'Lane use', order: 3 },
  'derecho-de-paso': { es: 'Derecho de paso', en: 'Right of way', order: 4 },
  'velocidad-distancia': { es: 'Velocidad y distancia', en: 'Speed and distance', order: 5 },
  giros: { es: 'Giros', en: 'Turns', order: 6 },
  estacionamiento: { es: 'Estacionamiento', en: 'Parking', order: 7 },
  autopista: { es: 'Manejo en autopista', en: 'Freeway driving', order: 8 },
  alcohol: { es: 'Alcohol y drogas', en: 'Alcohol and drugs', order: 9 },
  distracciones: { es: 'Conducción distraída', en: 'Distracted driving', order: 10 },
  cinturones: { es: 'Cinturones y seguridad', en: 'Seat belts and safety', order: 11 },
  peatones: { es: 'Peatones', en: 'Pedestrians', order: 12 },
  'compartir-camino': { es: 'Compartir el camino', en: 'Sharing the road', order: 13 },
  'condiciones-adversas': { es: 'Condiciones adversas', en: 'Adverse conditions', order: 14 },
  emergencias: { es: 'Emergencias y colisiones', en: 'Emergencies and collisions', order: 15 },
  'zonas-construccion': { es: 'Zonas de construcción', en: 'Work zones', order: 16 },
  'licencia-documentos': { es: 'Licencia y documentos', en: 'Licensing and documents', order: 17 },
  'sanciones-puntos': { es: 'Sanciones y puntos', en: 'Penalties and points', order: 18 },
  normas: { es: 'Normas de circulación', en: 'Rules of the road', order: 19 },
};

interface Gen {
  topicSlug: string;
  textEn: string;
  textEs: string;
  options: { textEn: string; textEs: string; correct: boolean }[];
  explanationEn: string;
  explanationEs: string;
  manualRef: string;
  difficulty?: number;
}

// Genera todo el banco desde los chunks del manual oficial: por cada chunk,
// Gemini clasifica el tema y crea preguntas ancladas (o [] si el chunk no
// tiene contenido útil, p. ej. índices o gráficos). Salida a DRAFT (§6.2).
export async function run(args: string[]): Promise<void> {
  const stateCode = requireState(args);
  if (!isGeminiConfigured()) {
    console.log('[autogen] Necesita GEMINI_API_KEY en content-factory/.env.');
    return;
  }
  const lang = getFlag(args, 'lang') ?? 'en';
  const perChunk = Number(getFlag(args, 'count') ?? '4');
  const dir = join('manuals', `${stateCode}-${lang}`);

  const files = readdirSync(dir).filter((f) => f.endsWith('.txt')).sort();
  const state = await prisma.state.findUnique({ where: { code: stateCode } });
  if (!state) throw new Error(`El estado ${stateCode} no existe en la DB.`);

  const taxonomy = Object.entries(TOPICS)
    .map(([slug, t]) => `- ${slug}: ${t.es}`)
    .join('\n');
  const topicCache = new Map<string, string>();
  const perTopic: Record<string, number> = {};
  let created = 0;

  for (const [i, f] of files.entries()) {
    const chunk = readFileSync(join(dir, f), 'utf8');
    if (chunk.split(/\s+/).length < 60) continue; // muy corto

    const prompt = [
      'Eres un redactor experto de preguntas para el examen teórico del DMV de California, bilingüe (español latinoamericano natural e inglés).',
      'A partir del FRAGMENTO del manual oficial de abajo, crea hasta ' + perChunk + ' preguntas ORIGINALES que un conductor pueda responder SOLO con este fragmento.',
      'Asigna cada pregunta al tema que mejor le corresponda, usando ÚNICAMENTE uno de estos slugs:',
      taxonomy,
      'Reglas: exactamente una opción correcta; distractores plausibles pero incorrectos; cita la sección/página del manual en manualRef; español natural (no traducción literal).',
      'Si el fragmento NO tiene contenido útil de reglas (índice, portada, lista de nombres de señales, tabla), devuelve un arreglo VACÍO [].',
      '',
      '## Fragmento del manual',
      '"""',
      chunk.slice(0, 6000),
      '"""',
      '',
      'Devuelve SOLO un arreglo JSON de objetos con: topicSlug, textEn, textEs, options (arreglo de {textEn,textEs,correct}), explanationEn, explanationEs, manualRef, difficulty.',
    ].join('\n');

    let items: Gen[] = [];
    try {
      items = await generateJson<Gen[]>(prompt);
    } catch {
      console.log(`  (chunk ${i + 1}/${files.length}: error, saltado)`);
      continue;
    }
    if (!Array.isArray(items) || items.length === 0) continue;

    for (const q of items) {
      const slug = TOPICS[q.topicSlug] ? q.topicSlug : 'normas';
      let topicId = topicCache.get(slug);
      if (!topicId) {
        const t = await prisma.topic.upsert({
          where: { stateId_slug: { stateId: state.id, slug } },
          update: {},
          create: {
            stateId: state.id,
            slug,
            nameEs: TOPICS[slug].es,
            nameEn: TOPICS[slug].en,
            order: TOPICS[slug].order,
          },
        });
        topicId = t.id;
        topicCache.set(slug, topicId);
      }
      await prisma.question.create({
        data: {
          topicId,
          textEn: q.textEn,
          textEs: q.textEs,
          options: q.options as unknown as Prisma.InputJsonValue,
          explanationEn: q.explanationEn,
          explanationEs: q.explanationEs,
          manualRef: q.manualRef,
          difficulty: q.difficulty ?? 1,
          isFree: false,
          status: QuestionStatus.DRAFT,
        },
      });
      created++;
      perTopic[slug] = (perTopic[slug] ?? 0) + 1;
    }
    console.log(`  chunk ${i + 1}/${files.length}: +${items.length} (total ${created})`);
  }

  console.log(`\n[autogen] ${created} preguntas DRAFT desde el manual de ${stateCode}.`);
  for (const [slug, n] of Object.entries(perTopic).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${TOPICS[slug].es}: ${n}`);
  }
  await prisma.$disconnect();
}
