import { Link, useParams } from 'react-router-dom';
import { useLang } from '../i18n/LangContext';
import { useAuth } from '../auth/AuthContext';
import { api } from '../api/client';
import { useAsync } from '../api/useAsync';
import { ic, Line } from '../ui/icons';

/** Pantalla Study (Master Visual §Parte 3): temas del estado con su dominio. */
export function Study() {
  const { state: code = '' } = useParams();
  const { pick, lang } = useLang();
  const { email } = useAuth();
  const es = lang === 'ES';

  const { data: state, loading, error } = useAsync(() => api.getState(code), [code]);
  const { data: study } = useAsync(() => (email ? api.getStudy(code) : Promise.resolve(null)), [email, code]);

  if (loading) return <p className="text-text-secondary">Cargando…</p>;
  if (error) return <p className="rounded-xl bg-error/10 px-4 py-3 text-sm text-error">No se pudo cargar ({error}).</p>;
  if (!state) return <p className="text-text-secondary">Estado no disponible.</p>;

  const mastery = new Map((study?.topicMastery ?? []).map((m) => [m.slug, m]));

  return (
    <div>
      <h1 className="text-2xl font-extrabold tracking-tight text-text-primary">{es ? 'Estudiar' : 'Study'}</h1>
      <p className="mt-1 text-sm text-text-secondary">{pick(state, 'name')}</p>

      {/* Smart Study destacado */}
      <Link to={`/${code}/smart`} className="mt-4 flex items-center gap-4 rounded-2xl bg-background-dark p-5 text-text-on-dark">
        <span className="text-3xl">✨</span>
        <div className="min-w-0 flex-1">
          <p className="font-bold">Smart Study</p>
          <p className="text-sm text-text-on-dark/70">
            {es ? 'Enfócate en lo que más fallas.' : 'Focus on what you miss most.'}
          </p>
        </div>
        <Line d={ic.chevR} cls="h-5 w-5" />
      </Link>

      <h2 className="mt-6 text-lg font-bold text-text-primary">{es ? 'Temas' : 'Topics'}</h2>
      <ul className="mt-3 grid gap-3 sm:grid-cols-2">
        {state.topics.map((topic) => {
          const m = mastery.get(topic.slug);
          const pct = m?.mastery ?? 0;
          const barColor = pct >= 80 ? 'bg-success' : m?.weak ? 'bg-warning' : 'bg-primary';
          return (
            <li key={topic.id}>
              <Link to={`/${code}/practica/${topic.slug}`} className="block rounded-2xl border border-border bg-surface p-4 shadow-sm transition hover:border-primary">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-semibold text-text-primary">{pick(topic, 'name')}</span>
                  {m ? (
                    <span className="text-sm font-semibold text-text-secondary">{pct}%</span>
                  ) : (
                    <span className="text-primary"><Line d={ic.chevR} cls="h-4 w-4" /></span>
                  )}
                </div>
                {m && (
                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-border">
                    <div className={`h-full rounded-full ${barColor}`} style={{ width: `${pct}%` }} />
                  </div>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
