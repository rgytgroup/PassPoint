// Cadenas de UI (chrome de la app). El CONTENIDO (preguntas, temas) es
// bilingüe en la DB y se elige con pick(), no desde aquí.
export type Lang = 'ES' | 'EN';

export const strings = {
  ES: {
    appName: 'PassPoint',
    tagline: 'Aprueba tu examen del DMV en español o inglés',
    selectState: 'Elige tu estado',
    practice: 'Práctica',
    mockExam: 'Simulacro',
    signals: 'Señales',
    review: 'Repaso de falladas',
    pricing: 'Precios',
    passProbability: 'Probabilidad de aprobar',
    langToggle: 'EN',
    notAffiliated:
      'App independiente, no afiliada a ningún DMV ni entidad gubernamental.',
  },
  EN: {
    appName: 'PassPoint',
    tagline: 'Pass your DMV test in Spanish or English',
    selectState: 'Choose your state',
    practice: 'Practice',
    mockExam: 'Mock exam',
    signals: 'Road signs',
    review: 'Missed questions',
    pricing: 'Pricing',
    passProbability: 'Probability of passing',
    langToggle: 'ES',
    notAffiliated:
      'Independent app, not affiliated with any DMV or government entity.',
  },
} as const;

export type StringKey = keyof (typeof strings)['ES'];
