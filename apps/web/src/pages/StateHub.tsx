import { Link, useParams } from 'react-router-dom';
import { useLang } from '../i18n/LangContext';
import { api } from '../api/client';
import { useAsync } from '../api/useAsync';
import { ReadinessCard } from '../components/ReadinessCard';
import { AccessBanner } from '../components/AccessBanner';

export function StateHub() {
  const { state: code = '' } = useParams();
  const { t, pick } = useLang();
  const { data: state, loading, error } = useAsync(
    () => api.getState(code),
    [code],
  );

  if (loading) return <p className="text-slate-500">Cargando…</p>;

  if (error) {
    return (
      <p className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
        No se pudo cargar el estado ({error}).
      </p>
    );
  }

  if (!state) {
    return (
      <section>
        <h1 className="text-2xl font-bold text-slate-900">
          Estado no disponible
        </h1>
        <p className="mt-2 text-slate-500">
          El estado «{code.toUpperCase()}» aún no está activo.{' '}
          <Link to="/" className="text-slate-900 underline">
            Ver estados disponibles
          </Link>
          .
        </p>
      </section>
    );
  }

  return (
    <section>
      <h1 className="text-3xl font-bold text-slate-900">
        {pick(state, 'name') as string}
      </h1>
      <p className="mt-2 text-slate-500">
        Examen de {state.examQuestionCount} preguntas · aprueba con{' '}
        {state.passThreshold}.
      </p>

      <AccessBanner code={code} />
      <ReadinessCard code={code} />

      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          to={`/${code}/simulacro`}
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
        >
          {t('mockExam')}
        </Link>
        <Link
          to={`/${code}/senales`}
          className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-100"
        >
          {t('signals')}
        </Link>
      </div>

      <h2 className="mt-10 text-lg font-semibold text-slate-700">
        {t('practice')}
      </h2>
      <ul className="mt-4 space-y-2">
        {state.topics.map((topic) => (
          <li key={topic.id}>
            <Link
              to={`/${code}/practica/${topic.slug}`}
              className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-3 hover:border-slate-400 hover:shadow-sm"
            >
              <span className="font-medium text-slate-900">
                {pick(topic, 'name') as string}
              </span>
              <span className="text-slate-400">→</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
