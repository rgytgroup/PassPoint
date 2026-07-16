import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import { strings, type Lang, type StringKey } from './strings';

interface LangContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  toggle: () => void;
  /** Traducción de una clave de UI. Toggle ES⇄EN instantáneo, sin recarga (SPEC §4.3). */
  t: (key: StringKey) => string;
  /** Elige el campo …Es / …En de un objeto bilingüe del contenido. */
  pick: <T extends Record<string, unknown>>(obj: T, base: string) => unknown;
}

const STORAGE_KEY = 'passpoint.lang';

const LangContext = createContext<LangContextValue | null>(null);

function initialLang(): Lang {
  if (typeof localStorage !== 'undefined') {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'ES' || saved === 'EN') return saved;
  }
  return 'ES';
}

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(initialLang);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, next);
    }
    if (typeof document !== 'undefined') {
      document.documentElement.lang = next.toLowerCase();
    }
  }, []);

  const toggle = useCallback(
    () => setLang(lang === 'ES' ? 'EN' : 'ES'),
    [lang, setLang],
  );

  const t = useCallback((key: StringKey) => strings[lang][key], [lang]);

  const pick = useCallback(
    <T extends Record<string, unknown>>(obj: T, base: string) =>
      obj[`${base}${lang === 'ES' ? 'Es' : 'En'}`],
    [lang],
  );

  return (
    <LangContext.Provider value={{ lang, setLang, toggle, t, pick }}>
      {children}
    </LangContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useLang(): LangContextValue {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error('useLang debe usarse dentro de <LangProvider>');
  return ctx;
}
