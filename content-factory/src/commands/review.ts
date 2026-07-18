import { createInterface } from 'node:readline';
import { QuestionStatus } from '@prisma/client';
import { prisma } from '../db.js';
import { requireState } from '../util/args.js';

// SPEC §6.4 — revisión humana 1×1 (aprobar/rechazar/saltar) → HUMAN_APPROVED.
// REGLA DURA: solo lo aprobado por un humano se sirve. El revisor es la
// autoridad final del tono (español latinoamericano natural).
export async function run(args: string[]): Promise<void> {
  const stateCode = requireState(args);

  const pending = await prisma.question.findMany({
    where: {
      status: { in: [QuestionStatus.DRAFT, QuestionStatus.AI_VERIFIED] },
      topic: { state: { code: stateCode } },
    },
    include: { topic: { select: { nameEs: true } } },
    orderBy: { createdAt: 'asc' },
  });

  if (pending.length === 0) {
    console.log(`No hay preguntas pendientes de revisión en ${stateCode}.`);
    await prisma.$disconnect();
    return;
  }

  // Ordena por la recomendación del pre-filtro: las marcadas primero
  // (RECHAZAR, luego REVISAR), y al final las limpias (APROBAR) para ráfaga.
  const RANK: Record<string, number> = { RECHAZAR: 0, REVISAR: 1, APROBAR: 2 };
  const recOf = (q: (typeof pending)[number]) =>
    (q.aiReview as { recommendation?: string } | null)?.recommendation;
  pending.sort((a, b) => (RANK[recOf(a) ?? ''] ?? 3) - (RANK[recOf(b) ?? ''] ?? 3));

  const flagged = pending.filter((q) => {
    const r = recOf(q);
    return r === 'RECHAZAR' || r === 'REVISAR';
  }).length;

  console.log(
    `${pending.length} preguntas pendientes en ${stateCode}` +
      (flagged ? ` (${flagged} marcadas por el pre-filtro van primero)` : '') +
      '.\n  [a] aprobar  ·  [r] rechazar (elimina)  ·  [s] saltar  ·  [q] salir\n',
  );

  const rl = createInterface({ input: process.stdin, output: process.stdout });
  let closed = false;
  rl.on('close', () => {
    closed = true;
  });
  // Tolera stdin canalizado: si readline ya se cerró (EOF), se comporta como 'q'.
  const ask = (q: string) =>
    new Promise<string>((res) => {
      if (closed) {
        res('q');
        return;
      }
      try {
        rl.question(q, res);
      } catch {
        res('q');
      }
    });

  let approved = 0;
  let rejected = 0;
  let skipped = 0;

  const ICON: Record<string, string> = { RECHAZAR: '❌', REVISAR: '⚠️', APROBAR: '✅' };

  for (const q of pending) {
    const opts = q.options as { textEs: string; correct: boolean }[];
    const ai = q.aiReview as
      | { recommendation?: string; issues?: string[] }
      | null;
    console.log('─'.repeat(64));
    console.log(`Tema: ${q.topic.nameEs} · ${q.status} · manualRef: ${q.manualRef}`);
    if (ai?.recommendation) {
      console.log(
        `🤖 Pre-filtro: ${ICON[ai.recommendation] ?? ''} ${ai.recommendation}`,
      );
      (ai.issues ?? []).forEach((i) => console.log(`   · ${i}`));
    }
    console.log(`\n  ${q.textEs}`);
    opts.forEach((o, i) =>
      console.log(`    ${i + 1}. ${o.textEs} ${o.correct ? '✓' : ''}`),
    );
    console.log(`\n  Explicación: ${q.explanationEs}`);

    const ans = (await ask('\n  Decisión [a/r/s/q]: ')).trim().toLowerCase();
    if (ans === 'q') break;
    if (ans === 'a') {
      await prisma.question.update({
        where: { id: q.id },
        data: { status: QuestionStatus.HUMAN_APPROVED },
      });
      approved++;
      console.log('  ✓ Aprobada (HUMAN_APPROVED)\n');
    } else if (ans === 'r') {
      await prisma.question.delete({ where: { id: q.id } });
      rejected++;
      console.log('  ✗ Rechazada y eliminada\n');
    } else {
      skipped++;
      console.log('  → Saltada (sigue pendiente)\n');
    }
  }

  rl.close();
  console.log('─'.repeat(64));
  console.log(
    `Resumen: ${approved} aprobadas · ${rejected} rechazadas · ${skipped} saltadas.`,
  );
  await prisma.$disconnect();
}
