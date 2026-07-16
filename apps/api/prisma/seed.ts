/**
 * Seed de DESARROLLO — datos de ejemplo para probar la app localmente.
 *
 * ⚠️ NO es contenido de producción. El contenido real se genera con la
 * fábrica (SPEC §6) y pasa por revisión humana. Estas preguntas son
 * originales y simplificadas solo para poblar la DB en dev.
 *
 * Idempotente: se puede correr varias veces sin duplicar.
 * Uso: npm run seed --workspace apps/api
 */
import { PrismaClient, QuestionStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // California (datos reales del formato de examen; contenido de ejemplo).
  const ca = await prisma.state.upsert({
    where: { code: 'CA' },
    update: { active: true },
    create: {
      code: 'CA',
      nameEn: 'California',
      nameEs: 'California',
      examQuestionCount: 46,
      passThreshold: 38,
      manualVersion: '2024',
      manualUrl: 'https://www.dmv.ca.gov/portal/handbook/california-driver-handbook/',
      active: true,
    },
  });

  const topicsData = [
    { slug: 'senales', nameEn: 'Road Signs', nameEs: 'Señales de tránsito', order: 1 },
    { slug: 'normas', nameEn: 'Rules of the Road', nameEs: 'Normas de circulación', order: 2 },
  ];

  for (const t of topicsData) {
    const topic = await prisma.topic.upsert({
      where: { stateId_slug: { stateId: ca.id, slug: t.slug } },
      update: { nameEn: t.nameEn, nameEs: t.nameEs, order: t.order },
      create: { ...t, stateId: ca.id },
    });

    // Regenera las preguntas del tema (idempotencia limpia).
    await prisma.question.deleteMany({ where: { topicId: topic.id } });
    await prisma.question.createMany({
      data: questionsByTopic[t.slug].map((q) => ({ ...q, topicId: topic.id })),
    });
  }

  const total = await prisma.question.count({
    where: { status: QuestionStatus.HUMAN_APPROVED },
  });
  console.log(`Seed listo: California con ${topicsData.length} temas y ${total} preguntas HUMAN_APPROVED.`);
}

type SeedQuestion = {
  textEn: string;
  textEs: string;
  options: { textEn: string; textEs: string; correct: boolean }[];
  explanationEn: string;
  explanationEs: string;
  manualRef: string;
  difficulty: number;
  status: QuestionStatus;
  isFree: boolean;
};

const questionsByTopic: Record<string, SeedQuestion[]> = {
  senales: [
    {
      textEn: 'What does a red octagonal sign mean?',
      textEs: '¿Qué significa una señal roja de forma octagonal?',
      options: [
        { textEn: 'Stop completely', textEs: 'Detenerse por completo', correct: true },
        { textEn: 'Slow down only', textEs: 'Solo reducir la velocidad', correct: false },
        { textEn: 'Yield if there is traffic', textEs: 'Ceder el paso si hay tráfico', correct: false },
      ],
      explanationEn: 'An octagonal red sign always means a full stop.',
      explanationEs: 'Una señal roja octagonal siempre significa alto total.',
      manualRef: 'Señales de tránsito — Señales reglamentarias',
      difficulty: 1,
      status: QuestionStatus.HUMAN_APPROVED,
      isFree: true,
    },
    {
      textEn: 'A yellow diamond-shaped sign indicates:',
      textEs: 'Una señal amarilla en forma de rombo indica:',
      options: [
        { textEn: 'A warning about road conditions', textEs: 'Una advertencia sobre las condiciones de la vía', correct: true },
        { textEn: 'A mandatory order', textEs: 'Una orden obligatoria', correct: false },
        { textEn: 'General information', textEs: 'Información general', correct: false },
      ],
      explanationEn: 'Yellow diamond signs warn of hazards or changes ahead.',
      explanationEs: 'Las señales amarillas en rombo advierten de peligros o cambios más adelante.',
      manualRef: 'Señales de tránsito — Señales preventivas',
      difficulty: 1,
      status: QuestionStatus.HUMAN_APPROVED,
      isFree: true,
    },
  ],
  normas: [
    {
      textEn: 'When must you yield the right of way to a pedestrian?',
      textEs: '¿Cuándo debe ceder el paso a un peatón?',
      options: [
        { textEn: 'At any marked or unmarked crosswalk', textEs: 'En cualquier cruce peatonal, marcado o no', correct: true },
        { textEn: 'Only where there is a traffic light', textEs: 'Solo donde hay semáforo', correct: false },
        { textEn: 'Never, the vehicle goes first', textEs: 'Nunca, el vehículo pasa primero', correct: false },
      ],
      explanationEn: 'Drivers must yield to pedestrians at all crosswalks, marked or not.',
      explanationEs: 'El conductor debe ceder el paso a los peatones en todos los cruces, marcados o no.',
      manualRef: 'Normas de circulación — Derecho de paso',
      difficulty: 2,
      status: QuestionStatus.HUMAN_APPROVED,
      isFree: true,
    },
    {
      textEn: 'What is the speed limit in a residential area unless otherwise posted?',
      textEs: '¿Cuál es el límite de velocidad en una zona residencial salvo que se indique otra cosa?',
      options: [
        { textEn: '25 mph', textEs: '25 mph', correct: true },
        { textEn: '45 mph', textEs: '45 mph', correct: false },
        { textEn: '15 mph', textEs: '15 mph', correct: false },
      ],
      explanationEn: 'The default residential speed limit in California is 25 mph.',
      explanationEs: 'El límite por defecto en zonas residenciales de California es 25 mph.',
      manualRef: 'Normas de circulación — Límites de velocidad',
      difficulty: 2,
      status: QuestionStatus.HUMAN_APPROVED,
      isFree: false,
    },
  ],
};

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
