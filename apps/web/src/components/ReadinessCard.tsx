import { Link } from 'react-router-dom';
import { useLang } from '../i18n/LangContext';
import { useAuth } from '../auth/AuthContext';
import { api } from '../api/client';
import { useAsync } from '../api/useAsync';

function message(percent: number, seen: number, es: boolean): string {
  if (seen === 0)
    return es
      ? 'Practica para estimar tu preparación.'
      : 'Practice to estimate your readiness.';
  if (percent >= 90) return es ? '¡Estás listo! 🎉' : "You're ready! 🎉";
  if (percent >= 70) return es ? 'Casi listo.' : 'Almost ready.';
  if (percent >= 40) return es ? 'Buen avance, sigue así.' : 'Good progress, keep going.';
  return es ? 'Vas empezando — practica más temas.' : 'Just getting started — practice more.';
}

function barColor(percent: number): string {
  if (percent >= 70) return 'bg-green-500';
  if (percent >= 40) return 'bg-amber-500';
  return 'bg-slate-400';
}

export function ReadinessCard({ code }: { code: string }) {
  const { t, lang } = useLang();
  const { configured, email } = useAuth();
  const es = lang === 'ES';
  const { data, loading } = useAsync(
    () => (email ? api.getReadiness(code) : Promise.resolve(null)),
    [email, code],
  );

  // Sin sesión: invitación discreta.
  if (!email) {
    if (!configured) return null;
    return (
      <div className="mt-6 rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-600">
        <Link to="/entrar" className="font-medium text-slate-900 underline">
          Inicia sesión
        </Link>{' '}
        para ver tu {t('passProbability').toLowerCase()}.
      </div>
    );
  }

  if (loading || !data) return null;

  return (
    <div className="mt-6 rounded-lg border border-slate-200 bg-white p-5">
      <div className="flex items-baseline justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          {t('passProbability')}
        </h2>
        <span className="text-3xl font-bold text-slate-900">{data.percent}%</span>
      </div>
      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full ${barColor(data.percent)}`}
          style={{ width: `${data.percent}%` }}
        />
      </div>
      <p className="mt-3 text-sm text-slate-700">
        {message(data.percent, data.seen, es)}
      </p>
      <p className="mt-1 text-xs text-slate-400">
        {data.mastered} {es ? 'de' : 'of'} {data.total}{' '}
        {es ? 'preguntas dominadas' : 'questions mastered'}
      </p>
    </div>
  );
}
