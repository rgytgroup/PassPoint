// Tipos de las respuestas del API (subconjunto del modelo Prisma que la web
// consume). Se mantienen alineados con apps/api/prisma/schema.prisma.

export interface StateSummary {
  id: string;
  code: string;
  nameEn: string;
  nameEs: string;
  examQuestionCount: number;
  passThreshold: number;
  manualVersion: string | null;
  manualUrl: string | null;
  active: boolean;
}

export interface Topic {
  id: string;
  stateId: string;
  slug: string;
  nameEn: string;
  nameEs: string;
  order: number;
}

export interface StateDetail extends StateSummary {
  topics: Topic[];
}
