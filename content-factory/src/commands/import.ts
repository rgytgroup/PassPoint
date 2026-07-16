import { requireState } from '../util/args.js';

// SPEC §6.5 — cargar a la base de datos con versión. Usa el mismo esquema
// Prisma que la API (apps/api/prisma/schema.prisma) como fuente de verdad.
export async function run(args: string[]): Promise<void> {
  const state = requireState(args);
  console.log(`[import] Estado ${state}: pendiente de implementar (SPEC §6.5).`);
  console.log('  - Insertar/actualizar preguntas HUMAN_APPROVED con version.');
}
