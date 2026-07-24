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

export interface ReviewQuestion extends Question {
  topic: TopicRef;
  stateCode: string;
  timesWrong: number;
}

export interface Readiness {
  percent: number;
  seen: number;
  mastered: number;
  total: number;
}

// ── Smart Study (SPEC §11.1) — motor de reglas, cero IA en runtime ──

export interface TopicMastery {
  slug: string;
  nameEn: string;
  nameEs: string;
  total: number;
  seen: number;
  mastered: number;
  mastery: number; // % dominio, múltiplo de 5
  weak: boolean;
}

export interface StudyPlan {
  count: number;
  estMinutes: number;
  sessionQuestionIds: string[];
}

export interface StudyResponse {
  topicMastery: TopicMastery[];
  focusTopic: { slug: string; nameEn: string; nameEs: string; mastery: number } | null;
  plan: StudyPlan;
}

// ── Gamificación ligera (SPEC §11.3) — sin componente social ──

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
}

export interface Gamification {
  streak: number;
  longestStreak: number;
  studiedToday: boolean;
  achievements: Achievement[];
  dailyChallenge: {
    yesterdayBest: number | null;
    todayBest: number | null;
    beaten: boolean;
  };
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
