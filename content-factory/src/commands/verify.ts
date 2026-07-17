import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { QuestionStatus } from '@prisma/client';
import { prisma } from '../db.js';
import { generateJson, isGeminiConfigured } from '../gemini.js';
import { requireState } from '../util/args.js';

interface Verdict {
  verdict: 'AI_VERIFIED' | 'FLAGGED';
  flags?: string[];
  notes?: string;
}

// SPEC §6.3 — segundo pase de IA que valida cada DRAFT contra su fuente.
// Pasa a AI_VERIFIED o marca flags (se dejan en DRAFT para revisar).
export async function run(args: string[]): Promise<void> {
  const stateCode = requireState(args);

  if (!isGeminiConfigured()) {
    console.log(
      '[verify] Necesita GEMINI_API_KEY en content-factory/.env (aún no configurada).',
    );
    return;
  }

  const template = readFileSync(join('prompts', 'verify.md'), 'utf8');
  const drafts = await prisma.question.findMany({
    where: {
      status: QuestionStatus.DRAFT,
      topic: { state: { code: stateCode } },
    },
  });

  if (drafts.length === 0) {
    console.log(`[verify] No hay DRAFT pendientes en ${stateCode}.`);
    await prisma.$disconnect();
    return;
  }

  let verified = 0;
  let flagged = 0;

  for (const q of drafts) {
    const prompt = [
      template,
      '\n## Pregunta a validar (JSON)',
      JSON.stringify({
        textEs: q.textEs,
        textEn: q.textEn,
        options: q.options,
        explanationEs: q.explanationEs,
        explanationEn: q.explanationEn,
        manualRef: q.manualRef,
      }),
      '\nDevuelve SOLO un objeto JSON: { "verdict": "AI_VERIFIED" | "FLAGGED", "flags": [], "notes": "" }.',
    ].join('\n');

    const result = await generateJson<Verdict>(prompt);
    if (result.verdict === 'AI_VERIFIED') {
      await prisma.question.update({
        where: { id: q.id },
        data: { status: QuestionStatus.AI_VERIFIED },
      });
      verified++;
    } else {
      flagged++;
      console.log(
        `  ⚑ ${q.textEs.slice(0, 60)}… → ${(result.flags ?? []).join(', ') || 'flagged'}`,
      );
    }
  }

  console.log(
    `[verify] ${verified} → AI_VERIFIED · ${flagged} marcadas (siguen en DRAFT).`,
  );
  await prisma.$disconnect();
}
