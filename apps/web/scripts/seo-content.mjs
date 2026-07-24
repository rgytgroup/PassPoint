// Contenido curado para las páginas SEO estáticas (SPEC §4.8).
// Español (el objetivo es "examen de manejo en español"). Redacción original.
// El sitio bilingüe/interactivo vive en la SPA; estas páginas son el imán SEO.

// Dominio de producción para canonical/sitemap.
// Prioridad: SITE_URL (dominio propio) → URL de producción que inyecta Vercel
// automáticamente (VERCEL_PROJECT_PRODUCTION_URL, sin protocolo) → local.
const vercelUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : undefined;

export const site = {
  name: 'PassPoint',
  url: process.env.SITE_URL || vercelUrl || 'http://localhost:4173',
  disclaimer:
    'PassPoint es una aplicación independiente, no afiliada a ningún DMV ni entidad gubernamental.',
};

/** Una pregunta de ejemplo (imán). */
const q = (question, options, correct, explanation) => ({
  question,
  options,
  correct,
  explanation,
});

export const states = [
  {
    code: 'CA',
    slug: 'ca',
    nameEs: 'California',
    examCount: 46,
    passCount: 38,
    intro:
      'El examen teórico del DMV de California tiene 46 preguntas y necesitas 38 correctas para aprobar. Practica en español con preguntas basadas en el manual oficial.',
    topics: [
      {
        slug: 'senales',
        nameEs: 'Señales de tránsito',
        intro:
          'Las señales de tránsito son una parte central del examen del DMV de California. Aprende a reconocer las señales reglamentarias, preventivas e informativas.',
        questions: [
          q(
            '¿Qué significa una señal roja de forma octagonal?',
            ['Detenerse por completo', 'Reducir la velocidad', 'Ceder el paso si hay tráfico'],
            0,
            'Una señal octagonal roja siempre significa ALTO total.',
          ),
          q(
            'Una señal amarilla en forma de rombo indica:',
            ['Una advertencia sobre la vía', 'Una orden obligatoria', 'Información de servicios'],
            0,
            'Las señales amarillas en rombo advierten de peligros o cambios adelante.',
          ),
        ],
      },
      {
        slug: 'normas',
        nameEs: 'Normas de circulación',
        intro:
          'Las normas de circulación cubren el derecho de paso, los límites de velocidad y las reglas básicas de manejo en California.',
        questions: [
          q(
            '¿Cuándo debe ceder el paso a un peatón?',
            ['En cualquier cruce, marcado o no', 'Solo donde hay semáforo', 'Nunca'],
            0,
            'Debe ceder el paso a los peatones en todos los cruces, marcados o no.',
          ),
          q(
            'Límite de velocidad por defecto en zona residencial:',
            ['25 mph', '45 mph', '15 mph'],
            0,
            'El límite por defecto en zonas residenciales de California es 25 mph.',
          ),
        ],
      },
      {
        slug: 'estacionamiento',
        nameEs: 'Estacionamiento',
        intro:
          'Conoce los colores de los bordes de acera y cómo estacionar en pendientes, temas frecuentes en el examen de California.',
        questions: [
          q(
            '¿Qué significa un borde de acera pintado de rojo?',
            ['Prohibido parar o estacionar', 'Estacionar 15 minutos', 'Zona de carga'],
            0,
            'Un borde rojo significa que no se puede parar, detenerse ni estacionar.',
          ),
        ],
      },
    ],
    // Test gratis embebido (imán de 5 preguntas).
    freeQuestions: [
      q('¿Qué significa una señal roja octagonal?', ['Detenerse por completo', 'Reducir la velocidad', 'Ceder el paso'], 0, 'Octágono rojo = ALTO total.'),
      q('¿Cuándo cede el paso a un peatón?', ['En cualquier cruce', 'Solo con semáforo', 'Nunca'], 0, 'Siempre en los cruces, marcados o no.'),
      q('Velocidad por defecto en zona residencial:', ['25 mph', '40 mph', '15 mph'], 0, 'Por defecto son 25 mph.'),
      q('Un borde de acera rojo significa:', ['No parar ni estacionar', 'Carga y descarga', '15 minutos'], 0, 'Prohibido parar/estacionar.'),
      q('Una señal amarilla en rombo es:', ['Preventiva (advertencia)', 'Reglamentaria', 'De servicios'], 0, 'Advierte de un peligro adelante.'),
    ],
    faqs: [
      { slug: 'cuantas-preguntas', question: '¿Cuántas preguntas tiene el examen del DMV de California?', answer: 'El examen teórico tiene 46 preguntas y debes responder correctamente al menos 38 para aprobar.' },
      { slug: 'es-en-espanol', question: '¿Puedo hacer el examen del DMV de California en español?', answer: 'Sí. El DMV de California ofrece el examen escrito en español, y puedes practicar en español con PassPoint.' },
      { slug: 'que-pasa-si-repruebo', question: '¿Qué pasa si repruebo el examen escrito?', answer: 'Puedes volver a presentarlo. El DMV suele permitir varios intentos; practica tus preguntas falladas antes de reintentar.' },
      { slug: 'documentos-necesarios', question: '¿Qué documentos necesito para el examen?', answer: 'Generalmente necesitas prueba de identidad, comprobante de domicilio y el pago de la tarifa. Consulta el DMV para tu caso.' },
      { slug: 'edad-minima', question: '¿Cuál es la edad mínima para el permiso de aprendizaje?', answer: 'En California puedes solicitar el permiso de aprendizaje desde los 15 años y medio con educación vial.' },
      { slug: 'costo', question: '¿Cuánto cuesta la licencia de manejo?', answer: 'La tarifa la fija el DMV y cambia con el tiempo. Verifica el costo vigente en el sitio oficial del DMV.' },
      { slug: 'examen-de-vista', question: '¿Hay examen de la vista?', answer: 'Sí, se realiza una prueba de visión al tramitar la licencia o el permiso.' },
      { slug: 'cuanto-dura', question: '¿Cuánto tiempo dura el examen escrito?', answer: 'No hay un límite estricto para la mayoría; tómate tu tiempo. Con PassPoint puedes simularlo cronometrado.' },
      { slug: 'senales-mas-comunes', question: '¿Cuáles son las señales más comunes del examen?', answer: 'Alto, ceda el paso, límite de velocidad, no entre y las preventivas amarillas. Estúdialas en el módulo de señales.' },
      { slug: 'como-agendar-cita', question: '¿Cómo agendo una cita en el DMV?', answer: 'Se agenda en el sitio web del DMV de California. Lleva tus documentos y llega con anticipación.' },
      { slug: 'como-practicar', question: '¿Cómo practico para el examen del DMV?', answer: 'Practica por tema, haz simulacros con el formato real y repasa tus preguntas falladas. PassPoint te muestra tu probabilidad de aprobar.' },
    ],
  },
];
