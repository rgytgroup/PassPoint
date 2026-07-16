import { requireState } from '../util/args.js';

// SPEC §6.3 — segundo pase de IA que valida cada DRAFT contra su chunk fuente
// (respuesta correcta única, opciones plausibles, español natural).
// Pasa a AI_VERIFIED o marca flags. Prompt en prompts/verify.md.
export async function run(args: string[]): Promise<void> {
  const state = requireState(args);
  console.log(`[verify] Estado ${state}: pendiente de implementar (SPEC §6.3).`);
  console.log('  - Cargar prompt de prompts/verify.md.');
  console.log('  - DRAFT → AI_VERIFIED, o marcar flags si algo no cuadra.');
}
