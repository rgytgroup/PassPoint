import { requireState } from '../util/args.js';

// SPEC §6.1 — descargar/parsear el manual oficial (PDF, EN y ES si existe)
// → chunks con referencia de sección. Cada chunk conserva su `manualRef`.
export async function run(args: string[]): Promise<void> {
  const state = requireState(args);
  console.log(`[ingest] Estado ${state}: pendiente de implementar (SPEC §6.1).`);
  console.log('  - Descargar el manual oficial (usar manualUrl del estado).');
  console.log('  - Parsear a chunks con referencia de sección para anclar preguntas.');
}
