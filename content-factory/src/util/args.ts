/** Lee `--flag valor` de la lista de argumentos. */
export function getFlag(args: string[], name: string): string | undefined {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : undefined;
}

/** Exige `--state XX` y lo normaliza a mayúsculas. */
export function requireState(args: string[]): string {
  const state = getFlag(args, 'state');
  if (!state) {
    throw new Error('Falta --state (p. ej. --state CA). Estados v1: CA, TX, FL, NY, AZ, IL, NJ, GA.');
  }
  return state.toUpperCase();
}
