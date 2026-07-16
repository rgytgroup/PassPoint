import { requireState } from '../util/args.js';

// SPEC §6.2 — generar preguntas por tema con plantilla estricta.
// REGLA: cada pregunta DEBE citar el chunk del manual que la sustenta
// (manualRef). Salida a status DRAFT. Prompt en prompts/generate.md.
// PROHIBIDO copiar preguntas de otras apps/bancos licenciados (SPEC §8).
export async function run(args: string[]): Promise<void> {
  const state = requireState(args);
  console.log(`[generate] Estado ${state}: pendiente de implementar (SPEC §6.2).`);
  console.log('  - Cargar prompt de prompts/generate.md (versionado en git).');
  console.log('  - Preguntas originales ancladas a un chunk → DRAFT. GEMINI_API_KEY.');
}
