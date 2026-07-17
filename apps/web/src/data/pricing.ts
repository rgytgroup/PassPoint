// Precios de la compra única de por vida (SPEC §4.7 / §8).
// PROHIBIDO: suscripciones, anuncios, timers falsos.
export const PRICING = {
  state: { price: '$12.99', scope: 'STATE' as const },
  all: { price: '$19.99', scope: 'ALL' as const },
};
