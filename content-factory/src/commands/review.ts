import { requireState } from '../util/args.js';

// SPEC §6.4 — CLI interactivo de revisión humana 1×1 (aprobar/editar/rechazar)
// → HUMAN_APPROVED. REGLA DURA: el 100% pasa por ojos humanos; el revisor es
// la autoridad final del tono (español latinoamericano natural).
export async function run(args: string[]): Promise<void> {
  const state = requireState(args);
  console.log(`[review] Estado ${state}: pendiente de implementar (SPEC §6.4).`);
  console.log('  - Recorrer AI_VERIFIED 1×1: aprobar / editar / rechazar.');
  console.log('  - Solo lo aprobado por humano pasa a HUMAN_APPROVED.');
}
