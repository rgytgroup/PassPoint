import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { QuestionStatus, Prisma } from '@prisma/client';
import { prisma } from '../db.js';
import { generateJson, isGeminiConfigured } from '../gemini.js';
import { requireState, getFlag } from '../util/args.js';

interface GeneratedQuestion {
  textEn: string;
  textEs: string;
  options: { textEn: string; textEs: string; correct: boolean }[];
  explanationEn: string;
  explanationEs: string;
  manualRef: string;
  difficulty?: number;
}

// SPEC §6.2 — genera preguntas por tema ancladas a un fragmento del manual.
// Cada pregunta DEBE citar el chunk (manualRef). Salida a DRAFT.
// PROHIBIDO copiar de otras apps/bancos licenciados (§8).
export async function run(args: string[]): Promise<void> {
  const stateCode = requireState(args);

  if (!isGeminiConfigured()) {
    console.log(
      '[generate] Necesita GEMINI_API_KEY en content-factory/.env (aún no configurada).',
    );
    console.log('  Consíguela en Google AI Studio y pégala en el .env.');
    return;
  }

  const topicSlug = getFlag(args, 'topic');
  const source = getFlag(args, 'source');
  if (!topicSlug || !source) {
    throw new Error(
      'Uso: generate --state CA --topic <slug> --source <archivo.txt> [--count 3] [--nameEs "..."] [--nameEn "..."]',
    );
  }
  const count = Number(getFlag(args, 'count') ?? '3');
  const chunk = readFileSync(source, 'utf8');
  const template = readFileSync(join('prompts', 'generate.md'), 'utf8');

  const prompt = [
    template,
    `\n## Contexto`,
    `- state: ${stateCode}`,
    `- topic (slug): ${topicSlug}`,
    `- Genera exactamente ${count} preguntas.`,
    `\n## Fragmento del manual (chunk fuente)`,
    '"""',
    chunk,
    '"""',
    `\nDevuelve SOLO un arreglo JSON de objetos con las claves:`,
    `textEn, textEs, options (arreglo de {textEn, textEs, correct}), explanationEn, explanationEs, manualRef, difficulty.`,
  ].join('\n');

  console.log(`[generate] Pidiendo ${count} preguntas a Gemini para ${stateCode}/${topicSlug}…`);
  const questions = await generateJson<GeneratedQuestion[]>(prompt);

  const state = await prisma.state.findUnique({ where: { code: stateCode } });
  if (!state) throw new Error(`El estado ${stateCode} no existe en la DB.`);

  const topic = await prisma.topic.upsert({
    where: { stateId_slug: { stateId: state.id, slug: topicSlug } },
    update: {},
    create: {
      stateId: state.id,
      slug: topicSlug,
      nameEs: getFlag(args, 'nameEs') ?? topicSlug,
      nameEn: getFlag(args, 'nameEn') ?? topicSlug,
      order: 99,
    },
  });

  let created = 0;
  for (const q of questions) {
    await prisma.question.create({
      data: {
        topicId: topic.id,
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
  }

  console.log(`[generate] ${created} preguntas DRAFT creadas. Siguiente: verify → review.`);
  await prisma.$disconnect();
}
