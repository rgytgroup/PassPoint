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

/** Llama a Gemini pidiendo salida JSON y la parsea. Reintenta ante errores
 * transitorios (429/500/503) con espera creciente. */
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
      return JSON.parse(res.text ?? '') as T;
    } catch (err: unknown) {
      const status = (err as { status?: number })?.status;
      const transient = status === 429 || status === 500 || status === 503;
      if (!transient || attempt === maxAttempts) throw err;
      const waitMs = attempt * 2000;
      console.log(`  (Gemini ${status}, reintento ${attempt}/${maxAttempts - 1} en ${waitMs / 1000}s…)`);
      await sleep(waitMs);
    }
  }
  throw new Error('inalcanzable');
}
