import { Link } from 'react-router-dom';
import { useLang } from '../i18n/LangContext';
import { api } from '../api/client';
import { useAsync } from '../api/useAsync';

export function Home() {
  const { t, pick } = useLang();
  const { data: states, loading, error } = useAsync(() => api.listStates(), []);

  return (
    <section>
      <h1 className="text-3xl font-bold tracking-tight text-slate-900">
        {t('tagline')}
      </h1>

      <h2 className="mt-8 text-lg font-semibold text-slate-700">
        {t('selectState')}
      </h2>

      {loading && <p className="mt-4 text-slate-500">Cargando…</p>}

      {error && (
        <p className="mt-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
          No se pudo cargar la lista de estados ({error}). ¿Está corriendo la API?
        </p>
      )}

      {states && states.length === 0 && (
        <p className="mt-4 text-slate-500">
          Todavía no hay estados activos. Ejecuta el seed de ejemplo.
        </p>
      )}

      {states && states.length > 0 && (
        <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {states.map((state) => (
            <li key={state.id}>
              <Link
                to={`/${state.code.toLowerCase()}`}
                className="block rounded-lg border border-slate-200 bg-white px-4 py-6 text-center hover:border-slate-400 hover:shadow-sm"
              >
                <span className="block text-xl font-bold text-slate-900">
                  {state.code}
                </span>
                <span className="mt-1 block text-sm text-slate-500">
                  {pick(state, 'name') as string}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
