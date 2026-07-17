import type { ReactNode } from 'react';

export type SignCategory = 'reglamentaria' | 'preventiva' | 'informativa';

export interface Sign {
  id: string;
  category: SignCategory;
  svg: ReactNode;
  nameEs: string;
  nameEn: string;
  meaningEs: string;
  meaningEn: string;
}

export const categoryLabels: Record<SignCategory, { es: string; en: string }> = {
  reglamentaria: { es: 'Reglamentarias', en: 'Regulatory' },
  preventiva: { es: 'Preventivas', en: 'Warning' },
  informativa: { es: 'Informativas', en: 'Guide' },
};

// SVGs originales (renderizaciones propias) de señales comunes en EE. UU.
// viewBox 0 0 100 100 para todas, así se escalan uniforme.

export const signs: Sign[] = [
  {
    id: 'stop',
    category: 'reglamentaria',
    nameEs: 'Alto',
    nameEn: 'Stop',
    meaningEs: 'Detente por completo. Cede el paso antes de continuar.',
    meaningEn: 'Come to a full stop. Yield before proceeding.',
    svg: (
      <svg viewBox="0 0 100 100" role="img" aria-label="Alto">
        <polygon
          points="30,6 70,6 94,30 94,70 70,94 30,94 6,70 6,30"
          fill="#c1121f"
          stroke="#fff"
          strokeWidth="4"
        />
        <text
          x="50"
          y="60"
          textAnchor="middle"
          fill="#fff"
          fontSize="24"
          fontWeight="bold"
          fontFamily="Arial, sans-serif"
        >
          STOP
        </text>
      </svg>
    ),
  },
  {
    id: 'yield',
    category: 'reglamentaria',
    nameEs: 'Ceda el paso',
    nameEn: 'Yield',
    meaningEs: 'Reduce la velocidad y cede el paso al tráfico y peatones.',
    meaningEn: 'Slow down and give way to traffic and pedestrians.',
    svg: (
      <svg viewBox="0 0 100 100" role="img" aria-label="Ceda el paso">
        <polygon
          points="8,16 92,16 50,92"
          fill="#fff"
          stroke="#c1121f"
          strokeWidth="9"
          strokeLinejoin="round"
        />
        <text
          x="50"
          y="45"
          textAnchor="middle"
          fill="#c1121f"
          fontSize="16"
          fontWeight="bold"
          fontFamily="Arial, sans-serif"
        >
          YIELD
        </text>
      </svg>
    ),
  },
  {
    id: 'do-not-enter',
    category: 'reglamentaria',
    nameEs: 'No entre',
    nameEn: 'Do not enter',
    meaningEs: 'Prohibido el paso de vehículos en esa dirección.',
    meaningEn: 'No vehicle entry in that direction.',
    svg: (
      <svg viewBox="0 0 100 100" role="img" aria-label="No entre">
        <circle cx="50" cy="50" r="44" fill="#c1121f" />
        <rect x="24" y="43" width="52" height="14" rx="2" fill="#fff" />
      </svg>
    ),
  },
  {
    id: 'speed-limit',
    category: 'reglamentaria',
    nameEs: 'Límite de velocidad',
    nameEn: 'Speed limit',
    meaningEs: 'Velocidad máxima permitida en esa vía (en millas por hora).',
    meaningEn: 'Maximum legal speed on that road (in miles per hour).',
    svg: (
      <svg viewBox="0 0 100 100" role="img" aria-label="Límite de velocidad">
        <rect
          x="18"
          y="8"
          width="64"
          height="84"
          rx="4"
          fill="#fff"
          stroke="#111"
          strokeWidth="4"
        />
        <text x="50" y="34" textAnchor="middle" fill="#111" fontSize="13" fontFamily="Arial, sans-serif">
          SPEED
        </text>
        <text x="50" y="50" textAnchor="middle" fill="#111" fontSize="13" fontFamily="Arial, sans-serif">
          LIMIT
        </text>
        <text x="50" y="80" textAnchor="middle" fill="#111" fontSize="30" fontWeight="bold" fontFamily="Arial, sans-serif">
          65
        </text>
      </svg>
    ),
  },
  {
    id: 'no-u-turn',
    category: 'reglamentaria',
    nameEs: 'Prohibido cambio de sentido',
    nameEn: 'No U-turn',
    meaningEs: 'No está permitido girar en U para invertir el sentido.',
    meaningEn: 'Making a U-turn is not allowed here.',
    svg: (
      <svg viewBox="0 0 100 100" role="img" aria-label="Prohibido cambio de sentido">
        <rect x="10" y="10" width="80" height="80" rx="6" fill="#fff" stroke="#111" strokeWidth="4" />
        <path
          d="M38 74 V50 a12 12 0 0 1 24 0 V60"
          fill="none"
          stroke="#111"
          strokeWidth="7"
          strokeLinecap="round"
        />
        <polygon points="55,60 69,60 62,74" fill="#111" />
        <circle cx="50" cy="50" r="34" fill="none" stroke="#c1121f" strokeWidth="7" />
        <line x1="26" y1="74" x2="74" y2="26" stroke="#c1121f" strokeWidth="7" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 'curve',
    category: 'preventiva',
    nameEs: 'Curva',
    nameEn: 'Curve ahead',
    meaningEs: 'La vía se curva adelante; reduce la velocidad.',
    meaningEn: 'The road curves ahead; reduce your speed.',
    svg: (
      <svg viewBox="0 0 100 100" role="img" aria-label="Curva">
        <polygon points="50,6 94,50 50,94 6,50" fill="#f4c20d" stroke="#111" strokeWidth="4" />
        <path d="M40 74 V56 a14 14 0 0 1 20 -12" fill="none" stroke="#111" strokeWidth="7" strokeLinecap="round" />
        <polygon points="54,30 72,40 56,52" fill="#111" />
      </svg>
    ),
  },
  {
    id: 'pedestrian',
    category: 'preventiva',
    nameEs: 'Cruce de peatones',
    nameEn: 'Pedestrian crossing',
    meaningEs: 'Zona de cruce peatonal; cede el paso a las personas.',
    meaningEn: 'Pedestrian crossing zone; yield to people.',
    svg: (
      <svg viewBox="0 0 100 100" role="img" aria-label="Cruce de peatones">
        <polygon points="50,6 94,50 50,94 6,50" fill="#f4c20d" stroke="#111" strokeWidth="4" />
        <circle cx="50" cy="34" r="6" fill="#111" />
        <path d="M50 40 v20 M50 46 l-9 6 M50 46 l9 6 M50 60 l-7 14 M50 60 l7 14" stroke="#111" strokeWidth="4" strokeLinecap="round" fill="none" />
      </svg>
    ),
  },
  {
    id: 'railroad',
    category: 'preventiva',
    nameEs: 'Cruce de ferrocarril',
    nameEn: 'Railroad crossing',
    meaningEs: 'Cruce de vías del tren adelante; extrema la precaución.',
    meaningEn: 'Railroad tracks ahead; use extra caution.',
    svg: (
      <svg viewBox="0 0 100 100" role="img" aria-label="Cruce de ferrocarril">
        <circle cx="50" cy="50" r="44" fill="#f4c20d" stroke="#111" strokeWidth="4" />
        <line x1="24" y1="24" x2="76" y2="76" stroke="#111" strokeWidth="6" />
        <line x1="76" y1="24" x2="24" y2="76" stroke="#111" strokeWidth="6" />
        <text x="34" y="56" textAnchor="middle" fill="#111" fontSize="22" fontWeight="bold" fontFamily="Arial, sans-serif">R</text>
        <text x="66" y="56" textAnchor="middle" fill="#111" fontSize="22" fontWeight="bold" fontFamily="Arial, sans-serif">R</text>
      </svg>
    ),
  },
  {
    id: 'school',
    category: 'preventiva',
    nameEs: 'Zona escolar',
    nameEn: 'School zone',
    meaningEs: 'Zona de escuela; reduce la velocidad y vigila a los niños.',
    meaningEn: 'School zone; slow down and watch for children.',
    svg: (
      <svg viewBox="0 0 100 100" role="img" aria-label="Zona escolar">
        <polygon points="50,6 90,34 74,90 26,90 10,34" fill="#39b54a" stroke="#111" strokeWidth="4" />
        <circle cx="42" cy="40" r="5" fill="#111" />
        <path d="M42 45 v14 M42 49 l-7 5 M42 49 l7 5 M42 59 l-6 12 M42 59 l6 12" stroke="#111" strokeWidth="3" strokeLinecap="round" fill="none" />
        <circle cx="60" cy="44" r="5" fill="#111" />
        <path d="M60 49 v13 M60 52 l-6 5 M60 52 l6 5 M60 62 l-5 11 M60 62 l5 11" stroke="#111" strokeWidth="3" strokeLinecap="round" fill="none" />
      </svg>
    ),
  },
  {
    id: 'hospital',
    category: 'informativa',
    nameEs: 'Hospital',
    nameEn: 'Hospital',
    meaningEs: 'Indica la dirección o cercanía de un hospital.',
    meaningEn: 'Indicates the direction or presence of a hospital.',
    svg: (
      <svg viewBox="0 0 100 100" role="img" aria-label="Hospital">
        <rect x="10" y="10" width="80" height="80" rx="6" fill="#0057b8" />
        <rect x="42" y="26" width="16" height="48" fill="#fff" />
        <rect x="26" y="42" width="48" height="16" fill="#fff" />
      </svg>
    ),
  },
];
