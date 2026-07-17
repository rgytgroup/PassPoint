import './env.js';
import { GoogleGenAI } from '@google/genai';

// Alias que Google mantiene apuntando al modelo flash vigente (no se queda
// obsoleto para proyectos nuevos). Se puede fijar con GEMINI_MODEL.
const MODEL = process.env.GEMINI_MODEL ?? 'gemini-flash-latest';

/** ¿Hay una GEMINI_API_KEY real configurada? */
export function isGeminiConfigured(): boolean {
  const key = process.env.GEMINI_API_KEY;
  return Boolean(key && !key.startsWith('PEGA_'));
}

let client: GoogleGenAI | null = null;
function getClient(): GoogleGenAI {
  if (!isGeminiConfigured()) {
    throw new Error('Falta GEMINI_API_KEY en content-factory/.env.');
  }
  if (!client) {
    client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return client;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Limpia la respuesta: quita fences markdown y recorta al bloque JSON. */
function cleanJson(text: string): string {
  let t = text.trim();
  if (t.startsWith('```')) {
    t = t
      .replace(/^```(?:json)?/i, '')
      .replace(/```$/, '')
      .trim();
  }
  // Recorta a lo que hay entre el primer [ o { y su cierre correspondiente.
  const firstArr = t.indexOf('[');
  const firstObj = t.indexOf('{');
  const start =
    firstArr === -1 ? firstObj : firstObj === -1 ? firstArr : Math.min(firstArr, firstObj);
  const end = Math.max(t.lastIndexOf(']'), t.lastIndexOf('}'));
  if (start >= 0 && end > start) t = t.slice(start, end + 1);
  return t;
}

/** Llama a Gemini pidiendo salida JSON y la parsea. Reintenta ante errores
 * transitorios (429/500/503) y ante JSON malformado. */
export async function generateJson<T>(prompt: string): Promise<T> {
  const ai = getClient();
  const maxAttempts = 4;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const res = await ai.models.generateContent({
        model: MODEL,
        contents: prompt,
        config: { responseMimeType: 'application/json' },
      });
      return JSON.parse(cleanJson(res.text ?? '')) as T;
    } catch (err: unknown) {
      const status = (err as { status?: number })?.status;
      const isParse = err instanceof SyntaxError;
      const retryable = isParse || status === 429 || status === 500 || status === 503;
      if (!retryable || attempt === maxAttempts) throw err;
      const waitMs = isParse ? 500 : attempt * 2000;
      console.log(
        `  (${isParse ? 'JSON inválido' : `Gemini ${status}`}, reintento ${attempt}/${maxAttempts - 1}…)`,
      );
      await sleep(waitMs);
    }
  }
  throw new Error('inalcanzable');
}
