import { readFileSync, readdirSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { QuestionStatus } from '@prisma/client';
import { prisma } from '../db.js';
import { requireState, getFlag } from '../util/args.js';

// Reporte de las preguntas marcadas (REVISAR/RECHAZAR) junto con el pasaje del
// manual oficial relacionado, para que el revisor humano decida rápido.

const STOP = new Set([
  'the', 'and', 'for', 'que', 'los', 'las', 'una', 'con', 'por', 'del', 'sus',
  'you', 'your', 'when', 'what', 'which', 'that', 'this', 'from', 'california',
  'debe', 'cual', 'cuando', 'siguiente', 'siguientes', 'según', 'segun',
]);

function keywords(text: string): string[] {
  return [
    ...new Set(
      text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .replace(/[^a-z0-9 ]/g, ' ')
        .split(/\s+/)
        .filter((w) => w.length >= 5 && !STOP.has(w)),
    ),
  ];
}

/** Encuentra el mejor pasaje del manual para una pregunta (por solapamiento). */
function bestPassage(chunks: string[], kws: string[]): string {
  let best = '';
  let bestScore = 0;
  let bestPos = 0;
  for (const c of chunks) {
    const low = c.toLowerCase();
    let score = 0;
    for (const k of kws) if (low.includes(k)) score++;
    if (score > bestScore) {
      bestScore = score;
      best = c;
      // Centra el extracto en la primera keyword encontrada.
      bestPos = Math.max(0, low.indexOf(kws.find((k) => low.includes(k)) ?? '') - 150);
    }
  }
  if (!best) return '_(no se encontró un pasaje claro; revisa por manualRef)_';
  return best.slice(bestPos, bestPos + 550).replace(/\s+/g, ' ').trim() + '…';
}

export async function run(args: string[]): Promise<void> {
  const stateCode = requireState(args);
  const lang = getFlag(args, 'lang') ?? 'en';

  const dir = join('manuals', `${stateCode}-${lang}`);
  const chunks = readdirSync(dir)
    .filter((f) => f.endsWith('.txt'))
    .map((f) => readFileSync(join(dir, f), 'utf8'));

  const all = await prisma.question.findMany({
    where: {
      status: { in: [QuestionStatus.DRAFT, QuestionStatus.AI_VERIFIED] },
      topic: { state: { code: stateCode } },
    },
    include: { topic: { select: { nameEs: true } } },
    orderBy: { createdAt: 'asc' },
  });

  const flagged = all.filter((q) => {
    const r = (q.aiReview as { recommendation?: string } | null)?.recommendation;
    return r === 'REVISAR' || r === 'RECHAZAR';
  });

  const lines = [`# Preguntas marcadas — ${stateCode} (${flagged.length})`, ''];
  for (const q of flagged) {
    const ai = q.aiReview as { recommendation?: string; issues?: string[] };
    const opts = q.options as { textEs: string; correct: boolean }[];
    const kws = keywords(`${q.textEn} ${q.manualRef}`);
    const passage = bestPassage(chunks, kws);
    const icon = ai.recommendation === 'RECHAZAR' ? '❌' : '⚠️';

    lines.push(`## ${icon} ${ai.recommendation} — ${q.topic.nameEs}`);
    lines.push(`**${q.textEs}**`);
    opts.forEach((o) => lines.push(`- ${o.correct ? '✅ ' : ''}${o.textEs}`));
    lines.push('');
    lines.push(`> 🤖 **Problema:** ${(ai.issues ?? []).join(' · ') || '—'}`);
    lines.push(`> 📖 **manualRef:** ${q.manualRef}`);
    lines.push('');
    lines.push(`**Pasaje del manual oficial (para verificar):**`);
    lines.push(`> ${passage}`);
    lines.push('\n---\n');
  }

  mkdirSync('output', { recursive: true });
  const file = join('output', `${stateCode}-marcadas.md`);
  writeFileSync(file, lines.join('\n'), 'utf8');
  console.log(`[flagged] ${flagged.length} preguntas marcadas → content-factory/${file}`);
  console.log('Ábrelo (Ctrl+Shift+V) para verlas contra el manual y decidir.');
  await prisma.$disconnect();
}
