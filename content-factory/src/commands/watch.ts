import { getFlag } from '../util/args.js';

// SPEC §6.6 — cron que verifica hash/fecha del manual oficial; si cambió,
// alerta para regenerar los temas afectados.
export async function run(args: string[]): Promise<void> {
  const state = getFlag(args, 'state')?.toUpperCase() ?? 'TODOS';
  console.log(`[watch] Estado ${state}: pendiente de implementar (SPEC §6.6).`);
  console.log('  - Comparar hash/fecha del manual con el último ingestado.');
  console.log('  - Si cambió: alertar y marcar temas para regenerar.');
}
