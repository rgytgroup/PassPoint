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

export interface QuestionOption {
  textEn: string;
  textEs: string;
  correct: boolean;
}

export interface Question {
  id: string;
  topicId: string;
  textEn: string;
  textEs: string;
  options: QuestionOption[];
  explanationEn: string;
  explanationEs: string;
  manualRef: string;
  difficulty: number;
  isFree: boolean;
}

export interface TopicRef {
  slug: string;
  nameEn: string;
  nameEs: string;
}

export interface MockQuestion extends Question {
  topic: TopicRef;
}

export interface MockExam {
  state: {
    id: string;
    code: string;
    nameEn: string;
    nameEs: string;
    examQuestionCount: number;
    passThreshold: number;
  };
  questions: MockQuestion[];
}
