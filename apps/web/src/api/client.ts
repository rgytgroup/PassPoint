import type { StateSummary, StateDetail, Question, MockExam } from './types';

// En dev, Vite hace proxy de /api → http://localhost:3000 (ver vite.config.ts).
// En prod se sirve desde el mismo origen o VITE_API_BASE.
const API_BASE = import.meta.env.VITE_API_BASE ?? '';

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}/api${path}`);
  if (!res.ok) {
    throw new Error(`Error ${res.status} al llamar ${path}`);
  }
  return res.json() as Promise<T>;
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
};
