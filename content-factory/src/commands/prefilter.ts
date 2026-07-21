import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { QuestionStatus, Prisma } from '@prisma/client';
import { prisma } from '../db.js';
import { generateJson, isGeminiConfigured } from '../gemini.js';
import { requireState, getFlag } from '../util/args.js';

interface Assessment {
  recommendation: 'APROBAR' | 'REVISAR' | 'RECHAZAR';
  confidence?: 'alta' | 'media' | 'baja';
  issues?: string[];
}
// Veredicto individual dentro del lote (n = número de pregunta, 1..N).
interface BatchVerdict extends Assessment {
  n: number;
}

const ORDER = { RECHAZAR: 0, REVISAR: 1, APROBAR: 2 };
const ICON = { RECHAZAR: '❌', REVISAR: '⚠️ ', APROBAR: '✅' };
const FALLBACK: Assessment = {
  recommendation: 'REVISAR',
  confidence: 'baja',
  issues: ['no se pudo analizar; revisar a mano'],
};

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

// Pre-filtro con IA: analiza críticamente las preguntas pendientes EN LOTE
// (una llamada evalúa varias preguntas, con veredicto individual por cada una),
// guarda la recomendación (advisory, en Question.aiReview) y produce un reporte
// priorizado. Por defecto solo analiza las que aún NO tienen aiReview (para no
// re-evaluar en cada corrida); usa --all para forzar re-análisis. NO cambia el
// status: el humano da el visto bueno final con `review` (SPEC §6.4).
export async function run(args: string[]): Promise<void> {
  const stateCode = requireState(args);
  if (!isGeminiConfigured()) {
    console.log('[prefilter] Necesita GEMINI_API_KEY en content-factory/.env.');
    return;
  }
  const batchSize = Number(getFlag(args, 'batch') ?? '12');
  const forceAll = args.includes('--all');
  const template = readFileSync(join('prompts', 'prefilter.md'), 'utf8');

  const pending = await prisma.question.findMany({
    where: {
      status: { in: [QuestionStatus.DRAFT, QuestionStatus.AI_VERIFIED] },
      topic: { state: { code: stateCode } },
      // Salta las ya etiquetadas salvo --all (evita re-evaluar y gastar de más).
      ...(forceAll ? {} : { aiReview: { equals: Prisma.DbNull } }),
    },
    include: { topic: { select: { nameEs: true } } },
    orderBy: { createdAt: 'asc' },
  });

  if (pending.length === 0) {
    console.log(
      `[prefilter] No hay preguntas sin etiquetar en ${stateCode}. (Usa --all para re-analizar todas.)`,
    );
    await prisma.$disconnect();
    return;
  }

  const batches = chunk(pending, batchSize);
  console.log(
    `[prefilter] ${pending.length} preguntas en ${batches.length} lotes de ${batchSize} → ${batches.length} llamadas a Gemini` +
      ` (antes: ${pending.length} llamadas, 1 por pregunta).\n`,
  );

  const rows: { q: (typeof pending)[number]; a: Assessment }[] = [];
  let calls = 0;

  for (const [bi, batch] of batches.entries()) {
    const items = batch
      .map(
        (q, i) =>
          `${i + 1}. ${JSON.stringify({
            textEs: q.textEs,
            options: q.options,
            explanationEs: q.explanationEs,
            manualRef: q.manualRef,
          })}`,
      )
      .join('\n');
    const prompt = [
      template,
      '\nEvalúa CADA una de las siguientes preguntas de forma INDIVIDUAL. NO des un juicio global del lote: cada pregunta tiene su propio veredicto.',
      `\n## Preguntas (${batch.length})`,
      items,
      `\nDevuelve SOLO un arreglo JSON con EXACTAMENTE ${batch.length} objetos, uno por pregunta EN EL MISMO ORDEN, cada uno con: n (número de la pregunta, 1..${batch.length}), recommendation ("APROBAR"|"REVISAR"|"RECHAZAR"), confidence ("alta"|"media"|"baja"), issues (arreglo de strings; vacío si APROBAR).`,
    ].join('\n');

    let verdicts: BatchVerdict[] = [];
    try {
      verdicts = await generateJson<BatchVerdict[]>(prompt);
    } catch {
      verdicts = [];
    }
    calls++;
    console.log(`  lote ${bi + 1}/${batches.length} (${batch.length} preguntas)`);

    for (let i = 0; i < batch.length; i++) {
      const q = batch[i];
      const v = Array.isArray(verdicts)
        ? verdicts.find((x) => x?.n === i + 1) ?? verdicts[i]
        : undefined;
      const a: Assessment = v?.recommendation
        ? { recommendation: v.recommendation, confidence: v.confidence, issues: v.issues ?? [] }
        : FALLBACK;
      await prisma.question.update({
        where: { id: q.id },
        data: { aiReview: a as unknown as Prisma.InputJsonValue },
      });
      rows.push({ q, a });
    }
  }

  rows.sort((x, y) => ORDER[x.a.recommendation] - ORDER[y.a.recommendation]);

  const counts = { APROBAR: 0, REVISAR: 0, RECHAZAR: 0 };
  const lines = [`# Pre-filtro IA — ${stateCode}`, ''];
  for (const { q, a } of rows) {
    counts[a.recommendation]++;
    lines.push(`## ${ICON[a.recommendation]} ${a.recommendation} — ${q.topic.nameEs}`);
    lines.push(`**${q.textEs}**`, '');
    if (a.issues?.length) lines.push(...a.issues.map((i) => `- ${i}`), '');
  }

  mkdirSync('output', { recursive: true });
  writeFileSync(join('output', `${stateCode}-prefilter.md`), lines.join('\n'), 'utf8');

  console.log(
    `\nResumen: ✅ ${counts.APROBAR} aprobar · ⚠️ ${counts.REVISAR} revisar · ❌ ${counts.RECHAZAR} rechazar`,
  );
  console.log(`Llamadas a Gemini: ${calls} (habría sido ${pending.length} sin lotes).`);
  console.log('El visto bueno final es tuyo: corre `review`.');
  await prisma.$disconnect();
}
