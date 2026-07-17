import './env.js';
import { GoogleGenAI } from '@google/genai';

const MODEL = process.env.GEMINI_MODEL ?? 'gemini-2.5-flash';

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

/** Llama a Gemini pidiendo salida JSON y la parsea. */
export async function generateJson<T>(prompt: string): Promise<T> {
  const ai = getClient();
  const res = await ai.models.generateContent({
    model: MODEL,
    contents: prompt,
    config: { responseMimeType: 'application/json' },
  });
  const text = res.text ?? '';
  return JSON.parse(text) as T;
}
