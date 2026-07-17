import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

/** true si hay credenciales de Supabase; si no, la auth queda deshabilitada. */
export const isAuthConfigured = Boolean(url && anonKey);

/** Cliente de Supabase, o null si aún no se configuró (el resto de la app sigue funcionando). */
export const supabase: SupabaseClient | null = isAuthConfigured
  ? createClient(url!, anonKey!)
  : null;
