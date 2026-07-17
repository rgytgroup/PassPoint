import { readFileSync } from 'node:fs';
import { QuestionStatus, Prisma } from '@prisma/client';
import { prisma } from '../db.js';
import { requireState, getFlag } from '../util/args.js';

// SPEC §6.5 — carga preguntas desde un JSON a la base de datos con versión.
// El JSON usa el mismo esquema Prisma que la API (fuente de verdad).
interface ImportQuestion {
  topicSlug: string;
  topicNameEs?: string;
  topicNameEn?: string;
  topicOrder?: number;
  textEn: string;
  textEs: string;
  options: { textEn: string; textEs: string; correct: boolean }[];
  explanationEn: string;
  explanationEs: string;
  manualRef: string;
  difficulty?: number;
  isFree?: boolean;
  status?: keyof typeof QuestionStatus;
}

export async function run(args: string[]): Promise<void> {
  const stateCode = requireState(args);
  const file = getFlag(args, 'file');
  if (!file) {
    throw new Error('Falta --file <ruta.json> con las preguntas a importar.');
  }

  const items: ImportQuestion[] = JSON.parse(readFileSync(file, 'utf8'));
  if (!Array.isArray(items)) {
    throw new Error('El JSON debe ser un arreglo de preguntas.');
  }

  const state = await prisma.state.findUnique({ where: { code: stateCode } });
  if (!state) {
    throw new Error(
      `El estado ${stateCode} no existe en la DB. Créalo o corre el seed primero.`,
    );
  }

  let imported = 0;
  const byStatus: Record<string, number> = {};

  for (const q of items) {
    const topic = await prisma.topic.upsert({
      where: { stateId_slug: { stateId: state.id, slug: q.topicSlug } },
      update: {},
      create: {
        stateId: state.id,
        slug: q.topicSlug,
        nameEs: q.topicNameEs ?? q.topicSlug,
        nameEn: q.topicNameEn ?? q.topicSlug,
        order: q.topicOrder ?? 99,
      },
    });

    const status = q.status ? QuestionStatus[q.status] : QuestionStatus.DRAFT;
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
        isFree: q.isFree ?? false,
        status,
      },
    });
    imported++;
    byStatus[status] = (byStatus[status] ?? 0) + 1;
  }

  console.log(`[import] ${imported} preguntas importadas al estado ${stateCode}.`);
  for (const [status, n] of Object.entries(byStatus)) {
    console.log(`  - ${status}: ${n}`);
  }
  console.log('Recuerda: solo HUMAN_APPROVED se sirve a usuarios (pasa por `review`).');

  await prisma.$disconnect();
}
