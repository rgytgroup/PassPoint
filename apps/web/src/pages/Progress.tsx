import { Link, useParams } from 'react-router-dom';
import { useLang } from '../i18n/LangContext';
import { useAuth } from '../auth/AuthContext';
import { api } from '../api/client';
import { useAsync } from '../api/useAsync';
import { RingGauge } from '../ui/RingGauge';
import { Line, ic } from '../ui/icons';

/** Pantalla Progress (Master Visual §Parte 3): preparación, dominio y logros. */
export function Progress() {
  const { state: code = '' } = useParams();
  const { pick, lang } = useLang();
  const { email, configured } = useAuth();
  const es = lang === 'ES';

  const { data: readiness } = useAsync(() => (email ? api.getReadiness(code) : Promise.resolve(null)), [email, code]);
  const { data: study } = useAsync(() => (email ? api.getStudy(code) : Promise.resolve(null)), [email, code]);
  const { data: game } = useAsync(() => (email ? api.getGamification(lang) : Promise.resolve(null)), [email, lang]);

  if (!email) {
    return (
      <div>
        <h1 className="text-2xl font-extrabold text-text-primary">{es ? 'Progreso' : 'Progress'}</h1>
        <p className="mt-2 text-text-secondary">
          {configured ? (es ? 'Inicia sesión para ver tu progreso.' : 'Sign in to see your progress.') : (es ? 'Sesión no configurada.' : 'Sign-in not configured.')}
        </p>
        {configured && (
          <Link to="/entrar" className="mt-4 inline-block rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white">
            {es ? 'Entrar' : 'Sign in'}
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold tracking-tight text-text-primary">{es ? 'Progreso' : 'Progress'}</h1>

      {/* Ready Score + racha */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex items-center gap-5 rounded-2xl border border-border bg-surface p-5 shadow-sm">
          <RingGauge value={readiness?.percent ?? 0} size={130} label={es ? 'Listo' : 'Ready'} />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-text-secondary">{es ? 'Preparación' : 'Readiness'}</p>
            {readiness && (
              <p className="mt-1 text-sm text-text-secondary">
                {readiness.mastered} / {readiness.total} {es ? 'dominadas' : 'mastered'}
              </p>
            )}
          </div>
        </div>
        {game && (
          <div className="flex items-center gap-4 rounded-2xl border border-border bg-surface p-5 shadow-sm">
            <span className="text-4xl">🔥</span>
            <div>
              <p className="text-3xl font-extrabold text-text-primary">{game.streak}</p>
              <p className="text-sm text-text-secondary">
                {es ? 'días de racha · mejor' : 'day streak · best'} {game.longestStreak}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Dominio por tema */}
      {study && study.topicMastery.length > 0 && (
        <div>
          <h2 className="text-lg font-bold text-text-primary">{es ? 'Dominio por tema' : 'Topic mastery'}</h2>
          <ul className="mt-3 space-y-2">
            {study.topicMastery.map((m) => {
              const barColor = m.mastery >= 80 ? 'bg-success' : m.weak ? 'bg-warning' : 'bg-primary';
              return (
                <li key={m.slug}>
                  <Link to={`/${code}/practica/${m.slug}`} className="block rounded-2xl border border-border bg-surface p-4 shadow-sm transition hover:border-primary">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-text-primary">{pick(m, 'name')}</span>
                      <span className="text-sm font-semibold text-text-secondary">{m.mastery}%</span>
                    </div>
                    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-border">
                      <div className={`h-full rounded-full ${barColor}`} style={{ width: `${m.mastery}%` }} />
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* Logros */}
      {game && (
        <div>
          <h2 className="text-lg font-bold text-text-primary">{es ? 'Logros' : 'Achievements'}</h2>
          <ul className="mt-3 grid gap-3 sm:grid-cols-2">
            {game.achievements.map((a) => (
              <li key={a.id}>
                <div className={`flex items-center gap-3 rounded-2xl border border-border bg-surface p-4 shadow-sm ${a.unlocked ? '' : 'opacity-55'}`}>
                  <span className="text-2xl">{a.unlocked ? a.icon : '🔒'}</span>
                  <div className="min-w-0">
                    <p className="font-semibold text-text-primary">{a.title}</p>
                    <p className="text-xs text-text-secondary">{a.description}</p>
                  </div>
                  {a.unlocked && <span className="ml-auto text-success"><Line d={ic.check} cls="h-5 w-5" /></span>}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
