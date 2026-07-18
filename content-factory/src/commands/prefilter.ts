import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { QuestionStatus, Prisma } from '@prisma/client';
import { prisma } from '../db.js';
import { generateJson, isGeminiConfigured } from '../gemini.js';
import { requireState } from '../util/args.js';

interface Assessment {
  recommendation: 'APROBAR' | 'REVISAR' | 'RECHAZAR';
  confidence: 'alta' | 'media' | 'baja';
  issues: string[];
}

const ORDER = { RECHAZAR: 0, REVISAR: 1, APROBAR: 2 };
const ICON = { RECHAZAR: '❌', REVISAR: '⚠️ ', APROBAR: '✅' };

// Pre-filtro con IA: analiza críticamente las preguntas pendientes, guarda su
// recomendación (advisory, en Question.aiReview) y produce un reporte
// priorizado para que la revisión HUMANA sea rápida. NO cambia el status: el
// humano sigue dando el visto bueno final con `review` (SPEC §6.4).
export async function run(args: string[]): Promise<void> {
  const stateCode = requireState(args);
  if (!isGeminiConfigured()) {
    console.log('[prefilter] Necesita GEMINI_API_KEY en content-factory/.env.');
    return;
  }

  const template = readFileSync(join('prompts', 'prefilter.md'), 'utf8');
  const pending = await prisma.question.findMany({
    where: {
      status: { in: [QuestionStatus.DRAFT, QuestionStatus.AI_VERIFIED] },
      topic: { state: { code: stateCode } },
    },
    include: { topic: { select: { nameEs: true } } },
    orderBy: { createdAt: 'asc' },
  });

  if (pending.length === 0) {
    console.log(`[prefilter] No hay preguntas pendientes en ${stateCode}.`);
    await prisma.$disconnect();
    return;
  }

  console.log(`[prefilter] Analizando ${pending.length} preguntas con IA…\n`);

  const rows = [];
  for (const q of pending) {
    const prompt = `${template}\n\n## Pregunta a evaluar (JSON)\n${JSON.stringify({
      textEs: q.textEs,
      options: q.options,
      explanationEs: q.explanationEs,
      manualRef: q.manualRef,
    })}`;
    let a: Assessment;
    try {
      a = await generateJson<Assessment>(prompt);
    } catch {
      a = { recommendation: 'REVISAR', confidence: 'baja', issues: ['no se pudo analizar; revisar a mano'] };
    }
    // Guarda la recomendación como metadato advisory (no cambia el status).
    await prisma.question.update({
      where: { id: q.id },
      data: { aiReview: a as unknown as Prisma.InputJsonValue },
    });
    rows.push({ q, a });
  }

  rows.sort((x, y) => ORDER[x.a.recommendation] - ORDER[y.a.recommendation]);

  const counts = { APROBAR: 0, REVISAR: 0, RECHAZAR: 0 };
  const lines = [`# Pre-filtro IA — ${stateCode}`, ''];
  for (const { q, a } of rows) {
    counts[a.recommendation]++;
    console.log(`${ICON[a.recommendation]} [${a.recommendation}] (${q.topic.nameEs}) ${q.textEs.slice(0, 70)}`);
    if (a.issues?.length) console.log(`     · ${a.issues.join(' · ')}`);
    lines.push(`## ${ICON[a.recommendation]} ${a.recommendation} — ${q.topic.nameEs}`);
    lines.push(`**${q.textEs}**`, '');
    if (a.issues?.length) lines.push(...a.issues.map((i) => `- ${i}`), '');
  }

  mkdirSync('output', { recursive: true });
  const file = join('output', `${stateCode}-prefilter.md`);
  writeFileSync(file, lines.join('\n'), 'utf8');

  console.log(
    `\nResumen: ✅ ${counts.APROBAR} aprobar · ⚠️ ${counts.REVISAR} revisar · ❌ ${counts.RECHAZAR} rechazar`,
  );
  console.log(`Reporte guardado en content-factory/${file}`);
  console.log('El visto bueno final es tuyo: corre `review` para aplicar tus decisiones.');
  await prisma.$disconnect();
}
