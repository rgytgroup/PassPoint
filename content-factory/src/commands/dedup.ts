import { QuestionStatus } from '@prisma/client';
import { prisma } from '../db.js';
import { requireState, getFlag } from '../util/args.js';

// Detecta preguntas PENDIENTES casi duplicadas (de una aprobada o entre sí) por
// solapamiento de tokens, y las elimina (con --apply). Las aprobadas son la
// referencia canónica y nunca se borran.

const STOP = new Set([
  'the', 'and', 'for', 'que', 'los', 'las', 'una', 'con', 'por', 'del', 'sus',
  'you', 'your', 'when', 'what', 'which', 'that', 'this', 'from', 'debe',
  'cual', 'cuando', 'siguiente', 'siguientes', 'segun', 'para', 'como', 'está',
  'esta', 'california', 'conductor', 'vehiculo', 'vehículo', 'manejar', 'conducir',
]);

function tokens(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9 ]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length >= 4 && !STOP.has(w)),
  );
}

/** Firma de una pregunta: su texto + la opción correcta (para no confundir
 *  preguntas parecidas con respuestas distintas). */
function signature(q: {
  textEs: string;
  options: unknown;
}): Set<string> {
  const opts = q.options as { textEs: string; correct: boolean }[];
  const correct = opts.find((o) => o.correct)?.textEs ?? '';
  return tokens(`${q.textEs} ${correct}`);
}

function jaccard(a: Set<string>, b: Set<string>): number {
  let inter = 0;
  for (const x of a) if (b.has(x)) inter++;
  const uni = a.size + b.size - inter;
  return uni ? inter / uni : 0;
}

export async function run(args: string[]): Promise<void> {
  const stateCode = requireState(args);
  const threshold = Number(getFlag(args, 'threshold') ?? '0.55');
  const apply = args.includes('--apply');

  const all = await prisma.question.findMany({
    where: { topic: { state: { code: stateCode } } },
    orderBy: [{ status: 'asc' }, { createdAt: 'asc' }],
    include: { topic: { select: { nameEs: true } } },
  });

  // Referencia canónica: primero las aprobadas, luego se van sumando las
  // pendientes que sí se conservan.
  const kept: { id: string; toks: Set<string>; textEs: string }[] = [];
  const dups: { q: (typeof all)[number]; against: string }[] = [];

  // Aprobadas primero (canónicas), luego pendientes en orden de creación.
  const approved = all.filter((q) => q.status === QuestionStatus.HUMAN_APPROVED);
  const pending = all.filter((q) => q.status !== QuestionStatus.HUMAN_APPROVED);
  for (const q of approved) kept.push({ id: q.id, toks: signature(q), textEs: q.textEs });

  for (const q of pending) {
    const toks = signature(q);
    let match: { textEs: string; sim: number } | null = null;
    for (const k of kept) {
      const sim = jaccard(toks, k.toks);
      if (sim >= threshold && (!match || sim > match.sim)) {
        match = { textEs: k.textEs, sim };
      }
    }
    if (match) {
      dups.push({ q, against: match.textEs });
    } else {
      kept.push({ id: q.id, toks, textEs: q.textEs });
    }
  }

  console.log(`\n${dups.length} duplicadas detectadas (umbral ${threshold}):\n`);
  for (const { q, against } of dups) {
    console.log(`✗ [${q.topic.nameEs}] ${q.textEs.slice(0, 70)}`);
    console.log(`   ≈ ${against.slice(0, 70)}\n`);
  }

  if (!apply) {
    console.log(`(Simulación) Añade --apply para eliminarlas. Aprobadas: intactas.`);
  } else if (dups.length > 0) {
    await prisma.question.deleteMany({ where: { id: { in: dups.map((d) => d.q.id) } } });
    console.log(`✓ ${dups.length} duplicadas eliminadas (solo pendientes).`);
  }
  await prisma.$disconnect();
}
