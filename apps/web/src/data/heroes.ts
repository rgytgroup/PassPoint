// Hero Image oficial por estado (Master Visual §4): la misma imagen se reutiliza
// en todas las pantallas del estado. Los archivos viven en public/heroes/.
// Si un estado no tiene foto, la UI cae a un degradado con el color de marca.
// Créditos y licencias: public/heroes/CREDITS.md.
const HERO_STATES = new Set(['ca', 'fl', 'ny', 'tx', 'ga']);

export function heroFor(code: string): string | null {
  const c = code.toLowerCase();
  return HERO_STATES.has(c) ? `/heroes/${c}.jpg` : null;
}
