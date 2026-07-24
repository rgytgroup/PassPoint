import { Link } from 'react-router-dom';
import { useLang } from '../i18n/LangContext';
import { api } from '../api/client';
import { useAsync } from '../api/useAsync';
import { Card } from '../ui/Card';

export function Home() {
  const { t, lang } = useLang();
  const es = lang === 'ES';
  const { data: states, loading, error } = useAsync(() => api.listStates(), []);

  return (
    <div>
      {/* Hero inmersivo (fondo oscuro reservado, SPEC §12.1) */}
      <section className="rounded-3xl bg-background-dark px-6 py-10 text-text-on-dark">
        <h1 className="max-w-md text-3xl font-extrabold leading-tight">
          {t('tagline')}
        </h1>
        <p className="mt-3 max-w-md text-sm text-text-on-dark/70">
          {es
            ? 'Preguntas al estilo del examen real, basadas en el manual oficial de tu estado. Practica, simula y mide qué tan listo estás.'
            : "Exam-style questions based on your state's official driver handbook. Practice, simulate and measure how ready you are."}
        </p>
      </section>

      {/* Selector de estado */}
      <h2 className="mt-8 text-lg font-bold text-text-primary">
        {t('selectState')}
      </h2>

      {loading && <p className="mt-4 text-text-secondary">Cargando…</p>}
      {error && (
        <p className="mt-4 rounded-xl bg-error/10 px-4 py-3 text-sm text-error">
          No se pudo cargar la lista de estados. ¿Está corriendo la API?
        </p>
      )}

      {states && (
        <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {states.map((state) => (
            <li key={state.id}>
              <Link to={`/${state.code.toLowerCase()}`} className="block">
                <Card className="flex items-center gap-3 p-4 transition-shadow hover:shadow-md">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-base font-extrabold text-primary">
                    {state.code}
                  </span>
                  <span className="text-sm font-semibold text-text-primary">
                    {es ? state.nameEs : state.nameEn}
                  </span>
                </Card>
              </Link>
            </li>
          ))}
          {/* Aspiración honesta: solo los con banco aprobado se listan; el resto "próximamente" (SPEC §11.4). */}
          <li>
            <div className="flex h-full items-center gap-3 rounded-2xl border border-dashed border-border p-4 text-text-secondary">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-border text-base font-bold">
                +
              </span>
              <span className="text-sm font-medium">
                {es ? 'Más estados pronto' : 'More states soon'}
              </span>
            </div>
          </li>
        </ul>
      )}

      <p className="mt-8 text-center text-xs text-text-secondary">
        {t('notAffiliated')}
      </p>
    </div>
  );
}
