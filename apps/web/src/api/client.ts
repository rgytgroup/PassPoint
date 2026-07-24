import type {
  StateSummary,
  StateDetail,
  Question,
  MockExam,
  MockQuestion,
  ReviewQuestion,
  Readiness,
  StudyResponse,
  Gamification,
} from './types';

// En dev, Vite hace proxy de /api → http://localhost:3000 (ver vite.config.ts).
// En prod se sirve desde el mismo origen o VITE_API_BASE.
const API_BASE = import.meta.env.VITE_API_BASE ?? '';

// Token de acceso de Supabase, inyectado por AuthContext al iniciar/cerrar sesión.
let authToken: string | null = null;
export function setAuthToken(token: string | null): void {
  authToken = token;
}

function authHeaders(): Record<string, string> {
  return authToken ? { Authorization: `Bearer ${authToken}` } : {};
}

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}/api${path}`, { headers: authHeaders() });
  if (!res.ok) {
    throw new Error(`Error ${res.status} al llamar ${path}`);
  }
  return res.json() as Promise<T>;
}

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}/api${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(`Error ${res.status} al llamar ${path}`);
  }
  return res.json() as Promise<T>;
}

export interface SaveAttemptBody {
  stateCode: string;
  mode: 'PRACTICE' | 'MOCK';
  answers: { questionId: string; chosenIndex: number }[];
}

export interface AttemptResult {
  id: string;
  score: number;
  total: number;
  passed: boolean;
}

export interface MeResponse {
  id: string;
  email: string;
  preferredLang: 'ES' | 'EN';
}

export const api = {
  /** Estados activos para el selector (SPEC §4.1). */
  listStates: () => get<StateSummary[]>('/states'),
  /** Estado por código con sus temas (SPEC §4.2). */
  getState: (code: string) => get<StateDetail | null>(`/states/${code}`),
  /** Preguntas HUMAN_APPROVED de un tema para la práctica (SPEC §4.3). */
  getTopicQuestions: (code: string, slug: string) =>
    get<Question[]>(`/states/${code}/topics/${slug}/questions`),
  /** Simulacro del estado: preguntas barajadas con su tema (SPEC §4.4). */
  getMock: (code: string) => get<MockExam>(`/states/${code}/mock`),
  /** Usuario autenticado (requiere sesión). */
  getMe: () => get<MeResponse>('/me'),
  /** Guarda un intento y actualiza estadísticas (requiere sesión, SPEC §3). */
  saveAttempt: (body: SaveAttemptBody) =>
    post<AttemptResult>('/attempts', body),
  /** Preguntas falladas del usuario para el repaso (requiere sesión, SPEC §4.6). */
  getReview: () => get<ReviewQuestion[]>('/me/review'),
  /** Registra una respuesta del repaso; al acertar, limpia la pregunta. */
  recordReviewAnswer: (questionId: string, correct: boolean) =>
    post<{ ok: boolean }>('/me/review/answer', { questionId, correct }),
  /** Probabilidad de aprobar del usuario en un estado (requiere sesión, SPEC §5). */
  getReadiness: (code: string) => get<Readiness>(`/me/readiness/${code}`),
  /** Dominio por tema + "Plan de hoy" del Smart Study (requiere sesión, SPEC §11.1). */
  getStudy: (code: string) => get<StudyResponse>(`/me/study/${code}`),
  /** Preguntas de la sesión Smart Study dirigida (requiere sesión, SPEC §11.1). */
  getSmartSession: (code: string) =>
    get<MockQuestion[]>(`/me/study/${code}/session`),
  /** Racha, logros y reto diario (requiere sesión, SPEC §11.3). */
  getGamification: (lang: 'ES' | 'EN') =>
    get<Gamification>(`/me/gamification?lang=${lang}`),
  /** ¿El usuario tiene acceso pagado a un estado? (requiere sesión, SPEC §5). */
  getAccess: (code: string) => get<{ access: boolean }>(`/me/access/${code}`),
  /** Inicia el checkout de Stripe; devuelve la URL a la que redirigir (SPEC §4.7). */
  startCheckout: (scope: 'STATE' | 'ALL', stateCode?: string) =>
    post<{ url: string | null }>('/checkout', { scope, stateCode }),
  /**
   * Precachea el banco completo del estado para uso sin conexión (SPEC §5):
   * al recorrer estos GET, el service worker (NetworkFirst) guarda las
   * respuestas en caché, quedando disponibles offline.
   */
  prefetchOfflineBank: async (code: string) => {
    const state = await get<StateDetail | null>(`/states/${code}`);
    if (!state) return { topics: 0, questions: 0 };
    let questions = 0;
    for (const topic of state.topics) {
      const qs = await get<Question[]>(
        `/states/${code}/topics/${topic.slug}/questions`,
      );
      questions += qs.length;
    }
    await get<MockExam>(`/states/${code}/mock`).catch(() => undefined);
    return { topics: state.topics.length, questions };
  },
};
